#include "stdafx.h"
#include "DrawUtils.h"
#include "WebGL/WebGLTexelConversions.h"

#undef GL_APICALL
#undef EGLAPI
#include <libEGL/Display.h>

using namespace ATL;

inline egl::Display* GetCurrentEGLDisplay()
{
	EGLDisplay eglDisplay = eglGetCurrentDisplay();
	assert(eglDisplay);
	return static_cast<egl::Display*>(eglDisplay);
}

struct D3DState
{
	CComPtr<IDirect3DVertexBuffer9> boundVB;
	UINT boundOffset;
	UINT boundStride;
	CComPtr<IDirect3DVertexDeclaration9> boundVDecl;
	CComPtr<IDirect3DSurface9> boundRT;
	CComPtr<IDirect3DSurface9> boundDS;
	CComPtr<IDirect3DBaseTexture9> boundTex;
};

static HRESULT SaveD3DState( IDirect3DDevice9* device, D3DState& state )
{
	state.boundVB = nullptr;
	state.boundOffset = 0;
	state.boundStride = 0;
	state.boundVDecl = nullptr;
	state.boundRT = nullptr;
	state.boundDS = nullptr;
	state.boundTex = nullptr;

	V_RET(device->GetStreamSource(0, &state.boundVB, &state.boundOffset, &state.boundStride));
	V_RET(device->GetVertexDeclaration(&state.boundVDecl));
	V_RET(device->GetRenderTarget(0, &state.boundRT));
	V_RET(device->GetDepthStencilSurface(&state.boundDS));
	V_RET(device->GetTexture(0, &state.boundTex));

	return S_OK;
}

static HRESULT RestoreD3DState( IDirect3DDevice9* device, const D3DState& state )
{
	V_RET(device->SetStreamSource(0, state.boundVB, state.boundOffset, state.boundStride));
	V_RET(device->SetVertexDeclaration(state.boundVDecl));
	V_RET(device->SetRenderTarget(0, state.boundRT));
	V_RET(device->SetDepthStencilSurface(state.boundDS));
	V_RET(device->SetTexture(0, state.boundTex));
	return S_OK;
}

class D3DStateSaver
{
	D3DState state_;
	IDirect3DDevice9* device_;
public:
	D3DStateSaver(IDirect3DDevice9* device) : device_(device) { SaveD3DState(device_, state_); }
	~D3DStateSaver() { RestoreD3DState(device_, state_); }
};

//////////////////////////////////////////////////////////////////////////

static const ULONG GDITexelByteSize = 4; // AGRB or XRGB

static const CHAR* ImageConverterEffectCode =
	"void ImageConvPremultiplyVS(	in float2 inPos : POSITION,				"
	"					out float4 outPos : POSITION)						"
	"{																		"
	"	outPos = float4(inPos, 0.0f, 1.0f);									"
	"}																		"
	"																		"
	"float4 ImageConvPremultiplyPS() : COLOR0								"
	"{																		"
	"	return 0;															"
	"}																		"
	"																		"
	"float4 halfTexelSize : c0;												"
	"void ImageConvFlipVS(	in float2 inPos : POSITION,						"
	"					out float4 outPos : POSITION,						"
	"					out float2 outUV : TEXCOORD0)						"
	"{																		"
	"	outPos = float4(inPos - halfTexelSize.xy, 0.0f, 1.0f);				"
	"	outUV = (inPos + float2(1.0, 1.0)) * 0.5;							"
	"}																		"
	"																		"
	"sampler inputTexture : s0;												"
	"float4 ImageConvFlipPS( in float2 inUV : TEXCOORD0 ) : COLOR0			"
	"{																		"
	"	return tex2D(inputTexture, inUV);									"
	"}																		"
	"																		"
	"technique ImageConvTech												"
	"{																		"
	"    pass p0															"
	"    {																	"
	"		 AlphaTestEnable = false;										"
	"		 CullMode = none;												"
	"		 FillMode = solid;												"
	"		 ZEnable = false;												"
	"		 ZWriteEnable = false;											"
	"		 StencilEnable = false;											"
	"		 ColorWriteEnable = Red | Green | Blue | Alpha;					"
	"		 ScissorTestEnable = false;										"
	"		 AlphaBlendEnable = true;										"
	"		 SrcBlend = zero;												"
	"		 DestBlend = destalpha;											"
	"		 SeparateAlphaBlendEnable = true;								"
	"		 SrcBlendAlpha = zero;											"
	"		 DestBlendAlpha = one;											"
	"        VertexShader = compile vs_2_0 ImageConvPremultiplyVS();		"
	"        PixelShader = compile ps_2_0 ImageConvPremultiplyPS();			"
	"    }																	"
	"    pass p1															"
	"    {																	"
	"		 AlphaTestEnable = false;										"
	"		 CullMode = none;												"
	"		 FillMode = solid;												"
	"		 ZEnable = false;												"
	"		 ZWriteEnable = false;											"
	"		 StencilEnable = false;											"
	"		 ColorWriteEnable = Red | Green | Blue | Alpha;					"
	"		 AlphaBlendEnable = false;										"
	"        VertexShader = compile vs_2_0 ImageConvFlipVS();				"
	"        PixelShader = compile ps_2_0 ImageConvFlipPS();				"
	"																		"
	"        AddressU[0] = Clamp;											"
	"        AddressV[0] = Clamp;											"
	"        MagFilter[0] = Point;											"
	"        MinFilter[0] = Point;											"
	"        MipFilter[0] = None;											"
	"    }																	"
	"}																		";

ImageConverter::ImageConverter() : hwPremultiply_(FALSE)
{
}

HRESULT ImageConverter::Init()
{
	CComPtr<IDirect3DDevice9> device(GetCurrentEGLDisplay()->getDevice());

	static const FLOAT Vertices[] =
	{
		1.0f, 1.0f,
		1.0f,-1.0f,
		-1.0f, 1.0f,
		-1.0f,-1.0f
	};

	vb_ = nullptr;
	V_RET(device->CreateVertexBuffer(sizeof(Vertices), D3DUSAGE_WRITEONLY, 0, D3DPOOL_DEFAULT, &vb_, NULL));
	VOID* lockedData = NULL;
	V_RET(vb_->Lock(0, 0, &lockedData, 0));
	memcpy(lockedData, Vertices, sizeof(Vertices));
	V_RET(vb_->Unlock());

	static const D3DVERTEXELEMENT9 VertexElems[] =
	{
		{ 0, 0, D3DDECLTYPE_FLOAT2, D3DDECLMETHOD_DEFAULT, D3DDECLUSAGE_POSITION, 0 },
		D3DDECL_END()
	};

	vDecl_ = nullptr;
	V_RET(device->CreateVertexDeclaration(VertexElems, &vDecl_));

	effect_ = nullptr;
	V_RET(D3DXCreateEffect(device, (LPVOID)ImageConverterEffectCode, (UINT)strlen(ImageConverterEffectCode),
		NULL, NULL, NULL, NULL, &effect_, NULL));

	D3DCAPS9 caps;
	V_RET(device->GetDeviceCaps(&caps));
	hwPremultiply_ = (caps.DestBlendCaps & D3DPBLENDCAPS_DESTALPHA) && (caps.PrimitiveMiscCaps & D3DPMISCCAPS_SEPARATEALPHABLEND);

	return S_OK;
}

HRESULT ImageConverter::Resize(ULONG width, ULONG height)
{
	egl::Display* eglDisplay = GetCurrentEGLDisplay();
	CComPtr<IDirect3DDevice9> device(eglDisplay->getDevice());

	flipTex_ = nullptr;
	V_RET(device->CreateTexture(width, height, 1, D3DUSAGE_RENDERTARGET, D3DFMT_A8R8G8B8, D3DPOOL_DEFAULT, &flipTex_, nullptr));
	return S_OK;
}

void ImageConverter::Destroy()
{
	vb_ = nullptr;
	vDecl_ = nullptr;
	nonMultisampledRTSurface_ = nullptr;
	offscreenSurface_ = nullptr;
	effect_ = nullptr;
}

HRESULT ImageConverter::GPUPremultiply(IDirect3DSurface9* surf)
{
	if (surf == NULL)
		return E_INVALIDARG;

	egl::Display* eglDisplay = GetCurrentEGLDisplay();
	CComPtr<IDirect3DDevice9> device(eglDisplay->getDevice());

	{
		D3DStateSaver stateSaver(device);

		V_RET(device->SetStreamSource(0, vb_, 0, sizeof(FLOAT) * 2));
		V_RET(device->SetVertexDeclaration(vDecl_));
		V_RET(device->SetRenderTarget(0, surf));
		V_RET(device->SetDepthStencilSurface(NULL));

		UINT passes = 0;
		V_RET(effect_->Begin(&passes, 0));
		V_RET(effect_->BeginPass(0));

		eglDisplay->startScene();
		V_RET(device->DrawPrimitive(D3DPT_TRIANGLESTRIP, 0, 2));
		eglDisplay->endScene();

		V_RET(effect_->EndPass());
		V_RET(effect_->End());
	}
	return S_OK;
}

HRESULT ImageConverter::GPUBlit(IDirect3DSurface9* dest, IDirect3DSurface9* src, BOOL flipY)
{
	egl::Display* eglDisplay = GetCurrentEGLDisplay();
	CComPtr<IDirect3DDevice9> device(eglDisplay->getDevice());
	if (!flipY)
	{
		return device->StretchRect(src, nullptr, dest, nullptr, D3DTEXF_POINT);
	}
	else
	{
		D3DSURFACE_DESC srcDesc;
		src->GetDesc(&srcDesc);

		D3DSURFACE_DESC destDesc;
		dest->GetDesc(&destDesc);

		D3DSURFACE_DESC texDesc;
		memset(&texDesc, 0, sizeof(texDesc));

		if (!flipTex_)
			return E_FAIL;

		flipTex_->GetLevelDesc(0, &texDesc);
		if (texDesc.Width != srcDesc.Width || texDesc.Height != srcDesc.Height)
			return E_FAIL;

		CComPtr<IDirect3DSurface9> flipSurf;
		flipTex_->GetSurfaceLevel(0, &flipSurf);

		D3DStateSaver stateSaver(device);

		UINT passes = 0;
		V_RET(effect_->Begin(&passes, 0));
		V_RET(effect_->BeginPass(1));

		V_RET(device->StretchRect(src, nullptr, flipSurf, nullptr, D3DTEXF_POINT));
		
		V_RET(device->SetVertexDeclaration(vDecl_));
		V_RET(device->SetStreamSource(0, vb_, 0, sizeof(FLOAT) * 2));
		V_RET(device->SetRenderTarget(0, dest));
		V_RET(device->SetDepthStencilSurface(nullptr));
		V_RET(device->SetTexture(0, flipTex_));

		D3DVIEWPORT9 vp;
		vp.X = 0;
		vp.Y = 0;
		vp.Width = destDesc.Width;
		vp.Height = destDesc.Height;
		vp.MinZ = 0.0;
		vp.MaxZ = 1.0;

		V_RET(device->SetViewport(&vp));

		float halfTexelSize[4] = { 0.5f/texDesc.Width, -0.5f/texDesc.Height, 0.0f, 0.0f };
		V_RET(device->SetVertexShaderConstantF(0, halfTexelSize, 1));

		eglDisplay->startScene();
		V_RET(device->DrawPrimitive(D3DPT_TRIANGLESTRIP, 0, 2));
		eglDisplay->endScene();

		V_RET(effect_->EndPass());
		V_RET(effect_->End());

		return S_OK;
	}
}

HRESULT ImageConverter::ReadBackPixels(IDirect3DSurface9* surf, BYTE* outData, ULONG outDataByteSize, BOOL premultiply,
	BOOL flipY/* = FALSE*/, BOOL bgra/* = FALSE*/ )
{
	if (!surf)
		return E_INVALIDARG;

	D3DSURFACE_DESC desc;
	memset(&desc, 0, sizeof(desc));
	surf->GetDesc(&desc);
	if (desc.Format != D3DFMT_A8R8G8B8 && desc.Format != D3DFMT_X8R8G8B8)
		return E_FAIL;

	if (outData == NULL || outDataByteSize < desc.Width*desc.Height*GDITexelByteSize)
		return E_INVALIDARG;

	CComPtr<IDirect3DDevice9> device(GetCurrentEGLDisplay()->getDevice());
	assert(device);

	ATL::CComPtr<IDirect3DSurface9> readSurf = surf;
	if (desc.MultiSampleType != D3DMULTISAMPLE_NONE)
	{
		D3DSURFACE_DESC rtDesc;
		memset(&rtDesc, 0, sizeof(rtDesc));

		if (nonMultisampledRTSurface_) nonMultisampledRTSurface_->GetDesc(&rtDesc);
		if (rtDesc.Width != desc.Width || rtDesc.Height != desc.Height)
		{
			nonMultisampledRTSurface_ = nullptr;
			V_RET(device->CreateRenderTarget(desc.Width, desc.Height, D3DFMT_A8R8G8B8, D3DMULTISAMPLE_NONE, 0, FALSE, &nonMultisampledRTSurface_, nullptr));
		}
		V_RET(GPUBlit(nonMultisampledRTSurface_, surf, FALSE));
		readSurf = nonMultisampledRTSurface_;
	}

	if ( premultiply && hwPremultiply_ )
	{
		V_RET(GPUPremultiply(readSurf));
	}

	D3DSURFACE_DESC osDesc;
	memset(&osDesc, 0, sizeof(osDesc));

	if (offscreenSurface_) offscreenSurface_->GetDesc(&osDesc);
	if (osDesc.Width != desc.Width || osDesc.Height != desc.Height)
	{
		offscreenSurface_ = nullptr;
		V_RET(device->CreateOffscreenPlainSurface(desc.Width, desc.Height, desc.Format, D3DPOOL_SYSTEMMEM, &offscreenSurface_, nullptr));
	}
	
	V_RET(device->GetRenderTargetData(readSurf, offscreenSurface_));

	D3DLOCKED_RECT lock = { 0 };
	V_RET(offscreenSurface_->LockRect(&lock, NULL, D3DLOCK_READONLY));

	// need to y-flip if non-flipped image requested, because D3D renders flipped image in GL terminology.
	ConvertImageExt(desc.Width, desc.Height, (premultiply && !hwPremultiply_) ? MultiplyOp::Premultiply : MultiplyOp::None, lock.Pitch, 1, flipY,
		TexelFormat::RGBA8888, (BYTE*)lock.pBits, bgra ? TexelFormat::BGRA8888 : TexelFormat::RGBA8888, outData);
		
	V_RET(offscreenSurface_->UnlockRect());

	return S_OK;
}

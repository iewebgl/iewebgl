// WebGLPlugin.cpp : Implementation of CWebGLPlugin
#include "stdafx.h"
#include "WebGLPlugin.h"
#include "PluginUtils.h"
#include "InvokeHelper.h"

#include "TypedArray/TypedArrayMaker.h"
#include "TypedArray/DataArrayView.h"

#include "WebGL/WebGLTexelConversions.h"

#include "TlsData.h"

#include <shlguid.h>
#include <Shlobj.h>
#include <mshtml.h>
#include <wininet.h>
#include <urlmon.h>
#include <msxml2.h>
#include <atlenc.h>

#include <Wincodec.h>

#undef GL_APICALL
#undef EGLAPI
#include <libEGL/Display.h>
#include <libEGL/Surface.h>

#pragma comment(lib, "dxguid.lib")
#pragma comment(lib, "d3d9.lib")
#pragma comment(lib, "d3dx9.lib")
#pragma comment(lib, "d3dcompiler.lib")

#pragma comment(lib, "Dwmapi.lib")
#pragma comment(lib, "msimg32.lib")
#pragma comment(lib, "msxml2.lib")
#pragma comment(lib, "WindowsCodecs.lib")

#ifndef _WIN64
#pragma comment(lib, "Urlmon.lib")
#else
#pragma comment(lib, "Urlmon_amd64.lib")
#endif

// CWebGLPlugin

HRESULT AddProperty(CComPtr<IDispatchEx> disp, const _bstr_t& name, IID iid, JSObjectMakeFunction maker, JSObjectConstPropFunction props);
HRESULT InitGlobalBuffers(CComPtr<IDispatch> dispEx);
HRESULT UninitGlobalBuffers();
HRESULT DecodeTextureFile( CAtlArray<BYTE>& fileData, ULONG& width, ULONG& height, CAtlArray<BYTE>& pixels, TexelFormat::Format& fmt);
HRESULT ExceptionMaker(DISPPARAMS& params, CComVariant& result)
{
	return DISP_E_EXCEPTION;
}

inline egl::Display* GetCurrentEGLDisplay()
{
	EGLDisplay eglDisplay = eglGetCurrentDisplay();
	assert(eglDisplay);
	return static_cast<egl::Display*>(eglDisplay);
}

inline egl::Surface* GetCurrentEGLSurface()
{
	EGLSurface eglSurf = eglGetCurrentSurface(EGL_DRAW);
	assert(eglSurf);
	return static_cast<egl::Surface *>(eglSurf);
};


//////////////////////////////////////////////////////////////////////////

CWebGLPlugin::CWebGLPlugin() :
ctxWidth_(0),
ctxHeight_(0),
invalidated_(false),
localContentAllowed_(false),
showBanner_(FALSE),
deviceLostHandled_(FALSE)
{
	wchar_t buf[MAX_PATH] = {0};
	::SHGetFolderPath(NULL, CSIDL_WINDOWS, NULL, SHGFP_TYPE_DEFAULT, buf);
	CAtlStringW path = buf; 
	path += L"\\IEWebGLAllowLocalContent";
	if ( PathFileExists(path.GetString()) )
	{
		localContentAllowed_ = true;
	}

	m_bWindowOnly = FALSE;
	m_bWndLess = TRUE;
	/* unstable - require research
	path = buf; 
	path += L"\\IEWebGLEnableGraphicsDebugging";
	if ( PathFileExists(path.GetString()) )
	{
		m_bWindowOnly = TRUE;
	}
	*/

	drawRect_.left = 0;
	drawRect_.top = 0;
	drawRect_.right = 300;
	drawRect_.bottom = 150;

	AppendTLSData();
}

CWebGLPlugin::~CWebGLPlugin()
{

}

HRESULT CWebGLPlugin::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(DispImpl::_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}

CComPtr<IDocumentEvent> CWebGLPlugin::GetDocEvent()
{
	CComQIPtr<IOleControlSite> controlSite(m_spClientSite);

	CComPtr<IDispatch> dispControl;
	if ( FAILED(controlSite->GetExtendedControl(&dispControl)) )
	{
		return nullptr;
	}

	CComQIPtr<IHTMLElement> htmlElement(dispControl);
	
	CComPtr<IDispatch> doc;
	if ( FAILED(htmlElement->get_document(&doc)) )
	{
		return nullptr;
	}

	CComQIPtr<IHTMLDocument2> htmlDocument2(doc);
	if (!htmlDocument2)
		return nullptr;

	CComQIPtr<IDocumentEvent> docEvent(htmlDocument2);
	return docEvent;
}

CComPtr<IEventTarget> CWebGLPlugin::GetEventTarget()
{
	CComQIPtr<IOleControlSite> controlSite(m_spClientSite);

	CComPtr<IDispatch> dispControl;
	if ( FAILED(controlSite->GetExtendedControl(&dispControl)) )
	{
		return nullptr;
	}

	CComQIPtr<IHTMLElement> htmlElement(dispControl);

	CComQIPtr<IEventTarget> eventTarget(htmlElement);
	return eventTarget;
}

CComPtr<IHTMLObjectElement> CWebGLPlugin::GetHTMLObjectElement()
{
	CComQIPtr<IOleControlSite> controlSite(m_spClientSite);

	CComPtr<IDispatch> dispControl;
	if ( FAILED(controlSite->GetExtendedControl(&dispControl)) )
	{
		return nullptr;
	}

	CComQIPtr<IHTMLObjectElement> htmlElement(dispControl);
	return htmlElement;
}

CComPtr<IDispatchEx> CWebGLPlugin::GetHTMLWindow()
{
	CComPtr<IHTMLWindow2> htmlWindow;
	CComQIPtr<IOleControlSite> controlSite(m_spClientSite);

	CComPtr<IDispatch> dispControl;
	if ( FAILED(controlSite->GetExtendedControl(&dispControl)) )
		return nullptr;

	CComQIPtr<IHTMLElement> htmlElement(dispControl);

	CComPtr<IDispatch> doc;
	if ( FAILED(htmlElement->get_document(&doc)) )
		return nullptr;

	CComQIPtr<IHTMLDocument2> htmlDocument2(doc);
	if (!htmlDocument2)
		return nullptr;

	if ( FAILED(htmlDocument2->get_parentWindow(&htmlWindow)) )
		return nullptr;

	return CComQIPtr<IDispatchEx>(htmlWindow);
}

HRESULT CWebGLPlugin::OnContextLost()
{
	imgConv_.Destroy();

	if (dxCtx_.surfacePresenter)
		dxCtx_.surfacePresenter = nullptr;

	return S_OK;
}

HRESULT CWebGLPlugin::OnGDIContextReset()
{
	egl::Surface* surf = GetCurrentEGLSurface();

	V_RET(imgConv_.Init());

	return S_OK;
}

HRESULT CWebGLPlugin::OnDXContextReset()
{
	V_RET(imgConv_.Init());

	V_RET(ResizeDXContext(ctxWidth_, ctxHeight_));

	return S_OK;
}

HRESULT CWebGLPlugin::CheckContextLost()
{
	if (GetCurrentEGLDisplay() && GetCurrentEGLDisplay()->isDeviceLost())
	{
		V_RET(OnContextLost());
		DispatchEvent(L"webglcontextlost", L"");

		glContext_->ResetLostContext();

		if (dxCtx_.d3dDevice)
		{
			V_RET(OnDXContextReset());
		}
		else
		{
			V_RET(OnGDIContextReset());
		}
		
		DispatchEvent(L"webglcontextrestored", L"");
	}
	return TRUE;
}

STDMETHODIMP CWebGLPlugin::SetClientSite( IOleClientSite* pClientSite )
{
	bool isInit = !m_spClientSite && pClientSite;
	bool isUninit = m_spClientSite && !pClientSite;

	V_RET(IOleObjectImpl<CWebGLPlugin>::SetClientSite(pClientSite));

	if (isInit)
	{
		V_RET(InitDispEx());

		CComQIPtr<IDispatchEx> dispEx(GetHTMLWindow());
		if (!dispEx)
			return E_FAIL;

		V_RET(InitGlobalBuffers(CComPtr<IDispatch>(dispEx)));
		
		V_RET(AddProperty(dispEx, L"ArrayBuffer", __uuidof(IArrayBuffer), ArrayBufferMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"Uint8Array", __uuidof(IUint8Array), TypedArrayMaker<unsigned char>, TypedArrayConstProperties<unsigned char>));
		V_RET(AddProperty(dispEx, L"Int8Array", __uuidof(IInt8Array), TypedArrayMaker<char>, TypedArrayConstProperties<char>));
		V_RET(AddProperty(dispEx, L"Uint16Array", __uuidof(IUint16Array), TypedArrayMaker<unsigned short>, TypedArrayConstProperties<unsigned short>));
		V_RET(AddProperty(dispEx, L"Int16Array", __uuidof(IInt16Array), TypedArrayMaker<signed short>, TypedArrayConstProperties<signed short>));
		V_RET(AddProperty(dispEx, L"Uint32Array", __uuidof(IUint32Array), TypedArrayMaker<unsigned int>, TypedArrayConstProperties<unsigned int>));
		V_RET(AddProperty(dispEx, L"Int32Array", __uuidof(IInt32Array), TypedArrayMaker<signed int>, TypedArrayConstProperties<signed int>));
		V_RET(AddProperty(dispEx, L"Float32Array", __uuidof(IFloat32Array), TypedArrayMaker<float>, TypedArrayConstProperties<float>));
		V_RET(AddProperty(dispEx, L"Float64Array", __uuidof(IFloat64Array), TypedArrayMaker<double>, TypedArrayConstProperties<double>));
		V_RET(AddProperty(dispEx, L"DataView", __uuidof(IDataArrayView), TypedArrayMaker<void>, NoTypeProperties));

		V_RET(AddProperty(dispEx, L"WebGLRenderingContext", __uuidof(IWebGLRenderingContext), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLContextAttributes", __uuidof(IWebGLContextAttributes), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLActiveInfo", __uuidof(IWebGLActiveInfo), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLShader", __uuidof(IWebGLShader), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLProgram", __uuidof(IWebGLProgram), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLBuffer", __uuidof(IWebGLBuffer), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLTexture", __uuidof(IWebGLTexture), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLRenderbuffer", __uuidof(IWebGLRenderbuffer), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLFramebuffer", __uuidof(IWebGLFramebuffer), ExceptionMaker, NoTypeProperties));
		V_RET(AddProperty(dispEx, L"WebGLUniformLocation", __uuidof(IWebGLUniformLocation), ExceptionMaker, NoTypeProperties));

		V_RET(AddProperty(dispEx, L"UTF8Decoder", __uuidof(IDispatch), UTF8DecoderMaker, NoTypeProperties));

		((TlsData*)TlsGetValue(g_TlsIdx))->clientSite = pClientSite;
	}
	
	if (isUninit)
	{
		innerCanvas_ = nullptr;
		imageCanvas_ = nullptr;
				
		imgConv_.Destroy();

		if (glContext_)
		{
			glContext_->Uninit();
			glContext_ = nullptr;
		}


		V_RET(DestroyDXContext());
		if ( !DestroyGDIContext() )
			return E_FAIL;
				
		V_RET(UninitGlobalBuffers());
	}

	return S_OK;
}

LRESULT CWebGLPlugin::OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& bHandled)
{
	bHandled = FALSE;

	if (m_bWndLess)
		return 0;

	if (glContext_)
	{
		glContext_->DeleteEGLSurface();
		glContext_->CreateEGLSurface();
	}
	
	return 0;
}

STDMETHODIMP CWebGLPlugin::SetObjectRects(LPCRECT prcPos,LPCRECT prcClip)
{
	IOleInPlaceObjectWindowlessImpl<CWebGLPlugin>::SetObjectRects(prcPos, prcClip);

	if (prcPos && prcPos->right - prcPos->left > 0 && prcPos->bottom - prcPos->top > 0)
	{
		drawRect_ = *prcPos;

		if (glContext_ && !glContext_->IsContextLost() )
		{
			const ULONG CurWidth = Max(1l, drawRect_.right-drawRect_.left);
			const ULONG CurHeight = Max(1l, drawRect_.bottom-drawRect_.top);
			if (CurWidth != ctxWidth_ || CurHeight != ctxHeight_)
			{
				V_RET(glContext_->ResizePrimarySurface((USHORT)CurWidth, (USHORT)CurHeight));
				V_RET(AdjustDrawCtxSize());
			}
		}
	}

	return S_OK;
}

HRESULT CWebGLPlugin::CreateDXContext()
{
	CComQIPtr<IViewObjectPresentSite> presentSite(m_spClientSite);
	CComQIPtr<IViewObjectPresentNotifySite> presentNotifySite(m_spClientSite);
	if (!presentSite)
		return E_FAIL;

	BOOL isHWComposer;
	presentSite->IsHardwareComposition(&isHWComposer);
	if (!isHWComposer)
		return E_FAIL;

	EGLDisplay eglDisplay = eglGetCurrentDisplay();
	if (!eglDisplay)
		return E_FAIL;

	egl::Display *display = static_cast<egl::Display*>(eglDisplay);
	dxCtx_.d3dDevice = display->getDevice();
	dxCtx_.presentSite = presentSite;
	dxCtx_.presentNotifySite = presentNotifySite;
	dxCtx_.presentSite->SetCompositionMode(VIEW_OBJECT_COMPOSITION_MODE_SURFACEPRESENTER);

	V_RET(imgConv_.Init());

	return S_OK;
}

HRESULT CWebGLPlugin::ResizeDXContext(ULONG width, ULONG height)
{
	CComPtr<ISurfacePresenter> curPresenter = dxCtx_.surfacePresenter;
	CComPtr<IDirect3DTexture9> curTex;
	if (curPresenter)
	{
		V_RET(curPresenter->GetBuffer(0, __uuidof(IDirect3DTexture9), (void**)&curTex));
	}
		
	dxCtx_.surfacePresenter = nullptr;

	V_RET(dxCtx_.presentSite->CreateSurfacePresenter(dxCtx_.d3dDevice, width, height, 1,
		DXGI_FORMAT_B8G8R8A8_UNORM, VIEW_OBJECT_ALPHA_MODE_PREMULTIPLIED, &dxCtx_.surfacePresenter));

	if (curPresenter)
	{
		CComPtr<IDirect3DTexture9> newTex;
		V_RET(dxCtx_.surfacePresenter->GetBuffer(0, __uuidof(IDirect3DTexture9), (void**)&newTex));

		CComPtr<IDirect3DSurface9> curSurf, newSurf;
		V_RET(curTex->GetSurfaceLevel(0, &curSurf));
		V_RET(newTex->GetSurfaceLevel(0, &newSurf));

		dxCtx_.d3dDevice->StretchRect(curSurf, nullptr, newSurf, nullptr, D3DTEXF_LINEAR);
	}

	ctxWidth_ = width;
	ctxHeight_ = height;

	V_RET(imgConv_.Resize(width, height));
	V_RET(CopyDXFrame());

	invalidated_ = false; // now wait for JS frame update to present new content, rendered to resized surface

	return S_OK;
}

HRESULT CWebGLPlugin::CopyDXFrame()
{
	CComPtr<IDirect3DSurface9> eglD3DSurface;
	eglD3DSurface.Attach(glContext_->GetPrimarySurfaceD3DPtr());
	if (!eglD3DSurface)
		return S_OK;

	CComPtr<IDirect3DTexture9> hostTex;
	if ( SUCCEEDED(dxCtx_.surfacePresenter->GetBuffer(0, __uuidof(IDirect3DTexture9), (void**)&hostTex)) )
	{
		CComPtr<IDirect3DSurface9> hostSurf;
		hostTex->GetSurfaceLevel(0, &hostSurf);

		if (glContext_->IsAlphaSurface() && !glContext_->IsPremultipliedContent() )
		{
			imgConv_.GPUPremultiply(eglD3DSurface);
			imgConv_.GPUBlit(hostSurf, eglD3DSurface, TRUE);
		}
		else
		{
			imgConv_.GPUBlit(hostSurf, eglD3DSurface, TRUE);
		}

		if ( !glContext_->IsPreserveDrawBuffer())
		{
			V_RET(glContext_->ClearPrimarySurface());
		}
	}

	return S_OK;
}

HRESULT CWebGLPlugin::DrawDXContext()
{
	if (!dxCtx_.surfacePresenter)
		return S_OK;

	if (!glContext_)
		return S_OK;

	glContext_->CleanupOldResources();

	if ( FAILED(glContext_->MakeCurrent()) )
		return S_OK;

	if ( FAILED(CheckContextLost()) )
		return S_OK;

	if (!invalidated_)
	{
		V_RET(dxCtx_.surfacePresenter->Present(0, nullptr));
		return S_OK;
	}

	V_RET(CopyDXFrame());

	V_RET(dxCtx_.surfacePresenter->Present(0, nullptr));
	invalidated_ = false;

	return S_OK;
}

HRESULT CWebGLPlugin::DestroyDXContext()
{
	dxCtx_.presentSite = nullptr;
	dxCtx_.presentNotifySite = nullptr;
	dxCtx_.surfacePresenter = nullptr;

	dxCtx_.d3dDevice = nullptr;

	return S_OK;
}

HRESULT CWebGLPlugin::AdjustDrawCtxSize()
{
	ULONG width = 300;
	ULONG height = 150;

	if (glContext_)
	{
		width = glContext_->GetPrimarySurfaceWidth();
		height = glContext_->GetPrimarySurfaceHeight();
	}
	else
	{
		width = drawRect_.right - drawRect_.left;
		height = drawRect_.bottom - drawRect_.top;
	}

	if (width == ctxWidth_ && height == ctxHeight_)
		return S_OK;
	
	if (dxCtx_.presentSite)
	{
		V_RET(ResizeDXContext(width, height));
	}
	else
	{
		if (!ResizeGDIContext(width, height))
			return E_FAIL;
	}

	return S_OK;
}

STDMETHODIMP CWebGLPlugin::OnPreRender( void )
{
	return DrawDXContext();
}

BOOL CWebGLPlugin::CreateGDIContext()
{
	EGLSurface eglSurf = eglGetCurrentSurface(EGL_DRAW);
	if (!eglSurf)
		return FALSE;

	egl::Surface* surf = static_cast<egl::Surface *>(eglSurf);

	gdiCtx_.dc = CreateCompatibleDC(nullptr);

	if ( FAILED(imgConv_.Init()) )
		return FALSE;

	gdiCtx_.dib = nullptr;
	gdiCtx_.sectionBits = nullptr;
	return gdiCtx_.dc != nullptr;
}

BOOL CWebGLPlugin::ResizeGDIContext(ULONG width, ULONG height)
{
	assert(gdiCtx_.dc);
	HBITMAP curBMP = gdiCtx_.dib;
	void * curBits = gdiCtx_.sectionBits;
	BITMAPINFO curBmi = {0};
	curBmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
	curBmi.bmiHeader.biWidth = ctxWidth_;
	curBmi.bmiHeader.biHeight = ctxHeight_;
	curBmi.bmiHeader.biPlanes = 1;
	curBmi.bmiHeader.biBitCount = 32;
	curBmi.bmiHeader.biCompression = BI_RGB;
	curBmi.bmiHeader.biSizeImage = ctxWidth_ * ctxHeight_ * 4;

	BITMAPINFO bmi = {0};
	bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
	bmi.bmiHeader.biWidth = width;
	bmi.bmiHeader.biHeight = height;
	bmi.bmiHeader.biPlanes = 1;
	bmi.bmiHeader.biBitCount = 32;
	bmi.bmiHeader.biCompression = BI_RGB;
	bmi.bmiHeader.biSizeImage = width * height * 4;

	gdiCtx_.dib = CreateDIBSection(gdiCtx_.dc, &bmi, DIB_RGB_COLORS, (void**)&gdiCtx_.sectionBits, NULL, 0x0);
	if (gdiCtx_.dib)
	{
		ctxWidth_ = width;
		ctxHeight_ = height;
		SelectObject(gdiCtx_.dc, gdiCtx_.dib);
	}
	
	if (curBMP)
	{
		StretchDIBits(gdiCtx_.dc, 0, 0, width, height, 0, 0, curBmi.bmiHeader.biWidth, curBmi.bmiHeader.biHeight, curBits, &curBmi, DIB_RGB_COLORS, SRCCOPY);
		DeleteObject(curBMP);
	}

	CopyGDIFrame();
	invalidated_ = false; // now wait for JS frame update to present new content, rendered to resized surface

	return gdiCtx_.dib != nullptr;
}

BOOL CWebGLPlugin::CopyGDIFrame()
{
	CComPtr<IDirect3DSurface9> eglD3DSurface;
	eglD3DSurface.Attach(glContext_->GetPrimarySurfaceD3DPtr());
	
	BOOL premultiply = glContext_->IsAlphaSurface() && !glContext_->IsPremultipliedContent();

	imgConv_.ReadBackPixels(eglD3DSurface, (BYTE*)gdiCtx_.sectionBits, ctxWidth_*ctxHeight_*4, premultiply);

	return TRUE;
}

BOOL CWebGLPlugin::DrawGDIContext(ATL_DRAWINFO& di)
{
	RECT& rc = *(RECT*)di.prcBounds;

	if (!glContext_)
		return TRUE;

	glContext_->CleanupOldResources();

	if ( FAILED(glContext_->MakeCurrent()) )
		return TRUE;

	if ( FAILED(CheckContextLost()) )
		return TRUE;

	if (invalidated_) {
		if (!CopyGDIFrame())
			return FALSE;
	}

	const ULONG DestWidth = rc.right-rc.left;
	const ULONG DestHeight = rc.bottom-rc.top;
	if (glContext_->IsAlphaSurface())
	{
		BLENDFUNCTION bf = {0};
		bf.BlendOp = AC_SRC_OVER;
		bf.BlendFlags = 0;
		bf.SourceConstantAlpha = 255;
		bf.AlphaFormat = AC_SRC_ALPHA;

		AlphaBlend(di.hdcDraw, rc.left, rc.top, DestWidth, DestHeight, gdiCtx_.dc, 0, 0, ctxWidth_, ctxHeight_, bf);
	}
	else
	{
		StretchBlt(di.hdcDraw, rc.left, rc.top, DestWidth, DestHeight, gdiCtx_.dc, 0, 0, ctxWidth_, ctxHeight_, SRCCOPY);
	}
	
	if ( !glContext_->IsPreserveDrawBuffer() )
	{
		if ( FAILED(glContext_->ClearPrimarySurface()) )
			return FALSE;
	}

	invalidated_ = false;

	return TRUE;
}

BOOL CWebGLPlugin::DestroyGDIContext()
{
	imgConv_.Destroy();

	DeleteObject(gdiCtx_.dib);
	DeleteDC(gdiCtx_.dc);

	gdiCtx_.dc = nullptr;
	gdiCtx_.dib = nullptr;
	gdiCtx_.sectionBits = nullptr;
	return TRUE;
}

HRESULT CWebGLPlugin::OnDrawAdvanced( ATL_DRAWINFO& di )
{
	if (!m_bWndLess)
	{
		if (glContext_)
		{
			glContext_->SwapBuffers();
			invalidated_ = false;
		}
		return S_OK;
	}

	if ( DrawGDIContext(di) )
		return S_OK;

	return E_FAIL;
}

STDMETHODIMP CWebGLPlugin::Invalidate()
{
	if (invalidated_)
		return S_OK;

	if (!m_bWndLess)
	{
		InvalidateRect(nullptr);
	}
	else if (!dxCtx_.presentNotifySite)
	{
		CComQIPtr<IOleInPlaceSiteWindowless> site(m_spClientSite);
		if (site)
		{
			site->InvalidateRect(nullptr, FALSE);
		}
		else
		{
			InvalidateRect(nullptr);
		}
	}
	else
	{
		dxCtx_.presentNotifySite->RequestFrame();
	}

	invalidated_ = true;
	return S_OK;
}

void CWebGLPlugin::FinalRelease()
{
	if(glContext_) {
		glContext_->Uninit();
	}
}

STDMETHODIMP CWebGLPlugin::GetScriptContext(CComPtr<IDispatchEx>& retVal)
{
	retVal = GetHTMLWindow();
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::GetCanvas( CComPtr<IHTMLCanvasElement>& retVal )
{
	CComPtr<IHTMLCanvasElement> cnv;

	V_RET(GetInnerCanvas(cnv));
	retVal = cnv;

	return S_OK;
}

STDMETHODIMP CWebGLPlugin::CreateJSObject(CComPtr<IDispatchEx>& retVal)
{
	auto htmlWindow = GetHTMLWindow();
	if (!htmlWindow)
		return E_FAIL;

	V_RET(::CreateJSObject(L"Object", htmlWindow, retVal));

	return S_OK;
}

static BOOL GetSrcURLFromHTMLObject( CComPtr<IDispatch> htmlObject, CComBSTR& outSrcURL )
{
	CComVariant result;
	if (SUCCEEDED(InvokeHelper(htmlObject, L"src", DISPATCH_PROPERTYGET, result)))
	{
		if (result.vt == VT_BSTR && result.bstrVal)
		{
			outSrcURL = result.bstrVal;
			return TRUE;
		}
	}
	return FALSE;
}

STDMETHODIMP CWebGLPlugin::GetHTMLObjectData( CComPtr<IDispatch> htmlObject, CAtlArray<BYTE>& pixelData, ULONG format, ULONG& width, ULONG& height )
{
	width = 0;
	height = 0;
	// htmlObject: HTMLImageElement, HTMLCanvasElement, HTMLVideoElement, ImageData, IEWebGL HTMLObjectElement
	CComQIPtr<IHTMLElement> element(htmlObject);
	CComQIPtr<IHTMLImgElement> imgElement(htmlObject);
	CComQIPtr<IHTMLObjectElement> objElement(htmlObject);
	CComQIPtr<IHTMLVideoElement> videoElement(htmlObject);
	CComQIPtr<ICanvasImageData> imageData(htmlObject);

	if (imgElement && HasAlphaChannel(format))
		return E_FAIL; // drawing image with alpha channel to canvas and getting pixels can loose channel data, because of premultiplied alpha.

	if (element)
	{
		/*CComBSTR srcURL;
		if (GetSrcURLFromHTMLObject(htmlObject, srcURL) && !IsSameDomain(GetHTMLWindow(), srcURL))
			return DISP_E_EXCEPTION;*/

		CComVariant var;
		if (videoElement)
		{
			V_RET(htmlObject.GetPropertyByName(L"videoWidth", &var));
			V_RET(var.ChangeType(VT_UI4));
			width = var.ulVal;

			V_RET(htmlObject.GetPropertyByName(L"videoHeight", &var));
			V_RET(var.ChangeType(VT_UI4));
			height = var.ulVal;
		}
		else if (objElement)
		{
			BSTR type;
			objElement->get_type(&type);
			CComBSTR comType, pluginType(L"application/x-webgl");
			comType.Attach(type); type = nullptr;
			V_RET(comType.ToLower());
			if (comType != pluginType)
				return E_FAIL;

			CComPtr<IDispatch> disp(objElement);
			CComVariant ret;
			V_RET(disp.Invoke1(L"getContext", &CComVariant(L"webgl"), &ret));
			
			CComQIPtr<IWebGLRenderingContext> ctx(ret.pdispVal);
			if (!ctx)
				return E_FAIL;

			V_RET(ctx->get_drawingBufferWidth(&width));
			V_RET(ctx->get_drawingBufferHeight(&height));

			IArrayBufferViewPtr arr;
			V_RET(CreateTypedArrayView<Uint32ArrayType>(CComVariant(width*height), CComVariant(), CComVariant(), arr));
			V_RET(ctx->readPixels(0, 0, width, height, GL_RGBA, GL_UNSIGNED_BYTE, arr));

			BYTE * mem = nullptr;
			V_RET(arr->get_mem(&mem));
			ULONG length = 0;
			V_RET(arr->get_byteLength(&length));

			pixelData.SetCount(length);
			memcpy(pixelData.GetData(), mem, length);
			return S_OK;
		}
		else
		{
			V_RET(htmlObject.GetPropertyByName(L"width", &var));
			V_RET(var.ChangeType(VT_UI4));
			width = var.ulVal;

			V_RET(htmlObject.GetPropertyByName(L"height", &var));
			V_RET(var.ChangeType(VT_UI4));
			height = var.ulVal;
		}

		CComPtr<IHTMLCanvasElement> cnv;
		V_RET(GetImageCanvas(cnv));
		V_RET(cnv->put_width(width));
		V_RET(cnv->put_height(height));

		CComPtr<ICanvasRenderingContext2D> ctx;
		V_RET(cnv->getContext(L"2d", &ctx));

		V_RET(ctx->drawImage(htmlObject, CComVariant(0), CComVariant(0),
			CComVariant(), CComVariant(), CComVariant(), CComVariant(), CComVariant(), CComVariant()));

		V_RET(ctx->getImageData(0, 0, (float)width, (float)height, &imageData));
	}
	
	if (!imageData)
		return E_INVALIDARG;

	V_RET(imageData->get_width(&width));
	V_RET(imageData->get_height(&height));

	CComVariant pixelDataVar;
	V_RET(imageData->get_data(&pixelDataVar));
	if (pixelDataVar.vt != VT_DISPATCH)
		return E_FAIL;

	CComQIPtr<ICanvasPixelArrayData> pixelDataArray(pixelDataVar.pdispVal);
	if (!pixelDataArray)
		return E_FAIL;

	BYTE* pixels = nullptr;
	ULONG length = 0;
	V_RET(pixelDataArray->GetBufferPointer(&pixels, &length));

	if (length != width*height*4)
		return E_FAIL;

	pixelData.SetCount(length);
	memcpy(pixelData.GetData(), pixels, length);

	return S_OK;
}

HRESULT CWebGLPlugin::CreateCanvas(BSTR canvasId, CComPtr<IHTMLCanvasElement>& retVal)
{
	CComPtr<IHTMLDocument2> doc2;
	CComQIPtr<IHTMLWindow2> win(GetHTMLWindow());
	assert(win);
	V_RET(win->get_document(&doc2));
	if (!doc2)
		return E_FAIL;
	CComQIPtr<IHTMLDocument3> doc3(doc2);
	if (!doc3)
		return E_FAIL;

	CAtlStringW cnvID;
	CAtlStringW divID;
	unsigned long long thisValue = (unsigned long long)this;
	cnvID.Format(L"CNV%s-%016I64X", canvasId, thisValue);
	divID.Format(L"DIV%s-%016I64X", canvasId, thisValue);

	CComPtr<IHTMLElement> c;
	V_RET(doc3->getElementById(cnvID.GetBuffer(), &c));
	if (!c)
	{
		CComPtr<IHTMLElement> divElement;
		V_RET(doc2->createElement(L"DIV", &divElement));
		CComPtr<IHTMLStyle> style;
		V_RET(divElement->put_id(divID.GetBuffer()));
		V_RET(divElement->get_style(&style));
		
		CComPtr<IHTMLElement> bodyElement;
		V_RET(doc2->get_body(&bodyElement));
		CComQIPtr<IHTMLDOMNode> body(bodyElement);
		if (!body)
			return E_FAIL;

		CComPtr<IHTMLDOMNode> insertedDiv;
		CComQIPtr<IHTMLDOMNode> divDOMNode(divElement);
		V_RET(body->appendChild(divDOMNode, &insertedDiv));

		CComBSTR inStr;
		inStr += L"<canvas id=\"";
		inStr += cnvID;
		inStr += L"\"></canvas>";
		V_RET(divElement->put_innerHTML(inStr));
		V_RET(style->put_display(L"none"));

		V_RET(doc3->getElementById(cnvID.GetBuffer(), &c));
	}

	CComQIPtr<IHTMLCanvasElement> canvas(c);
	if (!canvas)
		return E_FAIL;

	retVal = canvas;
	return S_OK;
}

HRESULT CWebGLPlugin::GetInnerCanvas(CComPtr<IHTMLCanvasElement>& retVal)
{
	if ( !GetHTMLWindow())
		return E_FAIL;

	if (!innerCanvas_)
	{
		V_RET(CreateCanvas(L"{6696CA16-9D3B-42BE-8E3D-7AFF3821C724}", innerCanvas_));
	}

	retVal = innerCanvas_;
	return S_OK;
}

HRESULT CWebGLPlugin::GetImageCanvas(CComPtr<IHTMLCanvasElement>& retVal)
{
	if (!imageCanvas_)
	{
		V_RET(CreateCanvas(L"{6901913A-7418-41A9-8024-B95754D08A5E}", imageCanvas_));
	}

	retVal = imageCanvas_;
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::get_width( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;
	*retVal = (LONG)ctxWidth_;
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::put_width(VARIANT val)
{
	auto obj = GetHTMLObjectElement();
	if (obj)
	{
		return obj->put_width(val); // should cause SetObjectRects
	}
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::get_height( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;
	*retVal = (LONG)ctxHeight_;
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::put_height(VARIANT val)
{
	auto obj = GetHTMLObjectElement();
	if (obj)
	{
		return obj->put_height(val); // should cause SetObjectRects
	}
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::toDataURL( VARIANT mimeType, VARIANT quality, BSTR * retVal )
{
	V_RET(updateNativeCanvas());

	CComVariant typeVar(mimeType);
	BSTR type = nullptr;
	if (typeVar.vt != VT_EMPTY && typeVar.vt != VT_ERROR)
	{
		V_RET(typeVar.ChangeType(VT_BSTR));
		type = typeVar.bstrVal;
	}

	CComPtr<IHTMLCanvasElement> canvas;
	V_RET(GetInnerCanvas(canvas));
	V_RET(canvas->toDataURL(type, quality, retVal));

	return S_OK;
}

STDMETHODIMP CWebGLPlugin::getContext( BSTR contextName, VARIANT contextAttributes, IWebGLRenderingContext** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	CComBSTR ctxName(contextName);
	if (ctxName != "webgl" && ctxName != "experimental-webgl")
		return E_NOTIMPL;

	if ( !glContext_ )
	{
		CComBSTR errorMsg;
		HRESULT hr = CreateWebGLRenderingContext(contextAttributes, this, errorMsg, glContext_);
		if(FAILED(hr))
		{
			DispatchEvent(L"webglcontextcreationerror", errorMsg);
			return hr;
		}

		V_RET(glContext_->ResizePrimarySurface( (USHORT)(drawRect_.right-drawRect_.left), (USHORT)(drawRect_.bottom-drawRect_.top)));


		if (FAILED(CreateDXContext()))
		{
			if ( !CreateGDIContext() )
				return E_FAIL;
		}

		V_RET(AdjustDrawCtxSize());
	}
	
	*retVal = glContext_;
	(*retVal)->AddRef();

	return S_OK;
}

STDMETHODIMP CWebGLPlugin::getNativeCanvas(IDispatch** retVal)
{
	if (!retVal)
		return E_INVALIDARG;

	CComPtr<IHTMLCanvasElement> canvas;
	V_RET(GetInnerCanvas(canvas));

	*retVal = canvas;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::updateNativeCanvas()
{
	if ( !GetHTMLWindow() || !glContext_)
		return E_FAIL;

	CComPtr<IHTMLCanvasElement> canvas;
	V_RET(GetInnerCanvas(canvas));

	CAtlArray<BYTE> imageBits;
	imageBits.SetCount(ctxWidth_*ctxHeight_*4);

	CComPtr<IDirect3DSurface9> eglD3DSurface;
	eglD3DSurface.Attach(glContext_->GetPrimarySurfaceD3DPtr());
	V_RET(imgConv_.ReadBackPixels(eglD3DSurface, imageBits.GetData(), (ULONG)imageBits.GetCount(), FALSE, TRUE, TRUE));
	
	V_RET(canvas->put_width(ctxWidth_));
	V_RET(canvas->put_height(ctxHeight_));

	CComBSTR ctxName(L"2d");
	CComPtr<ICanvasRenderingContext2D> ctx;
	V_RET(canvas->getContext(ctxName, &ctx));

	CComPtr<ICanvasImageData> imgData;
	V_RET(ctx->createImageData(CComVariant(glContext_->GetPrimarySurfaceWidth()), CComVariant(glContext_->GetPrimarySurfaceHeight()), &imgData));
	CComVariant pixelDataObj;
	V_RET(imgData->get_data(&pixelDataObj));

	CComQIPtr<ICanvasPixelArrayData> pixelData(pixelDataObj.pdispVal);
	if (!pixelData)
		return E_FAIL;

	BYTE * data = nullptr;
	ULONG length = 0;
	V_RET(pixelData->GetBufferPointer(&data, &length));

	if (length != imageBits.GetCount())
		return E_FAIL;

	memcpy(data, imageBits.GetData(), length);

	V_RET(ctx->putImageData(imgData, 0, 0, CComVariant(), CComVariant(), CComVariant(), CComVariant()));
	
	return S_OK;
}



STDMETHODIMP CWebGLPlugin::DispatchEvent( BSTR eventType, BSTR details )
{
	auto eventTarget = GetEventTarget();
	auto docEvent = GetDocEvent();
	if (eventTarget && docEvent) // IE9 event interfaces
	{
		CComPtr<IDOMEvent> domEvent;
		if ( SUCCEEDED(docEvent->createEvent(L"CustomEvent", &domEvent)) )
		{
			CComQIPtr<IDOMCustomEvent> customEvent(domEvent);
			if (customEvent)
			{
				CComBSTR type(eventType);
				CComVariant v(details);
				if ( SUCCEEDED(customEvent->initCustomEvent(type, TRUE, TRUE, &v)) )
				{
					CComQIPtr<IDispatchEx> dispexEvent(domEvent);
					if (dispexEvent)
					{
						CComBSTR propName(L"statusMessage");
						DISPID dispID = 0;
						if ( SUCCEEDED(dispexEvent->GetDispID(propName, fdexNameCaseSensitive | fdexNameEnsure, &dispID)) )
						{
							DISPPARAMS params = {0};
							params.cArgs = 1;
							params.rgvarg = &v;
							dispexEvent->InvokeEx(dispID, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &params, NULL, NULL, NULL);
						}
					}

					VARIANT_BOOL result;
					HRESULT hr = eventTarget->dispatchEvent(domEvent, &result);
				}
			}
		}
	}
	else
	{
		CComQIPtr<IHTMLWindow2> window(GetHTMLWindow());
		if (!window)
			return E_FAIL;

		CComPtr<IHTMLDocument2> doc;
		V_RET(window->get_document(&doc));

		CComQIPtr<IHTMLDocument4> docV4(doc);
		if (!docV4)
			return E_FAIL;

		CComPtr<IHTMLEventObj> eventObj;
		V_RET(docV4->createEventObject(nullptr, &eventObj));


		CComQIPtr<IDispatchEx> dispEventObj(eventObj);
		CComBSTR statusPropName(L"statusMessage");
		DISPID dispID = 0;
		if ( SUCCEEDED(dispEventObj->GetDispID(statusPropName, fdexNameCaseSensitive | fdexNameEnsure, &dispID)) )
		{
			CComVariant v(details);
			DISPPARAMS params = {0};
			params.cArgs = 1;
			params.rgvarg = &v;
			dispEventObj->InvokeEx(dispID, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &params, NULL, NULL, NULL);
		}

		CComBSTR eventTypePropName(L"webglEventType");
		if ( SUCCEEDED(dispEventObj->GetDispID(eventTypePropName, fdexNameCaseSensitive | fdexNameEnsure, &dispID)) )
		{
			CComVariant v(eventType);
			DISPPARAMS params = {0};
			params.cArgs = 1;
			params.rgvarg = &v;
			dispEventObj->InvokeEx(dispID, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &params, NULL, NULL, NULL);
		}

		CComQIPtr<IHTMLElement3> eventSource(GetHTMLObjectElement());
		if (!eventSource)
			return E_FAIL;

		VARIANT_BOOL isCancelled;
		V_RET(eventSource->fireEvent(L"onerror", &CComVariant(eventObj), &isCancelled));
	}
	return S_OK;
}

STDMETHODIMP CWebGLPlugin::Log( BSTR message, ULONG level )
{
	CComQIPtr<IDispatchEx> dispWindow(GetHTMLWindow());
	CComQIPtr<IDispatchEx> console;
	CComVariant var;
	DISPID id;
	if ( SUCCEEDED(dispWindow->GetDispID(L"console", 0, &id)) )
	{
		DISPPARAMS params = {0};
		if ( SUCCEEDED(dispWindow->InvokeEx(id, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &params, &var, NULL, NULL)) && var.vt == VT_DISPATCH )
		{
			console = var.pdispVal;
		}
	}
	if (console)
	{
		id = DISPID_STARTENUM;
		DISPID logMethod = DISPID_UNKNOWN;
		while ( console->GetNextDispID(fdexEnumAll, id, &id) == S_OK )
		{
			BSTR str = nullptr;
			CComBSTR name;
			if ( SUCCEEDED(console->GetMemberName(id, &str)) )
			{
				name.Attach(str);
				if (level == 0 && name == L"error")
				{
					logMethod = id;
				}
				if (level == 1 && name == L"warn")
				{
					logMethod = id;
				}
				if (level == 2 && name == L"info")
				{
					logMethod = id;
				}
			}
		}

		if (logMethod != DISPID_UNKNOWN)
		{
			CComVariant text(message);
			DISPPARAMS params = {0};
			params.cArgs = 1;
			params.rgvarg = (VARIANT*)&text;
			console->InvokeEx(logMethod, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, NULL, NULL, NULL);
		}
	}

	return S_OK;
}

STDMETHODIMP CWebGLPlugin::AsyncInitTexture( CComPtr<IDispatch> htmlObject, const TexImageContext& ctx, CAtlArray<BYTE>& pixelData, BOOL& isAsync, ULONG& width, ULONG& height )
{
	CComQIPtr<IHTMLImgElement> img(htmlObject);
	if (!img)
		return E_INVALIDARG;

	CComBSTR imgURL;
	V_RET(img->get_src(&imgURL));

	if ( StrStrI(imgURL.m_str, L"data:") == imgURL.m_str )
	{
		return DecodeDataURL(imgURL, pixelData, ctx, width, height, isAsync);
	}

	TextureDownloaderType * impl = nullptr;
	TextureDownloaderType::CreateInstance(&impl);
	TextureDownloaderPtr sp(impl);

	if ( !IsSameDomain(GetHTMLWindow(), imgURL) )
	{
		CComBSTR docDomain, docProtocol;
		V_RET(GetHTMLWindowProtocol(GetHTMLWindow(), docProtocol));
		V_RET(GetHTMLWindowHostName(GetHTMLWindow(), docDomain));
		CAtlString origin = docProtocol.m_str;
		origin += L"//";
		origin += docDomain.m_str;
		sp->SetRequestOrigin(origin);
	}

	sp->SetDataStorage(&pixelData); // buffer for synchronous initialization
	V_RET(sp->Init(ctx, imgURL, m_spClientSite));
	sp->SetDataStorage(nullptr); // reset buffer, if decoding was synchronous, the buffer contains image, if not - async decoder will create new buffer

	width = sp->GetWidth();
	height = sp->GetHeight();

	isAsync = sp->IsInProgress();
	return S_OK;
}

HRESULT CWebGLPlugin::GetHTMLWindowHostName( CComPtr<IDispatchEx> htmlWindow, CComBSTR& outHostName )
{
	CComQIPtr<IHTMLWindow2> htmlWin(htmlWindow);
	CComPtr<IHTMLLocation> htmlLoc;
	V_RET(htmlWin->get_location(&htmlLoc));
	CComBSTR hostName;
	V_RET(htmlLoc->get_hostname(&hostName));
	V_RET(hostName.ToLower());
	outHostName = hostName;
	return S_OK;
}

HRESULT CWebGLPlugin::GetHTMLWindowProtocol( CComPtr<IDispatchEx> htmlWindow, CComBSTR& outProtocol )
{
	CComQIPtr<IHTMLWindow2> htmlWin(htmlWindow);
	CComPtr<IHTMLLocation> htmlLoc;
	V_RET(htmlWin->get_location(&htmlLoc));
	CComBSTR protocol;
	V_RET(htmlLoc->get_protocol(&protocol));
	V_RET(protocol.ToLower());
	outProtocol = protocol;
	return S_OK;
}

HRESULT CWebGLPlugin::GetHostNameFromURL( CComBSTR url, CComBSTR& outHostName )
{
	if (!localContentAllowed_ && UrlIsFileUrl(url))
		return E_FAIL;

	DWORD hostNameLength = url.Length();
	CComBSTR hostName(hostNameLength);
	V_RET(UrlGetPart((LPCWSTR)url, (LPWSTR)hostName, &hostNameLength, URL_PART_HOSTNAME, 0));
	V_RET(hostName.ToLower());

	outHostName = CComBSTR(hostNameLength, hostName);
	return S_OK;
}

BOOL CWebGLPlugin::IsSameDomain( CComPtr<IDispatchEx> htmlWindow, CComBSTR url )
{
	if (StrStrI(url.m_str, L"data:") == url.m_str)
		return TRUE;

	CComBSTR wndHostName, urlHostName;
	if (FAILED(GetHTMLWindowHostName(htmlWindow, wndHostName)) ||
		FAILED(GetHostNameFromURL(url, urlHostName)) ||
		wndHostName != urlHostName)
	{
		return FALSE;
	}
	return TRUE;
}

HRESULT CWebGLPlugin::DecodeDataURL( CComBSTR &imgURL, CAtlArray<BYTE>& pixelData, const TexImageContext& ctx, ULONG &width, ULONG &height, BOOL &isAsync )
{
	TextureDownloaderType * impl = nullptr;
	TextureDownloaderType::CreateInstance(&impl);
	TextureDownloaderPtr sp(impl);

	wchar_t base64Tag[] = L"base64,";
	auto base64 = StrStrI(imgURL.m_str, base64Tag);
	if ( !base64 ) // image is not base64 encoded and is not supported as a very rare (or even impossible) case.
		return E_INVALIDARG;

	auto dataPos = base64 + (sizeof(base64Tag)/sizeof(base64Tag[0])-1);
	auto length = imgURL.Length() - (dataPos - imgURL.m_str)/sizeof(dataPos[0]);

	size_t charsConverted = 0;
	wcstombs_s(&charsConverted, nullptr, 0, dataPos, length);
	CAtlArray<char> ansiStr;
	ansiStr.SetCount(charsConverted);
	wcstombs_s(&charsConverted, ansiStr.GetData(), charsConverted, dataPos, length);

	auto fileDataLength = Base64DecodeGetRequiredLength(charsConverted);
	CAtlArray<BYTE> fileData;
	fileData.SetCount(fileDataLength);
	if ( !Base64Decode(ansiStr.GetData(), ansiStr.GetCount(), fileData.GetData(), &fileDataLength) )
		return E_INVALIDARG;

	sp->SetDataStorage(&pixelData);
	V_RET(sp->Init(ctx));
	V_RET(sp->AppendData(fileData.GetData(), fileData.GetCount()));
	V_RET(sp->AppendData(nullptr, 0));

	width = sp->GetWidth();
	height = sp->GetHeight();

	isAsync = FALSE;
	return S_OK;
}

//////////////////////////////////////////////////////////////////////////


TextureDownloader::TextureDownloader() :
pixelData_(nullptr),
isInProgress_(FALSE),
width_(0),
height_(0)
{

}

HRESULT TextureDownloader::Init( const TexImageContext& ctx)
{
	ctx_ = ctx;

	return S_OK;
}

HRESULT TextureDownloader::Init( const TexImageContext& ctx, BSTR url, IOleClientSite* site)
{
	if (!site)
		return E_INVALIDARG;

	ctx_ = ctx;

	auto IsAbsolute = [](BSTR url)
	{
		return StrStrI(url, L"http://") == url || StrStrI(url, L"https://") == url || StrStrI(url, L"file:///") == url || StrStrI(url, L"ftp://") == url;
	};

	CComObject<Downloader> *pbsc;
	HRESULT hRes = CComObject<Downloader>::CreateInstance(&pbsc);
	if (FAILED(hRes))
		return hRes;

	isInProgress_ = TRUE;
	AddRef(); // we pass "this" into Downloader, so AddRef()

	if (requestOrigin_.GetLength() > 0)
	{
		pbsc->SetCORSOrigin(requestOrigin_);
	}

	return pbsc->StartAsyncDownload(this, &TextureDownloader::OnDataAvailable, url, site, !IsAbsolute(url));
}

HRESULT TextureDownloader::AppendData( BYTE* pBytes, DWORD dwSize )
{
	if (pBytes && dwSize)
	{
		size_t curSize = bytes_.GetCount();
		bytes_.SetCount(curSize + dwSize);
		memcpy(bytes_.GetData()+curSize, pBytes, dwSize);
	}

	if (!pBytes && dwSize == 0)
	{
		if (requestOrigin_.GetLength() > 0)
		{
			if (allowedOrigin_.CompareNoCase(requestOrigin_) != 0 && allowedOrigin_ != L"*")
			{
				// do not decode image and do not load image data into texture
				// TODO: log to browser console
				return S_OK;
			}
		}

		V_RET(Decode());
	}

	return S_OK;
}

void TextureDownloader::OnDataAvailable( DownloaderBase* pbsc, BYTE* pBytes, DWORD dwSize )
{
	if (pBytes && dwSize)
	{
		AppendData(pBytes, dwSize);
	}
	else if (!pBytes && SUCCEEDED(dwSize)) // downloading finished
	{
		auto downloader = static_cast<Downloader*>(pbsc);
		allowedOrigin_ = downloader->GetCORSAllowedOrigin();

		isInProgress_ = FALSE;
		AppendData(nullptr, 0);
		Release(); // destroy TextureDownloader
	}
	else if (FAILED(dwSize))
	{
		isInProgress_ = FALSE;
		Release(); // destroy TextureDownloader
	}
}

HRESULT TextureDownloader::Decode()
{
	if (!ctx_.texture)
		return S_OK;

	CAtlArray<BYTE> pixels;
	CAtlArray<BYTE>* pBytes(pixelData_ ? pixelData_ : &pixels);
	TexelFormat::Format srcTexelFormat;
	V_RET(DecodeTextureFile(bytes_, width_, height_, *pBytes, srcTexelFormat));

	TexelFormat::Format destTexelFormat = ::GetTexelFormat(ctx_.format, ctx_.type);
	const BYTE* pixelDataPtr = pBytes->GetData();
	ULONG pixelDataSize = (ULONG)pBytes->GetCount();

	CAtlArray<BYTE> convertedPixels;
	if ( ctx_.needFlipY || srcTexelFormat != destTexelFormat )
	{
		convertedPixels.SetCount(GetAlignedImageByteSize(width_, height_, destTexelFormat, ctx_.unpackAlignment));
		if(!ConvertImage(width_, height_, MultiplyOp::None, ctx_.unpackAlignment, ctx_.needFlipY,
			srcTexelFormat, pixelDataPtr, destTexelFormat, convertedPixels.GetData()))
			return E_INVALIDARG;

		pixelDataPtr = convertedPixels.GetData();
		pixelDataSize = (ULONG)convertedPixels.GetCount();
		if (pixelData_)
		{
			pixelData_->SetCount(convertedPixels.GetCount());
			memcpy(pixelData_->GetData(), convertedPixels.GetData(), convertedPixels.GetCount());
		}
	}

	if (!pixelData_ && ctx_.texture)
	{
		ctx_.width = width_;
		ctx_.height = height_;
		ctx_.texture->UploadData(ctx_, pixelDataPtr, pixelDataSize);
	}
	
	return S_OK;
}


//////////////////////////////////////////////////////////////////////////
size_t BinaryKMP(const char * S, size_t sLength, const char * K, size_t kLength)
{
	const size_t Marker = ((size_t)(0))-1;

	size_t * T = new size_t[kLength + 1];
	for (size_t i = 0; i < (kLength + 1); ++i) T[i] = Marker;

	if(kLength == 0)
	{
		delete [] T;
		return 0;
	}
	for(size_t i = 1; i <= kLength; i++)
	{
		size_t pos = T[i - 1];
		while(pos != Marker && K[pos] != K[i - 1]) pos = T[pos];
		T[i] = pos + 1;
	}

	size_t sp = 0;
	size_t kp = 0;
	while(sp < sLength)
	{
		while(kp != Marker && (kp == kLength || K[kp] != S[sp])) kp = T[kp];
		kp++;
		sp++;

		if(kp == kLength)
		{
			delete [] T;
			return sp - kLength;
		}
	}

	delete [] T;
	return Marker;
}

void * FindMemoryBlock(size_t blockSize, const char * pattern, size_t patternSize, size_t filledSize )
{
	const size_t Marker = ((size_t)(0))-1;

	void * mem = nullptr;

	auto numHeaps = GetProcessHeaps(0, NULL);
	if (!numHeaps)
		return 0;

	HANDLE * heaps = new HANDLE[numHeaps];
	GetProcessHeaps(numHeaps, &heaps[0]);

	for (auto i = 0u; (i < numHeaps) && !mem; ++i)
	{
		PROCESS_HEAP_ENTRY entry = {0};
		auto hHeap = heaps[i];
		if ( HeapLock(hHeap) )
		{
			while ( HeapWalk(hHeap, &entry) && !mem )
			{
				if ( entry.cbData >= blockSize && entry.cbData <= (size_t)(blockSize*1.01f) &&
					(entry.wFlags & PROCESS_HEAP_ENTRY_BUSY))
				{
					auto offset = BinaryKMP((char*)entry.lpData, entry.cbData, pattern, patternSize);
					if (offset != Marker) {

						bool filledOK = true;
						char * data = (char*)entry.lpData + offset;
						// check that pattern fills filledSize bytes
						for (size_t n = 0; n < filledSize && filledOK; ++n)
						{
							filledOK = data[n] == pattern[n % patternSize];
						}

						if (filledOK)
							mem = data;
					}
				}
			}

			HeapUnlock(hHeap);
		}
	}

	delete [] heaps;

	return mem;
}

HRESULT InitGlobalBuffers(CComPtr<IDispatch> win)
{
	TlsData * data = (TlsData *)TlsGetValue(g_TlsIdx);

	if (data->nativeArrayBuffer)
	{
		data->nativeArrayBuffer->AddRef();
		data->ieWebGLArrayBuffer->AddRef();
		data->uint8Array->AddRef();
		data->int8Array->AddRef();
		data->uint16Array->AddRef();
		data->int16Array->AddRef();
		data->uint32Array->AddRef();
		data->int32Array->AddRef();
		data->float32Array->AddRef();
		data->float64Array->AddRef();
	}
	else
	{
		CComVariant prop;
		if ( FAILED(win.GetPropertyByName(L"ArrayBuffer", &prop)) || !prop.pdispVal)
			return S_OK;

		CComPtr<IDispatch> buffer(prop.pdispVal);
		CComVariant propName(L"iewebgl");
		CComVariant isIEWebGLImpl;
		DISPID dispId = ~0u;
		V_RET(buffer.Invoke1(L"hasOwnProperty", &propName, &isIEWebGLImpl));

		if ( !isIEWebGLImpl.boolVal ) // not an IEWebGL's TypedArray implementation
		{
			CComQIPtr<IDispatchEx> winEx(win);

			CComVariant arg(NativeArrayBufferSize);
			CComVariant result;
			DISPPARAMS params;
			params.cArgs = 1;
			params.cNamedArgs = 0;
			params.rgdispidNamedArgs = nullptr;
			params.rgvarg = (VARIANTARG*)&arg;

			/* Create native ArrayBuffer*/
			DISPID constructorID = ~0u;
			V_RET(win.GetIDOfName(L"ArrayBuffer", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			arg = result;

			data->nativeArrayBuffer = result.pdispVal;
			data->nativeArrayBuffer->AddRef();

			/* Create native views of all types*/
			
			result.Clear();
			V_RET(win.GetIDOfName(L"Uint8Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->uint8Array = result.pdispVal;
			data->uint8Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Int8Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->int8Array = result.pdispVal;
			data->int8Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Uint16Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->uint16Array = result.pdispVal;
			data->uint16Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Int16Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->int16Array = result.pdispVal;
			data->int16Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Uint32Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->uint32Array = result.pdispVal;
			data->uint32Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Int32Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->int32Array = result.pdispVal;
			data->int32Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Float32Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->float32Array = result.pdispVal;
			data->float32Array->AddRef();

			result.Clear();
			V_RET(win.GetIDOfName(L"Float64Array", &constructorID));
			V_RET(winEx->InvokeEx(constructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr));
			data->float64Array = result.pdispVal;
			data->float64Array->AddRef();

			/* Find native ArrayBuffer memory, and map IEWebGL array to that memory */

			const size_t FillSize = NativeArrayBufferSize / 1024;
			char Pattern[] = "8DE28E45-61EB-4A67-9F13-9DC701A2C78D";

			CComPtr<IDispatch> intermediateArr(data->uint8Array);
			wchar_t buf[16] = {0};
			VARIANT v;
			v.vt = VT_UI4;
			for (size_t i = 0; i < FillSize; ++i)
			{
				v.ulVal = Pattern[i % (sizeof(Pattern)-1)];
				intermediateArr.PutPropertyByName(_itow((int)i, buf, 10), &v);
			}

			void * mem = FindMemoryBlock(NativeArrayBufferSize, Pattern, sizeof(Pattern)-1, FillSize);
			if (!mem)
				return E_FAIL;

			IArrayBufferPtr arrayBuffer;
			V_RET(CreateArrayBuffer(mem, NativeArrayBufferSize, arrayBuffer));
			data->ieWebGLArrayBuffer = arrayBuffer.Detach();
		}
	}

	return S_OK;
}

HRESULT UninitGlobalBuffers()
{
	TlsData * data = (TlsData *)TlsGetValue(g_TlsIdx);

	if (data->nativeArrayBuffer)
	{
		auto counter = data->nativeArrayBuffer->Release(); if (counter == 0) data->nativeArrayBuffer = nullptr;
		counter = data->ieWebGLArrayBuffer->Release(); if (counter == 0) data->ieWebGLArrayBuffer = nullptr;
		counter = data->uint8Array->Release(); if (counter == 0) data->uint8Array = nullptr;
		counter = data->int8Array->Release(); if (counter == 0) data->int8Array = nullptr;
		counter = data->uint16Array->Release(); if (counter == 0) data->uint16Array = nullptr;
		counter = data->int16Array->Release(); if (counter == 0) data->int16Array = nullptr;
		counter = data->uint32Array->Release(); if (counter == 0) data->uint32Array = nullptr;
		counter = data->int32Array->Release(); if (counter == 0) data->int32Array = nullptr;
		counter = data->float32Array->Release(); if (counter == 0) data->float32Array = nullptr;
		counter = data->float64Array->Release(); if (counter == 0) data->float64Array = nullptr;
	}

	return S_OK;
}

HRESULT AddProperty(CComPtr<IDispatchEx> disp, const _bstr_t& name, IID iid, JSObjectMakeFunction maker, JSObjectConstPropFunction props)
{
	HRESULT hr = S_OK;

	DISPID dispID = 0;
	hr = disp->GetDispID(name, fdexNameCaseSensitive, &dispID);
	if (SUCCEEDED(hr)) // object already exists
		return S_OK;

	JSObjectFactory * inst = nullptr;
	V_RET(JSObjectFactory::CreateInstance(&inst));
	CComPtr<JSObjectFactory> instance(inst);
	instance->Init(iid, maker, props);

	DISPID newDispID = 0;
	hr = disp->GetDispID(name, fdexNameEnsure | fdexNameCaseSensitive, &newDispID);
	if (FAILED(hr))
		return hr;

	CComVariant value(instance);
	CComVariant result;
	DISPID namedArgs[] = {DISPID_PROPERTYPUT};
	DISPPARAMS params = {(VARIANT*)&value, namedArgs, 1, 1};
	hr = disp->InvokeEx(newDispID, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYPUT, &params, &result, nullptr, nullptr);
	if (FAILED(hr))
		return hr;

	return S_OK;
}

HRESULT DecodeTextureFile( CAtlArray<BYTE>& fileData, ULONG& width, ULONG& height, CAtlArray<BYTE>& pixels, TexelFormat::Format& fmt )
{
	// Create WIC factory
	CComPtr<IWICImagingFactory> wicFactory;
	V_RET(CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(&wicFactory)));

	CComPtr<IWICStream> wicStream;
	// Create a WIC stream to map onto the memory.
	V_RET(wicFactory->CreateStream(&wicStream));

	// Initialize the stream with the memory pointer and size.
	V_RET(wicStream->InitializeFromMemory(fileData.GetData(), (DWORD)fileData.GetCount()));

	CComPtr<IWICBitmapDecoder> wicDecoder;
	// Create a decoder for the stream.
	V_RET(wicFactory->CreateDecoderFromStream(wicStream, nullptr, WICDecodeMetadataCacheOnDemand, &wicDecoder));

	CComPtr<IWICBitmapFrameDecode> wicFrame;
	V_RET(wicDecoder->GetFrame(0, &wicFrame));

	CComPtr<IWICFormatConverter> wicFormatConverter;
	V_RET(wicFactory->CreateFormatConverter(&wicFormatConverter));

	fmt = TexelFormat::None;
	if ( SUCCEEDED(wicFormatConverter->Initialize(wicFrame, GUID_WICPixelFormat32bppRGBA, WICBitmapDitherTypeNone, nullptr, 0.0, WICBitmapPaletteTypeCustom)) )
	{
		GUID pixelFormat = GUID_WICPixelFormat32bppRGBA;
		fmt = TexelFormat::RGBA8888;
		CComPtr<IWICComponentInfo> wicComponentInfo;
		V_RET(wicFactory->CreateComponentInfo(pixelFormat, &wicComponentInfo));
		CComQIPtr<IWICPixelFormatInfo> wicPixelFormatInfo(wicComponentInfo);

		UINT bpp = 0;
		if (wicPixelFormatInfo)
			wicPixelFormatInfo->GetBitsPerPixel(&bpp);

		if (!bpp)
			return E_FAIL;

		V_RET(wicFormatConverter->GetSize((UINT *)&width, (UINT *)&height));

		pixels.SetCount(width*height*bpp/8);
		V_RET(wicFormatConverter->CopyPixels(nullptr, width*bpp/8, (UINT)pixels.GetCount(), pixels.GetData()));
	}
	else
	{
		WICPixelFormatGUID pixFmt;
		V_RET(wicFrame->GetPixelFormat(&pixFmt));

		if (pixFmt == GUID_WICPixelFormat24bppBGR) fmt = TexelFormat::BGR888;
		else if (pixFmt == GUID_WICPixelFormat32bppBGR) fmt = TexelFormat::BGRX8888;
		else if (pixFmt == GUID_WICPixelFormat32bppBGRA) fmt = TexelFormat::BGRA8888;
		else if (pixFmt == GUID_WICPixelFormat24bppRGB) fmt = TexelFormat::RGB888;
		else if (pixFmt == GUID_WICPixelFormat32bppRGBA) fmt = TexelFormat::RGBA8888;
		else return E_FAIL;

		V_RET(wicFrame->GetSize((UINT *)&width, (UINT *)&height));

		UINT bytesPerPixel = GetTexelByteSize(fmt);

		pixels.SetCount(width*height*bytesPerPixel);
		V_RET(wicFrame->CopyPixels(nullptr, width*bytesPerPixel, (UINT)pixels.GetCount(), pixels.GetData()));
	}

	return S_OK;
}
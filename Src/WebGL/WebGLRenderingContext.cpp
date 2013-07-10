// WebGLRenderingContext.cpp : Implementation of CWebGLRenderingContext

#include "stdafx.h"
#include "WebGLRenderingContext.h"
#include "WebGLGetConcrete.h"
#include "WebGLTexelConversions.h"
#include "WebGLUtils.h"
#include "WebGLExtensions.h"

#include "../InvokeHelper.h"
#include "../ScriptArray.h"

#include "../TypedArray/TypedArrayMaker.h"

#undef GL_APICALL
#undef EGLAPI
#include <libEGL/Display.h>
#include <libEGL/Surface.h>
#include <libGLESv2/Context.h>
#include <libGLESv2/Framebuffer.h>

#include <atlstr.h>
#include <atlsafe.h>

#pragma comment(lib, "libEGL.lib")
#pragma comment(lib, "libGLESv2.lib")
#pragma comment(lib, "preprocessor.lib")

#include <GLSLANG/ShaderLang.h>
#pragma comment(lib, "translator_hlsl.lib")
#pragma comment(lib, "translator_common.lib")

ULONG g_ctxGenerationCounter_ = 0;

BOOL ValidateTextureArrayBufferType(IArrayBufferViewPtr arrView, ULONG type);
BOOL ValidateCubeMap( WebGLTexturePtr texture );
inline void FormatCComBSTR(CComBSTR& out, const BSTR fmt = 0, ...);
template < typename ElementType> CComPtr<IDispatch> BuildScriptArray( IPluginObject* plugin, ULONG count, const ElementType* elements );
void FixCopyRect(LONG fboWidth, LONG fboHeight, LONG& xoffset, LONG& yoffset, LONG& x, LONG& y, LONG& width, LONG& height);


inline BOOL IsASCIIString(const char* str, size_t length)
{
	for (size_t i = 0; i < length; ++i)
	{
		if (!isascii(str[i]))
			return FALSE;
	}
	return TRUE;
}

template < class Interface, class Concrete >
Concrete* IDispatchToConcrete( IDispatch* dispatch )
{
	Interface* interfacePtr = nullptr;
	if(SUCCEEDED(dispatch->QueryInterface(__uuidof(Interface), (void**)&interfacePtr)))
	{
		Concrete* cPtr = (Concrete*)0x1000;
		Interface* iPtr = cPtr; // automatic cast correctly calculates interface offset, if any
		ptrdiff_t offset = (size_t)iPtr - (size_t)cPtr;

		if ( interfacePtr )
			interfacePtr->Release();

		return (Concrete*)(((BYTE*)interfacePtr) - offset);
	}
	return NULL;
}

template < class Interface, class Concrete >
Concrete* VariantToConcrete( VARIANT variant )
{
	if(variant.vt == VT_DISPATCH)
		return IDispatchToConcrete<Interface, Concrete>(variant.pdispVal);

	return NULL;
}

template < class ArrayBuffer >
ULONG GetArraySize( ArrayBuffer buffer )
{
	ULONG size = 0;
	if (FAILED(buffer->get_byteLength(&size)))
		return 0;

	return size;
}

template < class ArrayBuffer >
BYTE* GetArrayData( ArrayBuffer buffer )
{
	BYTE* data = nullptr;
	if (FAILED(buffer->get_mem(&data)))
		return nullptr;

	return data;
}

static const EGLint EGLContextAttribs[] = { EGL_CONTEXT_CLIENT_VERSION, 2, EGL_NONE, EGL_NONE };

CWebGLRenderingContext::WebGLVertexAttrib::WebGLVertexAttrib() :
buffer(nullptr),
stride(0),
size(4),
byteOffset(0),
type(GL_FLOAT),
enabled(FALSE),
normalized(FALSE)
{
}

CWebGLRenderingContext::CWebGLRenderingContext() :
pluginObj_(nullptr),
eglCtx_(NULL),
eglDisplay_(NULL),
eglConfig_(NULL),
eglSurface_(NULL),
isAlpha_(FALSE),
isDepth_(FALSE),
isStencil_(FALSE),
isAntialias_(FALSE),
isPremultiplied_(FALSE),
isPreserveDrawBuffer_(FALSE),
isInitialResize_(TRUE),
vendor_(VendorOther),
proxyTexture2D_(0),
proxyTextureCube_(0),
depthStencilFormat_(0),
depthFormat_(0),
stencilFormat_(0),
stencilRef_(0),
stencilValueMask_(0),
stencilWriteMask_(0),
pixelStorePackAlignment_(0),
pixelStoreUnpackAlignment_(0),
pixelStoreFlipY_(0),
pixelStorePremultiplyAlpha_(0),
pixelStoreColorspaceConversion_(GL_BROWSER_DEFAULT_WEBGL),
maxVertexAttribs_(0),
maxTextureUnits_(0),
maxTextureSize_(0),
maxRenderBufferSize_(0),
maxCubeMapTextureSize_(0),
maxTextureImageUnits_(0),
maxVertexTextureImageUnits_(0),
maxVaryingVectors_(0),
maxFragmentUniformVectors_(0),
maxVertexUniformVectors_(0),
vertexAttrib0FakeBuffer_(0),
vertexAttrib0FakeBufferSize_(0),
vertexAttrib0ZeroBuffer_(0),
vertexAttrib0ZeroBufferSize_(0),
activeTexture_(0),
generation_(0)
{
	validatorHint_.AddValue(GL_GENERATE_MIPMAP_HINT);
	validatorTextureType_.AddValue(GL_UNSIGNED_BYTE);
	validatorTextureType_.AddValue(GL_UNSIGNED_SHORT_5_6_5);
	validatorTextureType_.AddValue(GL_UNSIGNED_SHORT_5_5_5_1);
	validatorTextureType_.AddValue(GL_UNSIGNED_SHORT_4_4_4_4);

	vertexAttrib0Value_[0] = vertexAttrib0FakeBuferValue_[0] = 0;
	vertexAttrib0Value_[1] = vertexAttrib0FakeBuferValue_[1] = 0;
	vertexAttrib0Value_[2] = vertexAttrib0FakeBuferValue_[2] = 0;
	vertexAttrib0Value_[3] = vertexAttrib0FakeBuferValue_[3] = 1;

	generation_ = InterlockedIncrement(&g_ctxGenerationCounter_);
}

CWebGLRenderingContext::~CWebGLRenderingContext()
{
	Uninit();
}

void ExtractWebGLContextAttributes(const VARIANT& attributes, BOOL& alpha, BOOL& depth,
	BOOL& stencil, BOOL& antialias, BOOL& premultipliedAlpha, BOOL& preserveDrawBuffer )
{
	alpha = TRUE;
	depth = TRUE;
	stencil = FALSE;
	antialias = TRUE;
	premultipliedAlpha = TRUE;
	preserveDrawBuffer = FALSE;

	if (attributes.vt == VT_DISPATCH && attributes.pdispVal)
	{
		CComPtr<IDispatch> dispAttr(attributes.pdispVal);

		CComVariant result;
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"alpha", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			alpha = result.boolVal;
		}
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"depth", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			depth = result.boolVal;
		}
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"stencil", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			stencil = result.boolVal;
		}
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"antialias", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			antialias = result.boolVal;
		}
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"premultipliedAlpha", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			premultipliedAlpha = result.boolVal;
		}
		if ( SUCCEEDED(InvokeHelper(dispAttr, L"preserveDrawingBuffer", DISPATCH_PROPERTYGET, result)) && SUCCEEDED(result.ChangeType(VT_BOOL)) )
		{
			preserveDrawBuffer = result.boolVal;
		}
	}
}

BOOL CWebGLRenderingContext::CreateEGLSurface()
{
	static const ULONG MinSurfaceSize = 1;

	auto fmt = isAlpha_ ? EGL_TEXTURE_RGBA : EGL_TEXTURE_RGB;
	

	if (!pluginObj_->GetHWND())
	{
		EGLint surfAttribs[] =
		{
			EGL_WIDTH, 1,
			EGL_HEIGHT, 1,
			EGL_TEXTURE_FORMAT, fmt,
			EGL_TEXTURE_TARGET, EGL_TEXTURE_2D,
			EGL_NONE
		};

		eglSurface_ = eglCreatePbufferSurface(eglDisplay_, eglConfig_, surfAttribs);
	}
	else
	{
		eglSurface_ = eglCreateWindowSurface(eglDisplay_, eglConfig_, pluginObj_->GetHWND(), nullptr);
	}
	
	return eglSurface_ != EGL_NO_SURFACE;
}

BOOL CWebGLRenderingContext::DeleteEGLSurface()
{
	if (!eglDestroySurface(eglDisplay_, eglSurface_))
		return FALSE;

	eglSurface_= NULL;
	return TRUE;
}

HRESULT CWebGLRenderingContext::CreateGLContext( BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, CComBSTR& errorMsg )
{
	if (!pluginObj_)
		return E_FAIL;

	/* "this" here is used as a device ID, ANGLE does not use it as a device context descriptor (HDC). */
	/* It is very important to have different ID for every context, as IE creates several tabs inside single process, */
	/* and ANGLE need this ID to create separate D3D device (that is not multi-threaded) for each thread */
	eglDisplay_ = eglGetDisplay(((EGLNativeDisplayType)this)); 
	if (eglDisplay_ == EGL_NO_DISPLAY)
	{
		errorMsg = L"can't get EGL default display";
		return E_FAIL;
	}

	EGLint majorVersion = 0, minorVersion = 0;
	if (!eglInitialize(eglDisplay_, &majorVersion, &minorVersion))
	{
		errorMsg = L"can't initialize EGL";
		return E_FAIL;
	}

	EGLint configsCount = 0;
	if (!eglGetConfigs(eglDisplay_, NULL, 0, &configsCount))
	{
		errorMsg = L"can't get EGL configs";
		return E_FAIL;
	}

	GLint attribList[] =
	{
		EGL_RED_SIZE,       8,
		EGL_GREEN_SIZE,     8,
		EGL_BLUE_SIZE,      8,
		EGL_ALPHA_SIZE,     alpha ? 8 : 0,
		EGL_DEPTH_SIZE,     (depth || stencil) ? 24 : 0,
		EGL_STENCIL_SIZE,   stencil ? 8 : 0,
		EGL_SAMPLE_BUFFERS, 0,
		EGL_NONE
	};

	if (!eglChooseConfig(eglDisplay_, attribList, &eglConfig_, 1, &configsCount))
	{
		errorMsg = L"can't choose EGL config";
		return E_FAIL;
	}

	eglCtx_ = eglCreateContext(eglDisplay_, eglConfig_, EGL_NO_CONTEXT, EGLContextAttribs);
	if (eglCtx_ == EGL_NO_CONTEXT)
	{
		errorMsg = L"can't create EGL context";
		return E_FAIL;
	}

	if (!CreateEGLSurface())
	{
		errorMsg = L"can't create EGL surface";
		return E_FAIL;
	}

	HRESULT hr = MakeCurrent();
	if(FAILED(hr))
	{
		errorMsg = L"can't make OpenGL context as current";
		return hr;
	}

	ULONG error = glGetError();
	if(error != GL_NO_ERROR)
	{
		FormatCComBSTR(errorMsg, L"Error OpenGL context creation; error code 0x%x", error);
		return E_FAIL;
	}

	return S_OK;
}

HRESULT CWebGLRenderingContext::CreatePrimaryFBO( BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, CComBSTR& errorMsg )
{
	HRESULT hr = primaryFBO_.Init(this, alpha, depth, stencil, antialias);
	if (FAILED(hr))
		errorMsg = L"can't create primary framebuffer object";

	return hr;
}


HRESULT CWebGLRenderingContext::MakeCurrent()
{
	if (!eglCtx_)
		return E_FAIL;

	if(eglGetCurrentContext() != eglCtx_)
	{
		if(!eglMakeCurrent(eglDisplay_, eglSurface_, eglSurface_, eglCtx_))
		{
			return E_FAIL;
		}
	}
	return S_OK;
}

HRESULT CWebGLRenderingContext::SwapBuffers()
{
	if (!eglDisplay_ || !eglSurface_)
		return S_OK;

	V_RET(MakeCurrent());

	CComPtr<IDirect3DSurface9> src;
	src.Attach(GetPrimarySurfaceD3DPtr());

	egl::Surface* surf = static_cast<egl::Surface*>(eglSurface_);
	CComPtr<IDirect3DSurface9> dest;
	dest.Attach(surf->getRenderTarget());

	egl::Display *display = static_cast<egl::Display*>(eglDisplay_);
	auto hr = display->getDevice()->StretchRect(src, nullptr, dest, nullptr, D3DTEXF_NONE);

	eglSwapBuffers(eglDisplay_, eglSurface_);
	return S_OK;
}

static ULONG GetLastValidFormat(const ULONG* formats, ULONG count, BOOL useAntialias = FALSE)
{
	assert(formats && "formats argument is null pointer");

	GLuint proxy = 0;
	glGenRenderbuffers(1, &proxy);
	glBindRenderbuffer(GL_RENDERBUFFER, proxy);

	ULONG lastValidFormat = 0;
	for(ULONG i = 0; i < count; ++i)
	{
		RenderbufferStorageEx(useAntialias, formats[i], 4, 4);
		if(glGetError() != GL_NO_ERROR)
			break;

		lastValidFormat = formats[i];
	}

	glBindRenderbuffer(GL_RENDERBUFFER, 0);
	glDeleteRenderbuffers(1, &proxy);

	return lastValidFormat;
}

ULONG GetSupportedDepthStencilFormat()
{
	if(GL_OES_packed_depth_stencil)
	{
		static const ULONG Formats[] = { GL_DEPTH24_STENCIL8 };
		return GetLastValidFormat(Formats, sizeof(Formats) / sizeof(Formats[0]));
	}
	return 0;
}

ULONG GetSupportedDepthFormat()
{
	static const ULONG Formats[] = { GL_DEPTH_COMPONENT16 };
	ULONG format = GetLastValidFormat(Formats, sizeof(Formats) / sizeof(Formats[0]));
	return format ? format : GetSupportedDepthStencilFormat();
}

ULONG GetSupportedStencilFormat()
{
	static const ULONG Formats[] = { GL_STENCIL_INDEX8 };
	ULONG format = GetLastValidFormat(Formats, sizeof(Formats) / sizeof(Formats[0]));
	return format ? format : GetSupportedDepthStencilFormat();
}

BOOL IsAntialiasSupported()
{
	static const ULONG RGBFormats[] = { GL_RGB8 };
	ULONG rgbFormat = GetLastValidFormat(RGBFormats, sizeof(RGBFormats) / sizeof(RGBFormats[0]), TRUE);

	static const ULONG RGBAFormats[] = { GL_RGBA8 };
	ULONG rgbaFormat = GetLastValidFormat(RGBAFormats, sizeof(RGBAFormats) / sizeof(RGBAFormats[0]), TRUE);

	return rgbFormat && rgbaFormat;
}

HRESULT CWebGLRenderingContext::GetDepthStencilFormats( CComBSTR& errorMsg )
{
	depthStencilFormat_ = GetSupportedDepthStencilFormat();
	if(depthStencilFormat_ == 0)
	{
		errorMsg = L"minimal required depth-stencil format no supported";
		return E_FAIL;
	}

	depthFormat_ = GetSupportedDepthFormat();
	stencilFormat_ = GetSupportedStencilFormat();

	return S_OK;
}

HRESULT CWebGLRenderingContext::GetGLValues( CComBSTR& errorMsg )
{
	isAntialias_ = isAntialias_ && IsAntialiasSupported();

	V_RET(GetDepthStencilFormats(errorMsg));
	V_RET(GetVendor());

	glGetIntegerv(GL_PACK_ALIGNMENT, (GLint*)&pixelStorePackAlignment_);
	glGetIntegerv(GL_UNPACK_ALIGNMENT, (GLint*)&pixelStoreUnpackAlignment_);

	glGetIntegerv(GL_STENCIL_WRITEMASK, (GLint*)&stencilWriteMask_);
	glGetIntegerv(GL_STENCIL_VALUE_MASK, (GLint*)&stencilValueMask_);
	glGetIntegerv(GL_STENCIL_REF, (GLint*)&stencilRef_);

	glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, (GLint*)&maxVertexAttribs_);
	glGetIntegerv(GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS, (GLint*)&maxTextureUnits_);
	glGetIntegerv(GL_MAX_TEXTURE_SIZE, (GLint*)&maxTextureSize_);
	glGetIntegerv(GL_MAX_RENDERBUFFER_SIZE, (GLint*)&maxRenderBufferSize_);
	glGetIntegerv(GL_MAX_CUBE_MAP_TEXTURE_SIZE, (GLint*)&maxCubeMapTextureSize_);
	glGetIntegerv(GL_MAX_TEXTURE_IMAGE_UNITS, (GLint*)&maxTextureImageUnits_);
	glGetIntegerv(GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS, (GLint*)&maxVertexTextureImageUnits_);

	glGetIntegerv(GL_MAX_FRAGMENT_UNIFORM_VECTORS, (GLint*) &maxFragmentUniformVectors_);
	glGetIntegerv(GL_MAX_VERTEX_UNIFORM_VECTORS, (GLint*) &maxVertexUniformVectors_);
	glGetIntegerv(GL_MAX_VARYING_VECTORS, (GLint*) &maxVaryingVectors_); 

	ULONG error = glGetError();
	if(error != GL_NO_ERROR)
	{
		FormatCComBSTR(errorMsg, L"Error getting OpenGL values; error code 0x%x", error);
		return E_FAIL;
	}

	return S_OK;
}

inline BOOL VendorStringMatch( const char* vendorString, const char* wantedVendor )
{
	const char* occurrence = strstr(vendorString, wantedVendor);

	// aWantedVendor not found
	if(!occurrence)
		return FALSE;

	// aWantedVendor preceded by alpha character
	if(occurrence != vendorString && isalpha(*(occurrence-1)))
		return FALSE;

	// aWantedVendor followed by alpha character
	const char *afterOccurrence = occurrence + strlen(wantedVendor);
	if(isalpha(*afterOccurrence))
		return FALSE;

	return TRUE;
}

HRESULT CWebGLRenderingContext::GetVendor()
{
	const char* glVendorString = (const char*)glGetString(GL_VENDOR);

	const char* vendorMatchStrings[VendorOther] =
	{
		"Intel",
		"NVIDIA",
		"ATI",
		"Qualcomm"
	};

	for(size_t i = 0; i < VendorOther; ++i)
	{
		if(VendorStringMatch(glVendorString, vendorMatchStrings[i]))
		{
			vendor_ = (Vendor)i;
			break;
		}
	}

	return S_OK;
}

HRESULT CWebGLRenderingContext::SetupGLContext( CComBSTR& errorMsg )
{
	attribBuffers_.SetCount(maxVertexAttribs_);
	bound2DTextures_.SetCount(maxTextureUnits_);
	boundCubeMapTextures_.SetCount(maxTextureUnits_);

	return S_OK;
}

HRESULT CWebGLRenderingContext::ValidateGLContext( CComBSTR& errorMsg )
{
	if(maxVertexAttribs_ < 8)
	{
		FormatCComBSTR(errorMsg, L"GL_MAX_VERTEX_ATTRIBS : %d is < 8!", maxVertexAttribs_);
		return E_FAIL;
	}

	if(maxTextureUnits_ < 8)
	{
		FormatCComBSTR(errorMsg, L"GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS : %d is < 8!", maxTextureUnits_);
		return E_FAIL;
	}

	ULONG error = glGetError();
	if(error != GL_NO_ERROR)
	{
		FormatCComBSTR(errorMsg, L"Error validtion OpenGL context; error code 0x%x", error);
		return E_FAIL;
	}

	return S_OK;
}

void CWebGLRenderingContext::CreateProxyTextures()
{
	GLint boundTexture2D = 0, boundTextureCube = 0, boundUnpackAlignment = 0;
	glGetIntegerv(GL_TEXTURE_BINDING_2D, &boundTexture2D);
	glGetIntegerv(GL_TEXTURE_BINDING_CUBE_MAP, &boundTextureCube);
	glGetIntegerv(GL_UNPACK_ALIGNMENT, &boundUnpackAlignment);

	const BYTE initData[] = { 0, 0, 0, 255 };

	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

	glGenTextures(1, (GLuint*)&proxyTexture2D_);
	glBindTexture(GL_TEXTURE_2D, proxyTexture2D_);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, &initData);

	glGenTextures(1, (GLuint*)&proxyTextureCube_);
	glBindTexture(GL_TEXTURE_CUBE_MAP, proxyTextureCube_);
	for (ULONG i = 0; i < GL_CUBEMAP_FACE_COUNT; ++i)
		glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_UNSIGNED_BYTE, &initData);

	glBindTexture(GL_TEXTURE_2D, boundTexture2D);
	glBindTexture(GL_TEXTURE_CUBE_MAP, boundTextureCube);
	glPixelStorei(GL_UNPACK_ALIGNMENT, boundUnpackAlignment);
}

void CWebGLRenderingContext::DeleteProxyTextures()
{
	glDeleteTextures(1, (GLuint*)&proxyTexture2D_);
	glDeleteTextures(1, (GLuint*)&proxyTextureCube_);
}

void CWebGLRenderingContext::BindProxyTextures()
{
	for(ULONG i = 0; i < (ULONG)maxTextureUnits_; ++i)
	{
		if (bound2DTextures_[i] && !bound2DTextures_[i]->IsComplete())
		{
			glActiveTexture(GL_TEXTURE0 + i);
			glBindTexture(GL_TEXTURE_2D, proxyTexture2D_);
		}
		if (boundCubeMapTextures_[i] && !boundCubeMapTextures_[i]->IsComplete())
		{
			glActiveTexture(GL_TEXTURE0 + i);
			glBindTexture(GL_TEXTURE_CUBE_MAP, proxyTextureCube_);
		}
	}
}

void CWebGLRenderingContext::UnbindProxyTextures()
{
	for(ULONG i = 0; i < (ULONG)maxTextureUnits_; ++i)
	{
		if (bound2DTextures_[i] && !bound2DTextures_[i]->IsComplete())
		{
			glActiveTexture(GL_TEXTURE0 + i);
			glBindTexture(GL_TEXTURE_2D, bound2DTextures_[i]->GetGLName());
		}
		if (boundCubeMapTextures_[i] && !boundCubeMapTextures_[i]->IsComplete())
		{
			glActiveTexture(GL_TEXTURE0 + i);
			glBindTexture(GL_TEXTURE_CUBE_MAP, boundCubeMapTextures_[i]->GetGLName());
		}
	}

	glActiveTexture(GL_TEXTURE0 + activeTexture_);
}

void CWebGLRenderingContext::CreateFakeVertexAttribBuffers()
{
	glGenBuffers(1, (GLuint*)&vertexAttrib0ZeroBuffer_);
	glGenBuffers(1, (GLuint*)&vertexAttrib0FakeBuffer_);
}

void CWebGLRenderingContext::DeleteFakeVertexAttribBuffers()
{
	glDeleteBuffers(1, (GLuint*)&vertexAttrib0ZeroBuffer_);
	glDeleteBuffers(1, (GLuint*)&vertexAttrib0FakeBuffer_);

	vertexAttrib0FakeBufferSize_ = 0;
	vertexAttrib0ZeroBufferSize_ = 0;

	vertexAttrib0Value_[0] = vertexAttrib0FakeBuferValue_[0] = 0;
	vertexAttrib0Value_[1] = vertexAttrib0FakeBuferValue_[1] = 0;
	vertexAttrib0Value_[2] = vertexAttrib0FakeBuferValue_[2] = 0;
	vertexAttrib0Value_[3] = vertexAttrib0FakeBuferValue_[3] = 1;
}

void CWebGLRenderingContext::RebuildVertexAttrib0ZeroBuffer( ULONG vertexCount )
{
	const ULONG byteSize = vertexCount * 4 * sizeof(float);

	if (vertexAttrib0ZeroBufferSize_ < byteSize)
	{
		vertexAttrib0ZeroBufferSize_ = byteSize;
		glBindBuffer(GL_ARRAY_BUFFER, vertexAttrib0ZeroBuffer_);
		glBufferData(GL_ARRAY_BUFFER, vertexAttrib0ZeroBufferSize_, NULL, GL_DYNAMIC_DRAW);

		glBindBuffer(GL_ARRAY_BUFFER, boundArrayBuffer_ ? boundArrayBuffer_->GetGLName() : 0);
	}
}

void CWebGLRenderingContext::RebuildVertexAttrib0FakeBuffer( ULONG vertexCount )
{
	const ULONG byteSize = vertexCount * 4 * sizeof(float);

	if (vertexAttrib0FakeBufferSize_ < byteSize ||
		vertexAttrib0FakeBuferValue_[0] != vertexAttrib0Value_[0] ||
		vertexAttrib0FakeBuferValue_[1] != vertexAttrib0Value_[1] ||
		vertexAttrib0FakeBuferValue_[2] != vertexAttrib0Value_[2] ||
		vertexAttrib0FakeBuferValue_[3] != vertexAttrib0Value_[3])
	{
		CAtlArray<float> data;
		data.SetCount(vertexCount * 4);
		for(size_t i = 0; i < vertexCount; ++i)
		{
			data[4 * i + 0] = vertexAttrib0Value_[0];
			data[4 * i + 1] = vertexAttrib0Value_[1];
			data[4 * i + 2] = vertexAttrib0Value_[2];
			data[4 * i + 3] = vertexAttrib0Value_[3];
		}

		vertexAttrib0FakeBufferSize_ = byteSize;
		glBindBuffer(GL_ARRAY_BUFFER, vertexAttrib0FakeBuffer_);
		glBufferData(GL_ARRAY_BUFFER, vertexAttrib0FakeBufferSize_, data.GetData(), GL_DYNAMIC_DRAW);

		glBindBuffer(GL_ARRAY_BUFFER, boundArrayBuffer_ ? boundArrayBuffer_->GetGLName() : 0);
	}
}

void CWebGLRenderingContext::DoFakeVertexAttrib0( ULONG vertexCount )
{
	if (attribBuffers_[0].enabled)
		return;

	if (!currentProgram_->IsAttribInUse(0))
	{
		RebuildVertexAttrib0ZeroBuffer(vertexCount);
		glBindBuffer(GL_ARRAY_BUFFER, vertexAttrib0ZeroBuffer_);
	}
	else
	{
		RebuildVertexAttrib0FakeBuffer(vertexCount);
		glBindBuffer(GL_ARRAY_BUFFER, vertexAttrib0FakeBuffer_);
	}

	glVertexAttribPointer(0, 4, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(0);
}

void CWebGLRenderingContext::UndoFakeVertexAttrib0()
{
	if (attribBuffers_[0].enabled)
		return;

	const WebGLVertexAttrib& attr0 = attribBuffers_[0];
	glBindBuffer(GL_ARRAY_BUFFER, attribBuffers_[0].buffer ? attribBuffers_[0].buffer->GetGLName() : 0);
	glVertexAttribPointer(0, attr0.size, attr0.type, attr0.normalized, attr0.stride, (const GLvoid*)attr0.byteOffset);

	glBindBuffer(GL_ARRAY_BUFFER, boundArrayBuffer_ ? boundArrayBuffer_->GetGLName() : 0);
}

WebGLTexturePtr CWebGLRenderingContext::GetBoundTexture( ULONG target ) const
{
	switch (target)
	{
	case GL_TEXTURE_2D:
		return bound2DTextures_[activeTexture_];
	case GL_TEXTURE_CUBE_MAP:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_X:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_X:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_Y:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_Y:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_Z:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_Z:
		return boundCubeMapTextures_[activeTexture_];
	}
	return WebGLTexturePtr();
}

WebGLBufferPtr CWebGLRenderingContext::GetBoundBuffer(ULONG target) const
{
	switch (target)
	{
	case GL_ARRAY_BUFFER: return boundArrayBuffer_;
	case GL_ELEMENT_ARRAY_BUFFER: return boundElementArrayBuffer_;
	}
	return WebGLBufferPtr();
}

HRESULT CWebGLRenderingContext::GenerateError( const BSTR fmt /*= 0*/, ... )
{
	if (!pluginObj_)
		return E_FAIL;

	va_list va;
	va_start(va, fmt);
	CAtlString str;
	str.FormatV(fmt, va);
	pluginObj_->Log(str.GetBuffer(), 0);
	va_end(va);

	return E_FAIL;
}

HRESULT CWebGLRenderingContext::GenerateError( ULONG error, const BSTR fmt /*= 0*/, ... )
{
	if (!pluginObj_)
		return E_FAIL;

	va_list va;
	va_start(va, fmt);
	CAtlString str;
	str.FormatV(fmt, va);
	pluginObj_->Log(str.GetBuffer(), 0);
	va_end(va);

	for(ULONG i = 0; i < syntheticErrors_.GetCount(); ++i)
	{
		if(syntheticErrors_[i] == error)
			return S_OK;
	}

	syntheticErrors_.SetAtGrow(syntheticErrors_.GetCount(), error);
	return S_OK;
}

HRESULT CWebGLRenderingContext::Init( const VARIANT& attributes, IPluginObject* pluginObj, CComBSTR& errorMsg )
{
	pluginObj_ = pluginObj;
	if (!pluginObj_)
		return E_FAIL;

	ExtractWebGLContextAttributes(attributes, isAlpha_, isDepth_, isStencil_, isAntialias_, isPremultiplied_, isPreserveDrawBuffer_);

	V_RET(InitDispEx());
	V_RET(CreateWebGLContextAttributes(isAlpha_, isDepth_, isStencil_, isAntialias_, isPremultiplied_, isPreserveDrawBuffer_, contextAttr_));
	V_RET(CreateGLContext(isAlpha_, isDepth_, isStencil_, isAntialias_, errorMsg));
	V_RET(GetGLValues(errorMsg));
	V_RET(CreatePrimaryFBO(isAlpha_, isDepth_, isStencil_, isAntialias_, errorMsg));
	V_RET(SetupGLContext(errorMsg));
	V_RET(ValidateGLContext(errorMsg));

	V_RET(pixelReader_.Init());

	CreateProxyTextures();
	CreateFakeVertexAttribBuffers();

	ULONG error = glGetError();
	if(error != GL_NO_ERROR)
	{
		FormatCComBSTR(errorMsg, L"Error initialization OpenGL context; error code 0x%x", error);
		return E_FAIL;
	}

	return S_OK;
}

template <typename T, typename U> void DeleteObjects(T& container, U function, CWebGLRenderingContext* ctx)
{
	while (container.GetCount() > 0)
	{
		auto v = container.GetValueAt(container.GetStartPosition());
		if ( v && !v->IsDeleted() )
		{
			(ctx->*function)(v);
		}
		else
		{
			container.RemoveAtPos(container.GetStartPosition());
		}
	}
}

void CWebGLRenderingContext::Uninit()
{
	MakeCurrent();

	DeleteProxyTextures();
	DeleteFakeVertexAttribBuffers();

	// cleanup WebGL collections and null special references to ensure WebGL object's
	// destruction will not happen in CWebGLRenderingContext destructor

	attribBuffers_.RemoveAll();
	uniformTextures_.RemoveAll();
	bound2DTextures_.RemoveAll();
	boundCubeMapTextures_.RemoveAll();

	boundArrayBuffer_ = nullptr;
	boundElementArrayBuffer_ = nullptr;
	currentProgram_ = nullptr;

	boundFramebuffer_ = nullptr;
	boundRenderbuffer_ = nullptr; 
	
	DeleteObjects(mapShaders_, &CWebGLRenderingContext::deleteShader, this);
	DeleteObjects(mapPrograms_, &CWebGLRenderingContext::deleteProgram, this);
	DeleteObjects(mapBuffers_, &CWebGLRenderingContext::deleteBuffer, this);
	DeleteObjects(mapTextures_, &CWebGLRenderingContext::deleteTexture, this);
	DeleteObjects(mapFramebuffers_, &CWebGLRenderingContext::deleteFramebuffer, this);
	DeleteObjects(mapRenderbuffers_, &CWebGLRenderingContext::deleteRenderbuffer, this);

	if (eglCtx_)
	{
		primaryFBO_.UnInit();

		glMakeCurrent(nullptr, nullptr, nullptr);
		DeleteEGLSurface();

		eglDestroyContext(eglDisplay_, eglCtx_);
		eglCtx_ = NULL;

		//eglTerminate(eglDisplay_); is called in egl::Display destructor, that is not called elsewhere (may be ANGLE bug), but here.
		egl::Display* dpy = static_cast<egl::Display*>(eglDisplay_);
		eglDisplay_ = NULL;
		delete dpy;
	}

	pluginObj_ = nullptr;
}

template <typename T, typename U, typename V, typename W>
void CleanupResourceContainer(CAtlMap<T, U, V, W>& container)
{
	CAtlArray<ULONG> oldResources;
	auto pos = container.GetStartPosition();
	while (pos)
	{
		auto rawPtr = container.GetValueAt(pos).get();

		auto refCount = rawPtr->AddRef()-1;
		rawPtr->Release();

		if ( refCount == 1 ) // the only ref is in the map*_
		{
			oldResources.Add(container.GetKeyAt(pos));
		}
		
		container.GetNext(pos);
	}

	for (size_t i = 0; i < oldResources.GetCount(); ++i)
	{
		container.RemoveKey(oldResources[i]);
	}
}

// free WebGL objects that had been created, possibly used, and gone out of scope and all JS references to them were destroyed without calling gl.delete*().
// Such resources are resided in map*_ collection and can be freed according to webgl spec.
void CWebGLRenderingContext::CleanupOldResources()
{
	CleanupResourceContainer(mapShaders_);
	CleanupResourceContainer(mapPrograms_);
	CleanupResourceContainer(mapBuffers_);
	CleanupResourceContainer(mapTextures_);
	CleanupResourceContainer(mapFramebuffers_);
	CleanupResourceContainer(mapRenderbuffers_);
}

BOOL CWebGLRenderingContext::IsContextLost() const
{
	if (!eglDisplay_)
		return FALSE;

	return static_cast<egl::Display*>(eglDisplay_)->isDeviceLost();
}

HRESULT CWebGLRenderingContext::ResetLostContext()
{
	V_RET(MakeCurrent());

	DeleteProxyTextures();
	DeleteFakeVertexAttribBuffers();

	ULONG width = primaryFBO_.GetWidth();
	ULONG height = primaryFBO_.GetHeight();
	primaryFBO_.UnInit();

	V_RET(DeleteEGLSurface() ? S_OK : E_FAIL);

	egl::Display* dpy = static_cast<egl::Display*>(eglDisplay_);
	dpy->endScene();
	
	eglDestroyContext(eglDisplay_, eglCtx_);
	eglCtx_ = nullptr;
	generation_ = InterlockedIncrement(&g_ctxGenerationCounter_);

	eglCtx_ = eglCreateContext(eglDisplay_, eglConfig_, EGL_NO_CONTEXT, EGLContextAttribs);
	if (eglCtx_ == EGL_NO_CONTEXT)
		return E_FAIL;
	
	V_RET(CreateEGLSurface() ? S_OK : E_FAIL);

	V_RET(primaryFBO_.Init(this, isAlpha_, isDepth_, isStencil_, isAntialias_));
	primaryFBO_.Resize(width, height);

	CreateProxyTextures();
	CreateFakeVertexAttribBuffers();

	dpy->startScene();

	return S_OK;
}

void CWebGLRenderingContext::Invalidate()
{
	if (boundFramebuffer_)
		return;

	if (!pluginObj_)
		return;
	
	pluginObj_->Invalidate();
}

HRESULT CWebGLRenderingContext::ResizePrimarySurface( ULONG width, ULONG height )
{
	V_RET(MakeCurrent());

	V_RET(primaryFBO_.Resize(width, height));

	if (isInitialResize_)
	{
		glViewport(0, 0, width, height);
		glScissor(0, 0, width, height);

		primaryFBO_.Clear();

		if (glGetError() != GL_NO_ERROR)
			return E_FAIL;

		isInitialResize_ = FALSE;
	}

	return S_OK;
}

HRESULT CWebGLRenderingContext::ClearPrimarySurface()
{
	V_RET(MakeCurrent());
	primaryFBO_.Clear();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::toString( BSTR* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = SysAllocString(L"[object WebGLRenderingContext]");
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::get_canvas( IDispatch** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	CComQIPtr<IDispatch> pluginCanvas(pluginObj_);
	*retVal = pluginCanvas;
	if (*retVal)
	{
		(*retVal)->AddRef();
	}
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::get_drawingBufferWidth( ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = primaryFBO_.GetWidth();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::get_drawingBufferHeight( ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = primaryFBO_.GetHeight();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getContextAttributes( IWebGLContextAttributes** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = contextAttr_;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isContextLost( VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(IsContextLost() ? true : false).Detach(retVal));
	return S_OK;
}

static BOOL IsExtensionInList( const char* extListStr, const char* extStr )
{
	if (!extListStr || !extStr)
		return FALSE;

	size_t extListStrLength = strlen(extListStr);
	size_t extStrLength = strlen(extStr);

	if (extListStrLength == 0 || extStrLength == 0)
		return FALSE;

	return strstr(extListStr, extStr) != NULL;
}

STDMETHODIMP CWebGLRenderingContext::getSupportedExtensions( IDispatch** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (!pluginObj_)
		return E_FAIL;

	ScriptArray<CComBSTR> sa;

	CComPtr<IDispatchEx> ctx;
	V_RET(pluginObj_->GetScriptContext(ctx));

	V_RET(sa.Init(ctx));

	V_RET(MakeCurrent());
	const char* glExtList = (const char*)glGetString(GL_EXTENSIONS);
	if (IsExtensionInList(glExtList, "GL_OES_texture_float")) { V_RET(sa.Append(L"OES_texture_float")); }
	if (IsExtensionInList(glExtList, "GL_OES_standard_derivatives")) { V_RET(sa.Append(L"OES_standard_derivatives")); }
	if ((IsExtensionInList(glExtList, "GL_EXT_texture_compression_dxt1") ||
		IsExtensionInList(glExtList, "GL_ANGLE_texture_compression_dxt3") ||
		IsExtensionInList(glExtList, "GL_ANGLE_texture_compression_dxt5"))) { V_RET(sa.Append(L"WEBGL_compressed_texture_s3tc")); }
	if (IsExtensionInList(glExtList, "GL_EXT_texture_filter_anisotropic")) { V_RET(sa.Append(L"EXT_texture_filter_anisotropic")); }

	CComPtr<IDispatch> arr;
	V_RET(sa.GetScriptArray(arr));
	*retVal = arr;
	(*retVal)->AddRef();
	return S_OK;
}

HRESULT CWebGLRenderingContext::TryToCreateExtension( const BSTR name, CComPtr<IDispatch>& obj )
{
	V_RET(MakeCurrent());
	const char* glExtList = (const char*)glGetString(GL_EXTENSIONS);

	CComBSTR bstrName(name);
	if (bstrName == L"oes_texture_float" && IsExtensionInList(glExtList, "GL_OES_texture_float"))
	{
		V_RET(CreateOESTextureFloatEXT(obj));
		extensions_.SetAt(bstrName, obj);
		validatorTextureType_.AddValue(GL_FLOAT);
	}
	else if (bstrName == L"oes_standard_derivatives" && IsExtensionInList(glExtList, "GL_OES_standard_derivatives"))
	{
		V_RET(CreateOESStandardDerivativesEXT(obj));
		extensions_.SetAt(bstrName, obj);
		validatorHint_.AddValue(GL_FRAGMENT_SHADER_DERIVATIVE_HINT_OES);
	}
	else if (bstrName == L"webgl_compressed_texture_s3tc" &&
		(IsExtensionInList(glExtList, "GL_EXT_texture_compression_dxt1") ||
		IsExtensionInList(glExtList, "GL_ANGLE_texture_compression_dxt3") ||
		IsExtensionInList(glExtList, "GL_ANGLE_texture_compression_dxt5")))
	{
		V_RET(CreateWebGLCompressedTextureS3TCEXT(obj));
		extensions_.SetAt(bstrName, obj);

		static_assert(sizeof(GLint) == sizeof(ULONG), "ULONG and GLint are of different size");

		GLint count = 0;
		glGetIntegerv(GL_NUM_COMPRESSED_TEXTURE_FORMATS, &count);
		compressedTexFormats_.SetCount(count);
		glGetIntegerv(GL_COMPRESSED_TEXTURE_FORMATS, (GLint*)compressedTexFormats_.GetData());
	}
	else if (bstrName == L"ext_texture_filter_anisotropic" && IsExtensionInList(glExtList, "GL_EXT_texture_filter_anisotropic"))
	{
		V_RET(CreateEXTTextureFilterAnisotropic(obj));
		extensions_.SetAt(bstrName, obj);
	}

	return S_OK;
}

BOOL CWebGLRenderingContext::IsExtensionEnabled( const BSTR name ) const
{
	CComBSTR bstrName(name);
	bstrName.ToLower();

	CComPtr<IDispatch> obj;
	return extensions_.Lookup(bstrName, obj) ? TRUE : FALSE;
}

STDMETHODIMP CWebGLRenderingContext::getExtension( BSTR name, IDispatch** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	CComBSTR bstrName(name);
	V_RET(bstrName.ToLower());

	CComPtr<IDispatch> obj;
	if ( !extensions_.Lookup(bstrName, obj) )
	{
		V_RET(TryToCreateExtension(bstrName, obj));
		if (!obj)
		{
			*retVal = nullptr;
			return S_OK;
		}
	}

	*retVal = obj;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::activeTexture( ULONG texture )
{
	if (IsContextLost())
		return S_OK;

	const ULONG boundTexCount = (ULONG)bound2DTextures_.GetCount();
	if (texture < GL_TEXTURE0 || texture >= GL_TEXTURE0 + boundTexCount)
		return GenerateError(GL_INVALID_ENUM, L"activeTexture: texture unit %d out of range (0..%d)", texture, boundTexCount-1);

	V_RET(MakeCurrent());

	activeTexture_ = texture - GL_TEXTURE0;
	glActiveTexture(texture);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::attachShader( IWebGLProgram* program, IWebGLShader* shader )
{
	if (IsContextLost())
		return S_OK;

	WebGLProgramType *programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"attachShader: program", *this));

	WebGLShaderType *shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"attachShader: shader", *this));

	if (!programImpl->AttachShader(shaderImpl))
		return GenerateError(GL_INVALID_OPERATION, L"attachShader: shader is already attached");

	V_RET(MakeCurrent());

	glAttachShader(programImpl->GetGLName(), shaderImpl->GetGLName());
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::bindAttribLocation( IWebGLProgram* program, ULONG index, BSTR name )
{
	if (IsContextLost())
		return S_OK;

	WebGLProgramType *programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"bindAttribLocation: program", *this));

	_bstr_t strName(name);
	if (!name || !strName.length())
		return GenerateError(GL_INVALID_VALUE, L"bindAttribLocation: name can't be null or empty");

	if (!ValidateAttribIndex(index, L"bindAttribLocation"))
		return S_OK;

	V_RET(MakeCurrent());

	_bstr_t str(name);
	if (!IsASCIIString((const char *)str, str.length()))
		return GenerateError(GL_INVALID_VALUE, L"bindAttribLocation: name containing national symbols");

	glBindAttribLocation(programImpl->GetGLName(), index, (const char*)strName);
	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::bindBuffer( ULONG target, IWebGLBuffer* buffer )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	WebGLBufferType* bufferImpl = nullptr;
	WEBGL_RET(GetConcrete(buffer, bufferImpl, L"bindBuffer: buffer", *this, &isNull));

	ULONG boundTarget = isNull ? GL_NONE : bufferImpl->GetTarget();
	if ((boundTarget != GL_NONE) && (boundTarget != target))
		return GenerateError(GL_INVALID_OPERATION, L"bindBuffer: buffer already bound to a different target");

	switch(target)
	{
	case GL_ARRAY_BUFFER :
		boundArrayBuffer_ = bufferImpl; break;
	case GL_ELEMENT_ARRAY_BUFFER :
		boundElementArrayBuffer_ = bufferImpl; break;
	default :
		return GenerateError(GL_INVALID_ENUM, L"bindBuffer: target");
	}

	V_RET(MakeCurrent());

	glBindBuffer(target, isNull ? 0 : bufferImpl->GetGLName());
	if (!isNull) bufferImpl->Bind(target);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::bindFramebuffer( ULONG target, IWebGLFramebuffer* framebuffer )
{
	if (IsContextLost())
		return S_OK;

	if (target != GL_FRAMEBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"bindFramebuffer: target");

	BOOL isNull = FALSE;
	WebGLFramebufferType *framebufferImpl = nullptr;
	WEBGL_RET(GetConcrete(framebuffer, framebufferImpl, L"bindFramebuffer: framebuffer", *this, &isNull));

	boundFramebuffer_ = framebufferImpl;

	V_RET(MakeCurrent());

	glBindFramebuffer(target, isNull ? primaryFBO_.GetGLName() : framebufferImpl->GetGLName());	
	if (!isNull) framebufferImpl->Bind();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::bindRenderbuffer( ULONG target, IWebGLRenderbuffer* renderbuffer )
{
	if (IsContextLost())
		return S_OK;

	if (target != GL_RENDERBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"bindRenderbuffer: target");

	BOOL isNull = FALSE;
	WebGLRenderbufferType * renderbufferImpl = nullptr;
	WEBGL_RET(GetConcrete(renderbuffer, renderbufferImpl, L"bindRenderbuffer: renderbuffer", *this, &isNull));

	boundRenderbuffer_ = renderbufferImpl;

	V_RET(MakeCurrent());

	glBindRenderbuffer(GL_RENDERBUFFER, isNull ? 0 : renderbufferImpl->GetGLName());
	if (!isNull) renderbufferImpl->Bind();
	return S_OK;
}

inline BOOL FindTexturePtr( const CAtlArray<WebGLTexturePtr,
	CWebGLPtrElementTraits<WebGLTextureType> >& textures, IWebGLTexture* texture )
{
	for(ULONG i = 0; i < textures.GetCount(); ++i)
	{
		if(textures[i].get() == texture)
			return TRUE;
	}
	return FALSE;
}

STDMETHODIMP CWebGLRenderingContext::bindTexture( ULONG target, IWebGLTexture* texture )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	WebGLTextureType* textureImpl = nullptr;
	WEBGL_RET(GetConcrete(texture, textureImpl, L"bindTexture: texture", *this, &isNull));

	if (!isNull)
	{
		switch (target)
		{
		case GL_TEXTURE_2D :
			{
				if(FindTexturePtr(boundCubeMapTextures_, texture))
					return GenerateError(GL_INVALID_OPERATION, L"bindTexture: texture has already been bound to a different target");
				bound2DTextures_[activeTexture_] = textureImpl;
			} break;
		case GL_TEXTURE_CUBE_MAP :
			{
				if(FindTexturePtr(bound2DTextures_, texture))
					return GenerateError(GL_INVALID_OPERATION, L"bindTexture: texture has already been bound to a different target");
				boundCubeMapTextures_[activeTexture_] = textureImpl;
			} break;
		default :
			return GenerateError(GL_INVALID_ENUM, L"bindTexture: target");
		}
	}

	V_RET(MakeCurrent());

	glBindTexture(target, isNull ? 0 : textureImpl->GetGLName());
	if (!isNull) textureImpl->Bind(target);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::blendColor( FLOAT red, FLOAT green, FLOAT blue, FLOAT alpha )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glBlendColor(red, green, blue, alpha);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::blendEquation( ULONG mode )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateBlendEquationEnum(mode, L"blendEquation: mode"))
		return S_OK;

	V_RET(MakeCurrent());

	glBlendEquation(mode);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::blendEquationSeparate( ULONG modeRGB, ULONG modeAlpha )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateBlendEquationEnum(modeRGB, L"blendEquationSeparate: modeRGB") ||
		!ValidateBlendEquationEnum(modeAlpha, L"blendEquationSeparate: modeAlpha"))
		return S_OK;

	V_RET(MakeCurrent());

	glBlendEquationSeparate(modeRGB, modeAlpha);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::blendFunc( ULONG sfactor, ULONG dfactor )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateBlendFuncSrcEnum(sfactor, L"blendFunc: sfactor") ||
		!ValidateBlendFuncDstEnum(dfactor, L"blendFunc: dfactor"))
		return S_OK;

	if (!ValidateBlendFuncEnumsCompatibility(sfactor, dfactor, L"blendFuncSeparate: srcRGB and dstRGB"))
		return S_OK;

	V_RET(MakeCurrent());

	glBlendFunc(sfactor, dfactor);
	return S_OK;	
}

STDMETHODIMP CWebGLRenderingContext::blendFuncSeparate( ULONG srcRGB, ULONG dstRGB, ULONG srcAlpha, ULONG dstAlpha )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateBlendFuncSrcEnum(srcRGB, L"blendFuncSeparate: srcRGB") ||
		!ValidateBlendFuncSrcEnum(srcAlpha, L"blendFuncSeparate: srcAlpha") ||
		!ValidateBlendFuncDstEnum(dstRGB, L"blendFuncSeparate: dstRGB") ||
		!ValidateBlendFuncDstEnum(dstAlpha, L"blendFuncSeparate: dstAlpha"))
		return S_OK;

	if (!ValidateBlendFuncEnumsCompatibility(srcRGB, dstRGB, L"blendFuncSeparate: srcRGB and dstRGB"))
		return S_OK;

	V_RET(MakeCurrent());

	glBlendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::bufferData( ULONG target, VARIANT arg1, VARIANT arg2 )
{
	if (IsContextLost())
		return S_OK;

	if (arg1.vt == VT_EMPTY || arg2.vt == VT_EMPTY)
		return GenerateError(GL_INVALID_VALUE, L"bufferData: invalid argument count");
	if (arg1.vt == VT_NULL)
		return GenerateError(GL_INVALID_VALUE, L"bufferData: passed data is null");

	ULONG usage = 0;
	V_RET(DataConvertion::ECMACvt(usage, arg2));

	if (arg1.vt == VT_DISPATCH)
	{
		CComQIPtr<IArrayBufferView> view(arg1.pdispVal);
		CComQIPtr<IArrayBuffer> array(arg1.pdispVal);
		if (view)
			return bufferDataImpl(target, GetArraySize(view), GetArrayData(view), usage);
		if (array)
			return bufferDataImpl(target, GetArraySize(array), GetArrayData(array), usage);
	}
	else
	{
		ULONG size = 0;
		V_RET(DataConvertion::ECMACvt(size, arg1));
		CAtlArray<BYTE> data;
		data.SetCount(size);
		return bufferDataImpl(target, size, size ? data.GetData() : 0, usage);
	}
	
	return E_INVALIDARG;
}

HRESULT CWebGLRenderingContext::bufferDataImpl( ULONG target, LONG size, const BYTE* data, ULONG usage )
{
	if (!ValidateBufferTarget(target, L"bufferData: target") ||
		!ValidateBufferUsage(usage, L"bufferData: usage"))
		return S_OK;

	if (size < 0)
		return GenerateError(GL_INVALID_VALUE, L"bufferData: size is negative");

	WebGLBufferPtr buffer = GetBoundBuffer(target);
	if (!buffer)
		return GenerateError(GL_INVALID_OPERATION, L"bufferData: no buffer is bound");

	V_RET(MakeCurrent());

	buffer->BufferData(target, usage, size, data);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::bufferSubData( ULONG target, LONG offset, IDispatch* data )
{
	if (IsContextLost())
		return S_OK;

	CComQIPtr<IArrayBufferView> view(data);
	CComQIPtr<IArrayBuffer> array(data);

	if (view)
		return bufferSubDataImpl(target, offset, GetArraySize(view), GetArrayData(view));

	if (array)
		return bufferSubDataImpl(target, offset, GetArraySize(array), GetArrayData(array));

	return E_INVALIDARG;
}

HRESULT CWebGLRenderingContext::bufferSubDataImpl( ULONG target, LONG offset, LONG size, const BYTE* data )
{
	if (!ValidateBufferTarget(target, L"bufferSubData: target"))
		return S_OK;

	if (offset < 0)
		return GenerateError(GL_INVALID_VALUE, L"bufferSubData: offset is negative");

	if (size < 0)
		return GenerateError(GL_INVALID_VALUE, L"bufferSubData: size is negative");

	WebGLBufferPtr buffer = GetBoundBuffer(target);
	if (!buffer)
		return GenerateError(GL_INVALID_OPERATION, L"bufferSubData: no buffer is bound");

	ULONG requiredSize = offset + size;
	if (requiredSize > buffer->GetByteSize())
		return GenerateError(GL_INVALID_VALUE, L"bufferSubData: data would be written past the end of the buffer object ");

	V_RET(MakeCurrent());

	buffer->BufferSubData(target, offset, size, data);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::checkFramebufferStatus( ULONG target, ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (IsContextLost())
	{
		*retVal = GL_FRAMEBUFFER_UNSUPPORTED;
		return S_OK;
	}

	if (target != GL_FRAMEBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"checkFramebufferStatus : target");

	V_RET(MakeCurrent());

	ULONG status = glCheckFramebufferStatus(target);
	if (boundFramebuffer_)
	{
		ULONG webGLStatus = boundFramebuffer_->CheckStatus();
		status = (webGLStatus != GL_FRAMEBUFFER_COMPLETE) ? webGLStatus : status;
	}

	*retVal = status;
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::clear( ULONG mask )
{
	if (IsContextLost())
		return S_OK;

	if (mask != (mask & (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT)))
		return GenerateError(GL_INVALID_VALUE, L"clear: invalid mask bits");

	if(!ValidateBoundFramebufferStatus(L"clear"))
		return S_OK;

	V_RET(MakeCurrent());

	glClear(mask);
	Invalidate();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::clearColor( FLOAT red, FLOAT green, FLOAT blue, FLOAT alpha )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glClearColor(Clamp<FLOAT>(red, 0, 1), Clamp<FLOAT>(green, 0, 1), Clamp<FLOAT>(blue, 0, 1), Clamp<FLOAT>(alpha, 0, 1));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::clearDepth( FLOAT depth )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glClearDepthf(Clamp<FLOAT>(depth, 0, 1));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::clearStencil( LONG s )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glClearStencil(s);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::colorMask( BOOL red, BOOL green, BOOL blue, BOOL alpha )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glColorMask(red, green, blue, alpha);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::compileShader( IWebGLShader* shader )
{
	if (IsContextLost())
		return S_OK;

	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"compileShader: shader", *this));

	V_RET(MakeCurrent());

	if (shaderImpl->GetNeedsTranslation())
	{
		const char *code = shaderImpl->GetSource();
		if (!code)
		{
			shaderImpl->SetShaderInfoLog("no source code loaded");
			return S_OK;
		}

		ShBuiltInResources resources;
		memset(&resources, 0, sizeof(ShBuiltInResources));

		resources.MaxVertexAttribs = maxVertexAttribs_;
		resources.MaxVertexUniformVectors = maxVertexUniformVectors_;
		resources.MaxVaryingVectors = maxVaryingVectors_;
		resources.MaxVertexTextureImageUnits = maxVertexTextureImageUnits_;
		resources.MaxCombinedTextureImageUnits = maxTextureUnits_;
		resources.MaxTextureImageUnits = maxTextureImageUnits_;
		resources.MaxFragmentUniformVectors = maxFragmentUniformVectors_;
		resources.OES_standard_derivatives = IsExtensionEnabled(L"OES_standard_derivatives");
		resources.MaxDrawBuffers = 1;
		resources.FragmentPrecisionHigh = 1;

		ShHandle compiler = ShConstructCompiler((ShShaderType)shaderImpl->ShaderType(), SH_WEBGL_SPEC, SH_ESSL_OUTPUT, &resources);

		if (!ShCompile(compiler, &code, 1,
			SH_VALIDATE | SH_VALIDATE_LOOP_INDEXING | SH_MAP_LONG_VARIABLE_NAMES |
			SH_UNROLL_FOR_LOOP_WITH_INTEGER_INDEX | SH_OBJECT_CODE | SH_ATTRIBUTES_UNIFORMS |
			SH_EMULATE_BUILT_IN_FUNCTIONS))
		{
			size_t len = 0;
			ShGetInfo(compiler, SH_INFO_LOG_LENGTH, &len);

			if (len)
			{
				CAtlStringA info;
				info.Preallocate(len);

				ShGetInfoLog(compiler, info.GetBuffer());
				shaderImpl->SetShaderInfoLog(info.GetBuffer());
			}
			else
			{
				shaderImpl->SetShaderInfoLog("Internal error: failed to get shader info log");
			}
			ShDestruct(compiler);
			return S_OK;
		}

		shaderImpl->ResetInfo();

		size_t auCount = 0;
		size_t maxNameLength = 0;
		ShGetInfo(compiler, SH_ACTIVE_UNIFORMS, &auCount);
		ShGetInfo(compiler, SH_ACTIVE_UNIFORM_MAX_LENGTH, &maxNameLength);

		CAtlStringA name;
		name.Preallocate(maxNameLength);
		for (size_t i = 0; i < auCount; ++i)
		{
			size_t length = 0;
			int size = 0;
			ShDataType type;
		
			ShGetActiveUniform(compiler, i, &length, &size, &type, name.GetBuffer(), nullptr);
			shaderImpl->AddActiveUniform(name.GetString(), size, type);
		}

		size_t len = 0;
		ShGetInfo(compiler, SH_OBJECT_CODE_LENGTH, &len);

		CAtlArray<CHAR> translatedSrc;
		translatedSrc.SetCount(len);

		ShGetObjectCode(compiler, translatedSrc.GetData());

		const GLchar* translatedCode = translatedSrc.GetData();
		glShaderSource(shaderImpl->GetGLName(), 1, &translatedCode, NULL);

		shaderImpl->SetNeedsTranslation(FALSE);
		shaderImpl->SetTranslationSuccess(TRUE);

		ShDestruct(compiler);
	}
	else if (!shaderImpl->GetTranslationSuccess())
	{
		const char* code = shaderImpl->GetSource();
		glShaderSource(shaderImpl->GetGLName(), 1, &code, NULL);
		shaderImpl->SetTranslationSuccess(TRUE);
	}

	glCompileShader(shaderImpl->GetGLName());

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::compressedTexImage2D(ULONG target, LONG level, ULONG internalformat,
                              LONG width, LONG height, LONG border,
                              IArrayBufferView* data)
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureOpTarget(target, L"compressedTexImage2D: target") ||
		!ValidateCompressedTextureFormat(internalformat, L"compressedTexImage2D: internalformat"))
		return S_OK;

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: level must be >= 0");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: width and height must be >= 0");

	auto maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;

	if (width > maxSize || height > maxSize)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: width or height exceeds maximum texture size");

	if (border != 0)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: border must be 0");

	if (!data)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: data is null");

	if (level == 0)
	{
		if (width % 4)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexImage2D: width must be a multiple of 4.");

		if (height % 4)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexImage2D: height must be a multiple of 4.");
	}
	else // level > 0, because level < 0 is checked upper
	{
		if (width % 4 && width > 2)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexImage2D: width must be 0, 1, 2 or a multiple of 4.");

		if (height % 4 && height > 2)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexImage2D: height must be 0, 1, 2 or a multiple of 4.");
	}

	auto bitsPerBlock = 0;
	switch (internalformat)
	{
		default:
			bitsPerBlock = 0;
			break;
		case GL_COMPRESSED_RGB_S3TC_DXT1_EXT:
		case GL_COMPRESSED_RGBA_S3TC_DXT1_EXT:
			bitsPerBlock = 8;
			break;
		case GL_COMPRESSED_RGBA_S3TC_DXT3_EXT:
		case GL_COMPRESSED_RGBA_S3TC_DXT5_EXT:
			bitsPerBlock = 16;
			break;
	}

	ULONG dataLength = 0;
	BYTE* mem = nullptr;
	V_RET(data->get_byteLength(&dataLength));
	V_RET(data->get_mem(&mem));

	auto requiredLength = (ULONG)(floorf((width + 3) / 4.0f) * floorf((height + 3) / 4.0f) * bitsPerBlock);
	if ( dataLength != requiredLength)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexImage2D: wrong data length");		 


	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexImage2D: no texture is bound to this target");

	V_RET(MakeCurrent());

	texture->Image(target, level, internalformat, GL_UNSIGNED_BYTE, width, height);

	glCompressedTexImage2D(target, level, internalformat, width, height, border, dataLength, mem);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::compressedTexSubImage2D(ULONG target, LONG level,
                                LONG xoffset, LONG yoffset,
                                LONG width, LONG height, ULONG format,
                                IArrayBufferView* data)
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureOpTarget(target, L"compressedTexSubImage2D: target") ||
		!ValidateCompressedTextureFormat(format, L"compressedTexSubImage2D: internalformat"))
		return S_OK;

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: level must be >= 0");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: width and height must be >= 0");
	if (width == 0 || height == 0)
		return S_OK;

	auto maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;

	if (width > maxSize || height > maxSize)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: width or height exceeds maximum texture size");

	if (!data)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: data is null");

	if (xoffset % 4)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: xoffset must be a multiple of 4.");

	if (yoffset % 4)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: yoffset must be a multiple of 4.");

	if (level == 0)
	{
		if (width % 4)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: width must be a multiple of 4.");

		if (height % 4)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: height must be a multiple of 4.");
	}
	else // level > 0, because level < 0 is checked upper
	{
		if (width % 4 && width > 2)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: width must be 0, 1, 2 or a multiple of 4.");

		if (height % 4 && height > 2)
			return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: height must be 0, 1, 2 or a multiple of 4.");
	}

	
	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: no texture is bound to this target");

	if ((LONG)texture->GetMipLevelCount() <= level)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: texture image level has not been defined by compressedTexImage()");

	const CWebGLTexture::MipLevelDesc& levelDesc = texture->GetMipLevelDesc(level, GetCubeMapFace(target));
	if (!levelDesc.isDefined)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: texture image level has not been defined by compressedTexImage()");

	if (levelDesc.internalFormat != format)
		return GenerateError(GL_INVALID_OPERATION, L"compressedTexSubImage2D: format isn't equal to initial internalformat");

	if (xoffset < 0 || xoffset + width > (LONG)levelDesc.width || yoffset < 0 || yoffset + height > (LONG)levelDesc.height)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: invalid x-offset or y-offset");


	auto bitsPerBlock = 0;
	switch (format)
	{
		default:
			bitsPerBlock = 0;
			break;
		case GL_COMPRESSED_RGB_S3TC_DXT1_EXT:
		case GL_COMPRESSED_RGBA_S3TC_DXT1_EXT:
			bitsPerBlock = 8;
			break;
		case GL_COMPRESSED_RGBA_S3TC_DXT3_EXT:
		case GL_COMPRESSED_RGBA_S3TC_DXT5_EXT:
			bitsPerBlock = 16;
			break;
	}

	ULONG dataLength = 0;
	BYTE* mem = nullptr;
	V_RET(data->get_byteLength(&dataLength));
	V_RET(data->get_mem(&mem));

	auto requiredLength = (ULONG)(floorf((width + 3) / 4.0f) * floorf((height + 3) / 4.0f) * bitsPerBlock);
	if ( dataLength != requiredLength)
		return GenerateError(GL_INVALID_VALUE, L"compressedTexSubImage2D: wrong data length");	


	V_RET(MakeCurrent());

	glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, dataLength, mem);
	return S_OK;
}


STDMETHODIMP CWebGLRenderingContext::copyTexImage2D( ULONG target, LONG level, ULONG internalformat,
	LONG x, LONG y, LONG width, LONG height, LONG border )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureOpTarget(target, L"copyTexImage2D: target") ||
		!ValidateTextureFormat(internalformat, L"copyTexImage2D: internalformat"))
		return S_OK;

	if (target != GL_TEXTURE_2D && width != height)
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: width and height must be equal for cube map");

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: level must be >= 0");

	LONG maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;
	if (!(maxSize >> level))
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: 2^level exceeds maximum texture size");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: width and height must be >= 0");

	if (width > maxSize || height > maxSize)
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: width or height exceeds maximum texture size");

	if (border != 0)
		return GenerateError(GL_INVALID_VALUE, L"copyTexImage2D: border must be 0");

	auto attachment = boundFramebuffer_ ? boundFramebuffer_->GetAttachment(GL_COLOR_ATTACHMENT0) : NULL;
	ULONG fboInternalFormat = attachment ? attachment->GetInternalFormat() : primaryFBO_.GetColorFormat();

	if ((internalformat == GL_ALPHA ||
		 internalformat == GL_LUMINANCE_ALPHA ||
		 internalformat == GL_RGBA) &&
		 !HasAlphaChannel(fboInternalFormat))
	{
		return GenerateError(GL_INVALID_OPERATION, L"copyTexImage2D: texture format requires an alpha channel "
			L"but the framebuffer doesn't have one");
	}

	if(!ValidateBoundFramebufferStatus(L"copyTexImage2D"))
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"copyTexImage2D: no texture is bound to this target");

	texture->Image(target, level, internalformat, 0, width, height);

	V_RET(MakeCurrent());

	if (width == 0 && height == 0)
	{
		glTexImage2D(target, level, internalformat, width, height, 0, internalformat, GL_UNSIGNED_BYTE, NULL);
		return S_OK;
	}

	LONG fboWidth = attachment ? attachment->GetWidth() : primaryFBO_.GetWidth();
	LONG fboHeight = attachment ? attachment->GetHeight() : primaryFBO_.GetHeight();

	if (x >= 0 && y >= 0 && x + width <= fboWidth && y + height <= fboHeight)
	{
		glCopyTexImage2D(target, level, internalformat, x, y, width, height, border);
	}
	else
	{
		CAtlArray<BYTE> zeroData;
		zeroData.InsertAt(0, 0, GetAlignedImageByteSize(width, height,
			GetTexelFormat(internalformat, GL_UNSIGNED_BYTE), pixelStoreUnpackAlignment_));
		glTexImage2D(target, level, internalformat, width, height, 0, internalformat, GL_UNSIGNED_BYTE, zeroData.GetData());

		if (x < fboWidth && x + width > 0 && y < fboHeight && y + height > 0)
		{
			LONG fixedXOffset = 0, fixedYOffset = 0;
			LONG fixedX = x, fixedY = y, fixedWidth = width, fixedHeight = height;

			FixCopyRect(fboWidth, fboHeight, fixedXOffset, fixedYOffset, fixedX, fixedY, fixedWidth, fixedHeight);
			glCopyTexSubImage2D(target, level, fixedXOffset, fixedYOffset, fixedX, fixedY, fixedWidth, fixedHeight);
		}
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::copyTexSubImage2D( ULONG target, LONG level, LONG xoffset, LONG yoffset,
	LONG x, LONG y, LONG width, LONG height )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureOpTarget(target, L"copyTexSubImage2D: target"))
		return S_OK;

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"copyTexSubImage2D: level must be >= 0");

	LONG maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;
	if (!(maxSize >> level))
		return GenerateError(GL_INVALID_VALUE, L"copyTexSubImage2D: 2^level exceeds maximum texture size");

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"copyTexSubImage2D: no texture is bound to this target");

	if ((LONG)texture->GetMipLevelCount() <= level)
		return GenerateError(GL_INVALID_OPERATION, L"copyTexSubImage2D: texture image level has not been defined by a previous");
	const CWebGLTexture::MipLevelDesc& levelDesc = texture->GetMipLevelDesc(level, GetCubeMapFace(target));
	if (!levelDesc.isDefined)
		return GenerateError(GL_INVALID_OPERATION, L"copyTexSubImage2D: texture image level has not been defined by a previous");

	if (xoffset < 0 || xoffset + width > (LONG)levelDesc.width || yoffset < 0 || yoffset + height > (LONG)levelDesc.height)
		return GenerateError(GL_INVALID_VALUE, L"copyTexSubImage2D: invalid x-offset or y-offset");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"copyTexSubImage2D: width and height must be >= 0");

	auto attachment = boundFramebuffer_ ? boundFramebuffer_->GetAttachment(GL_COLOR_ATTACHMENT0) : NULL;
	ULONG fboInternalFormat = attachment ? attachment->GetInternalFormat() : primaryFBO_.GetColorFormat();

	if (HasAlphaChannel(levelDesc.internalFormat) && !HasAlphaChannel(fboInternalFormat))
		return GenerateError(GL_INVALID_OPERATION, L"copyTexSubImage2D: texture format requires an alpha channel "
			L"but the framebuffer doesn't have one");

	if(!ValidateBoundFramebufferStatus(L"copyTexSubImage2D"))
		return S_OK;

	V_RET(MakeCurrent());

	if (width == 0 && height == 0)
		return S_OK;

	LONG fboWidth = attachment ? attachment->GetWidth() : primaryFBO_.GetWidth();
	LONG fboHeight = attachment ? attachment->GetHeight() : primaryFBO_.GetHeight();

	if (x >= 0 && y >= 0 && x + width <= fboWidth && y + height <= fboHeight)
	{
		glCopyTexSubImage2D(target, level, xoffset, yoffset, x, y, width, height);
	}
	else
	{
		CAtlArray<BYTE> zeroData;
		zeroData.InsertAt(0, 0, GetAlignedImageByteSize(width, height,
			GetTexelFormat(levelDesc.internalFormat, GL_UNSIGNED_BYTE), pixelStoreUnpackAlignment_));
		glTexSubImage2D(target, level, 0, 0, width, height, levelDesc.internalFormat, GL_UNSIGNED_BYTE, zeroData.GetData());

		if (x < fboWidth && x + width > 0 && y < fboHeight && y + height > 0)
		{
			LONG fixedXOffset = xoffset, fixedYOffset = yoffset;
			LONG fixedX = x, fixedY = y, fixedWidth = width, fixedHeight = height;

			FixCopyRect(fboWidth, fboHeight, fixedXOffset, fixedYOffset, fixedX, fixedY, fixedWidth, fixedHeight);
			glCopyTexSubImage2D(target, level, fixedXOffset, fixedYOffset, fixedX, fixedY, fixedWidth, fixedHeight);
		}
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createBuffer( IWebGLBuffer** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG bufferName = 0;
	glGenBuffers(1, (GLuint*)&bufferName);

	WebGLBufferPtr buffer;
	V_RET(CreateWebGLBuffer(this, bufferName, buffer));

	mapBuffers_.SetAt(bufferName, buffer);
	*retVal = buffer;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createFramebuffer( IWebGLFramebuffer** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG framebufferName = 0;
	glGenFramebuffers(1, (GLuint*)&framebufferName);

	WebGLFramebufferPtr framebuffer;
	V_RET(CreateWebGLFramebuffer(this, framebufferName, framebuffer));

	mapFramebuffers_.SetAt(framebufferName, framebuffer);
	*retVal = framebuffer;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createProgram( IWebGLProgram** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG programName = glCreateProgram();
	WebGLProgramPtr program;
	V_RET(CreateWebGLProgram(this, programName, program));

	mapPrograms_.SetAt(programName, program);
	*retVal = program;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createRenderbuffer( IWebGLRenderbuffer** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG renderbufferName = 0;
	glGenRenderbuffers(1, (GLuint*)&renderbufferName);

	WebGLRenderbufferPtr renderbuffer;
	V_RET(CreateWebGLRenderbuffer(this, renderbufferName, renderbuffer));

	mapRenderbuffers_.SetAt(renderbufferName, renderbuffer);
	*retVal = renderbuffer;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createShader( ULONG type, IWebGLShader** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG shaderName = glCreateShader(type);
	WebGLShaderPtr shader;
	V_RET(CreateWebGLShader(this, type, shaderName, shader));

	mapShaders_.SetAt(shaderName, shader);
	*retVal = shader;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::createTexture( IWebGLTexture** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	ULONG textureName = 0;
	glGenTextures(1, (GLuint*)&textureName);

	WebGLTexturePtr texture;
	V_RET(CreateWebGLTexture(this, textureName, texture));

	mapTextures_.SetAt(textureName, texture);
	*retVal = texture;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::cullFace( ULONG face )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateFaceEnum(face, L"cullFace: face"))
		return S_OK;

	V_RET(MakeCurrent());

	glCullFace(face);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::deleteBuffer( IWebGLBuffer* buffer )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLBufferType* bufferImpl = nullptr;
	WEBGL_RET(GetConcrete(buffer, bufferImpl, L"deleteBuffer: buffer", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	ULONG glName = bufferImpl->GetGLName();
	glDeleteBuffers(1, (GLuint*)&glName);
	bufferImpl->Delete();
	mapBuffers_.RemoveKey(glName);

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::deleteFramebuffer( IWebGLFramebuffer* framebuffer )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLFramebufferType* framebufferImpl = nullptr;
	WEBGL_RET(GetConcrete(framebuffer, framebufferImpl, L"deleteFramebuffer: framebuffer", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	if(boundFramebuffer_.get() == framebufferImpl)
		bindFramebuffer(GL_FRAMEBUFFER, 0);

	ULONG glName = framebufferImpl->GetGLName();
	glDeleteFramebuffers(1, (GLuint*)&glName);
	framebufferImpl->Delete();
	mapFramebuffers_.RemoveKey(glName);

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::deleteProgram( IWebGLProgram* program )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLProgramType* programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"deleteProgram: program", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	glDeleteProgram(programImpl->GetGLName());

	if (programImpl == currentProgram_)
	{
		programImpl->SetDeletePending();
	}
	else
	{
		programImpl->DetachShaders();
	}

	programImpl->Delete();
	mapPrograms_.RemoveKey(programImpl->GetGLName());

	return S_OK;
}

inline BOOL IsConsistRenderbuffer( WebGLFramebufferPtr framebuffer,
	WebGLRenderbufferType* renderbuffer, ULONG& attachment )
{
	if(!renderbuffer)
		return FALSE;

	ULONG attachments[] = {
		GL_COLOR_ATTACHMENT0, GL_DEPTH_ATTACHMENT, GL_STENCIL_ATTACHMENT, GL_DEPTH_STENCIL_ATTACHMENT };

	for(ULONG i = 0; i < sizeof(attachments) / sizeof(attachments[0]); ++i)
	{
		CComVariant attached;
		WebGLFramebufferAttachmentPtr attachmentPtr = framebuffer->GetAttachment(attachments[i]);
		if(attachmentPtr && attachmentPtr->GetParameter(GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME, attached) && attached.pdispVal)
		{
			if(VariantToConcrete<CWebGLRenderbuffer::MainInterface, CWebGLRenderbuffer>(attached) == renderbuffer)
			{
				attachment = attachments[i];
				return TRUE;
			}
		}
	}

	return FALSE;
}

STDMETHODIMP CWebGLRenderingContext::deleteRenderbuffer( IWebGLRenderbuffer* renderbuffer )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLRenderbufferType* renderbufferImpl = nullptr;
	WEBGL_RET(GetConcrete(renderbuffer, renderbufferImpl, L"deleteRenderbuffer: renderbuffer", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	if(boundRenderbuffer_ && boundRenderbuffer_.get() == renderbufferImpl)
		bindRenderbuffer(GL_RENDERBUFFER, 0);

	ULONG attachment = 0;
	if(boundFramebuffer_ && IsConsistRenderbuffer(boundFramebuffer_, renderbufferImpl, attachment))
		boundFramebuffer_->AttachRenderbuffer(attachment, 0);

	ULONG glName = renderbufferImpl->GetGLName();
	glDeleteRenderbuffers(1, (GLuint*)&glName);

	/*NEED SPECIAL DELETING LOGIC*/
	/*
        If a renderbuffer object that is currently bound is deleted, the binding reverts
        to 0 (the absence of any renderbuffer object). Additionally, special care
        must be taken when deleting a renderbuffer object if the image of the renderbuffer
        is attached to a framebuffer object. In this case, if the deleted renderbuffer object is
        attached to the currently bound framebuffer object, it is 
        automatically detached.  However, attachments to any other framebuffer objects are the
        responsibility of the application.
    */

	renderbufferImpl->Delete();
	mapRenderbuffers_.RemoveKey(glName);

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::deleteShader( IWebGLShader* shader )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"deleteShader: shader", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	glDeleteShader(shaderImpl->GetGLName());
	mapShaders_.RemoveKey(shaderImpl->GetGLName());
	shaderImpl->Delete();

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::deleteTexture( IWebGLTexture* texture )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLTextureType* textureImpl = nullptr;
	WEBGL_RET(GetConcrete(texture, textureImpl, L"deleteTexture: texture", *this, &isNull, &isDeleted));

	if (isNull || isDeleted)
		return S_OK;

	V_RET(MakeCurrent());

	ULONG glName = textureImpl->GetGLName();
	glDeleteTextures(1, (GLuint*)&glName);
	textureImpl->Delete();
	mapTextures_.RemoveKey(glName);

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::depthFunc( ULONG func )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateComparisonEnum(func, L"depthFunc: func"))
		return S_OK;

	V_RET(MakeCurrent());

	glDepthFunc(func);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::depthMask( BOOL flag )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glDepthMask(flag);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::depthRange( FLOAT zNear, FLOAT zFar )
{
	if (IsContextLost())
		return S_OK;

	if (zNear > zFar)
		return GenerateError(GL_INVALID_OPERATION, L"depthRange: the near value is greater than the far value");

	V_RET(MakeCurrent());

	glDepthRangef(Clamp<FLOAT>(zNear, 0, 1), Clamp<FLOAT>(zFar, 0, 1));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::detachShader( IWebGLProgram* program, IWebGLShader* shader )
{
	if (IsContextLost())
		return S_OK;

	WebGLProgramType *programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"detachShader: program", *this));

	BOOL isShaderDeleted = FALSE;
	WebGLShaderType *shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"detachShader: shader", *this, NULL, &isShaderDeleted));

	V_RET(MakeCurrent());

	// shaderDeleted is ignored -- it's valid to attempt to detach a
	// deleted shader, since it's still a shader
	if (!programImpl->DetachShader(shaderImpl))
		return GenerateError(GL_INVALID_OPERATION, L"DetachShader: shader is not attached");

	glDetachShader(programImpl->GetGLName(), shaderImpl->GetGLName());

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::disable( ULONG cap )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateCapabilityEnum(cap, L"disable : cap"))
		return S_OK;

	V_RET(MakeCurrent());

	glDisable(cap);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::disableVertexAttribArray( ULONG index )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateAttribIndex(index, L"disableVertexAttribArray"))
		return S_OK;

	V_RET(MakeCurrent());

	if (index)
		glDisableVertexAttribArray(index);

	attribBuffers_[index].enabled = FALSE;
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::drawArrays( ULONG mode, LONG first, LONG count )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateDrawModeEnum(mode, L"drawArrays: mode"))
		return S_OK;

	if (first < 0)
		return GenerateError(GL_INVALID_VALUE, L"drawArrays: negative first");
	if (count < 0)
		return GenerateError(GL_INVALID_VALUE, L"drawArrays: negative count");

	if (count == 0 || !currentProgram_)
		return S_OK;

	ULONG maxElementCount = 0;
	if (!ValidateBuffers(L"drawArrays", maxElementCount))
		return S_OK;

	const ULONG totalElementCount = first + count;
	if (totalElementCount > maxElementCount)
		return GenerateError(GL_INVALID_OPERATION,
			L"drawArrays: bound vertex attribute buffers do not have sufficient size for given first and count");

	if (!ValidateBoundFramebufferStatus(L"drawArrays"))
		return S_OK;

	V_RET(MakeCurrent());

	BindProxyTextures();
	DoFakeVertexAttrib0(totalElementCount);

	glDrawArrays(mode, first, count);

	UndoFakeVertexAttrib0();
	UnbindProxyTextures();

	Invalidate();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::drawElements( ULONG mode, LONG count, ULONG type, LONG offset )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateDrawModeEnum(mode, L"drawElements: mode"))
		return S_OK;

	if (offset < 0)
		return GenerateError(GL_INVALID_VALUE, L"drawElements: negative offset");
	if (count < 0)
		return GenerateError(GL_INVALID_VALUE, L"drawElements: negative count");

	if (count == 0 || !currentProgram_)
		return S_OK;

	if (type != GL_UNSIGNED_BYTE && type != GL_UNSIGNED_SHORT)
		return GenerateError(GL_INVALID_ENUM, L"drawElements: type must be UNSIGNED_SHORT or UNSIGNED_BYTE");

	if (offset % GetComponentSize(type) != 0)
		return GenerateError(GL_INVALID_OPERATION, L"drawElements: byteOffset must be a multiple of type");

	if (!boundElementArrayBuffer_)
		return GenerateError(GL_INVALID_OPERATION, L"drawElements: must have element array buffer binding");
	if (!boundElementArrayBuffer_->HasData())
		return GenerateError(GL_INVALID_OPERATION, L"drawElements: bound element array buffer doesn't have any data");

	const ULONG totalByteCount = GetComponentSize(type) * count + offset;
	if (totalByteCount > boundElementArrayBuffer_->GetByteSize())
		return GenerateError(GL_INVALID_OPERATION, L"drawElements: given count and offset is out of buffer's range");

	ULONG maxElementCount = 0;
	if (!ValidateBuffers(L"drawElements", maxElementCount))
		return S_OK;

	const ULONG maxIndex = boundElementArrayBuffer_->GetMaxDataElement(type);

	if(!ValidateBoundFramebufferStatus(L"drawElements"))
		return S_OK;

	V_RET(MakeCurrent());

	BindProxyTextures();
	DoFakeVertexAttrib0(maxIndex + 1);
	
	glDrawElements(mode, count, type, (void*)offset);
	
	UndoFakeVertexAttrib0();
	UnbindProxyTextures();

	Invalidate();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::enable( ULONG cap )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateCapabilityEnum(cap, L"enable : cap"))
		return S_OK;

	V_RET(MakeCurrent());

	glEnable(cap);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::enableVertexAttribArray( ULONG index )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateAttribIndex(index, L"enableVertexAttribArray"))
		return S_OK;

	V_RET(MakeCurrent());

	glEnableVertexAttribArray(index);
	attribBuffers_[index].enabled = TRUE;
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::finish()
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glFinish();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::flush()
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glFlush();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::framebufferRenderbuffer( ULONG target, ULONG attachment,
	ULONG renderbufferTarget, IWebGLRenderbuffer* renderbuffer )
{
	if (IsContextLost())
		return S_OK;

	if (target != GL_FRAMEBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"framebufferRenderbuffer: target");

	BOOL isNull = FALSE;
	WebGLRenderbufferType* renderbufferImpl = nullptr;
	WEBGL_RET(GetConcrete(renderbuffer, renderbufferImpl, L"framebufferRenderbuffer: renderbuffer", *this, &isNull));

	if (renderbufferTarget != GL_RENDERBUFFER && !isNull)
		return GenerateError(GL_INVALID_ENUM, L"framebufferRenderbuffer: renderbuffer target:");

	if(!ValidateAttachmentEnum(attachment, L"framebufferRenderbuffer: attachment"))
		return S_OK;

	if (!boundFramebuffer_)
		return GenerateError(GL_INVALID_OPERATION, L"framebufferRenderbuffer: cannot modify framebuffer 0");

	V_RET(MakeCurrent());

	boundFramebuffer_->AttachRenderbuffer(attachment, renderbufferImpl);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::framebufferTexture2D( ULONG target, ULONG attachment,
	ULONG textarget, IWebGLTexture* texture, LONG level )
{
	if (IsContextLost())
		return S_OK;

	if (target != GL_FRAMEBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"framebufferTexture2D: target");

	BOOL isNull = FALSE;
	WebGLTextureType* textureImpl = nullptr;
	WEBGL_RET(GetConcrete(texture, textureImpl, L"framebufferTexture2D: texture", *this, &isNull));

	if (!isNull && textarget != GL_TEXTURE_2D &&
		(textarget < GL_TEXTURE_CUBE_MAP_POSITIVE_X || textarget > GL_TEXTURE_CUBE_MAP_NEGATIVE_Z))
		return GenerateError(GL_INVALID_ENUM, L"framebufferTexture2D: texture target");

	if(!ValidateAttachmentEnum(attachment, L"framebufferTexture2D: attachment"))
		return S_OK;

	if (!isNull && level != 0)
		return GenerateError(GL_INVALID_VALUE, L"framebufferTexture2D: level must be 0");

	if (!boundFramebuffer_)
		return GenerateError(GL_INVALID_OPERATION, L"framebufferTexture2D: cannot modify framebuffer 0");

	V_RET(MakeCurrent());

	boundFramebuffer_->AttachTexture(attachment, textureImpl, textarget, level);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::frontFace( ULONG mode )
{
	if (IsContextLost())
		return S_OK;

	if(!ValidateCullMode(mode, L"frontFace : mode"))
		return S_OK;

	V_RET(MakeCurrent());

	glFrontFace(mode);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::generateMipmap( ULONG target )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureTarget(target, L"generateMipmap: target"))
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"generateMipmap: no texture is bound to this target");

	if (target == GL_TEXTURE_CUBE_MAP && !texture->IsCubeFacesCompatible())
		return GenerateError(GL_INVALID_OPERATION, L"generateMipmap: six faces have different dimensions, format or type");

	if (!texture->GenerateMipMaps())
		return S_OK;

	V_RET(MakeCurrent());

	glGenerateMipmap(target);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getActiveAttrib( IWebGLProgram* program, ULONG index, IWebGLActiveInfo** retVal )
{
	if (!retVal)
		return E_INVALIDARG;
	
	*retVal = nullptr;

	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getActiveAttrib: program", *this));

	V_RET(MakeCurrent());

	GLint len = 0;
	glGetProgramiv(progImpl->GetGLName(), GL_ACTIVE_ATTRIBUTE_MAX_LENGTH, &len);
	if (len == 0)
		return S_OK;

	CAtlStringA name;
	name.Preallocate(len);
	LONG attrsize = 0;
	ULONG attrtype = 0;

	glGetActiveAttrib(progImpl->GetGLName(), index, len, &len, (GLint*) &attrsize, (GLuint*) &attrtype, name.GetBuffer());
	if (attrsize == 0 || attrtype == 0)
	{
		*retVal = nullptr;
		return S_OK;
	}

	WebGLActiveInfoPtr retActiveInfo;
	V_RET(CreateWebGLActiveInfo(this, attrsize, attrtype, name.GetBuffer(), len, retActiveInfo));
	*retVal = retActiveInfo;
	(*retVal)->AddRef();

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getActiveUniform( IWebGLProgram* program, ULONG index, IWebGLActiveInfo** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getActiveUniform: program", *this));

	V_RET(MakeCurrent());

	GLint len = 0;
	glGetProgramiv(progImpl->GetGLName(), GL_ACTIVE_UNIFORM_MAX_LENGTH, &len);
	if (len == 0)
	{
		*retVal = nullptr;
	}

	CAtlStringA name; 
	name.Preallocate(len + 3); // +3 because we might have to append "[0]", see below


	LONG attrsize = 0;
	ULONG attrtype = 0;

	glGetActiveUniform(progImpl->GetGLName(), index, len, &len, (GLint*) &attrsize, (GLenum*) &attrtype, name.GetBuffer());
	if (len == 0 || attrsize == 0 || attrtype == 0)
	{
		*retVal = nullptr;
		return S_OK;
	}

	// OpenGL ES 2.0 specifies that if foo is a uniform array, GetActiveUniform returns its name as "foo[0]".
	// See section 2.10 page 35 in the OpenGL ES 2.0.24 specification:
	//
	// > If the active uniform is an array, the uniform name returned in name will always
	// > be the name of the uniform array appended with "[0]".
	//
	// There is no such requirement in the OpenGL (non-ES) spec and indeed we have OpenGL implementations returning
	// "foo" instead of "foo[0]". So, when implementing WebGL on top of desktop OpenGL, we must check if the
	// returned name ends in [0], and if it doesn't, append that.
	//
	// In principle we don't need to do that on OpenGL ES, but this is such a tricky difference between the ES and non-ES
	// specs that it seems probable that some ES implementers will overlook it. Since the work-around is quite cheap,
	// we do it unconditionally.

	if ( name.GetBuffer()[len-1] != ']' && progImpl->IsArrayName(name.GetString()) )
	{
		name.GetBuffer()[len++] = '[';
		name.GetBuffer()[len++] = '0';
		name.GetBuffer()[len++] = ']';
	}

	WebGLActiveInfoPtr activeInfo;
	V_RET( CreateWebGLActiveInfo(this, attrsize, attrtype, name.GetBuffer(), len, activeInfo) );

	*retVal = activeInfo;
	(*retVal)->AddRef();

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getAttachedShaders( IWebGLProgram* program, IDispatch** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (!pluginObj_)
		return E_FAIL;

	BOOL isNull = FALSE;
	WebGLProgramType *progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getAttachedShaders: program", *this, &isNull));

	V_RET(MakeCurrent());

	if (isNull)
		return GenerateError(GL_INVALID_VALUE, L"getAttachedShaders: invalid program");

	ScriptArray<CComPtr<IDispatch>> scriptArr;
	CComPtr<IDispatchEx> ctx;
	V_RET(pluginObj_->GetScriptContext(ctx));
	V_RET(scriptArr.Init(ctx));

	auto shaders = progImpl->AttachedShaders();
	for (ULONG i = 0; i < WebGLProgramType::MaxShaderCount; ++i)
	{
		if ( shaders[i] )
			scriptArr.Append((CComPtr<IDispatch>)shaders[i]);
	}
	CComPtr<IDispatch> arr;
	V_RET(scriptArr.GetScriptArray(arr));
	*retVal = arr.Detach();

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getAttribLocation( IWebGLProgram* program, BSTR name, LONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (IsContextLost())
	{
		*retVal = -1;
		return S_OK;
	}

	*retVal = 0;

	BOOL isNull = FALSE;
	WebGLProgramType *progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getAttribLocation: program", *this, &isNull));
	if (isNull)
		return GenerateError(GL_INVALID_OPERATION, L"getAttribLocation: program is null or undefined");

	V_RET(MakeCurrent());

	_bstr_t str(name);
	const char* cStr = (const char *)str;
	if (!IsASCIIString(cStr, str.length()))
		return GenerateError(GL_INVALID_VALUE, L"getAttribLocation: name containing national symbols");

	*retVal = glGetAttribLocation(progImpl->GetGLName(), cStr);
	return S_OK; 
}

static bool GetBoolParameter( ULONG pname )
{
	GLboolean value = 0;
	glGetBooleanv(pname, &value);
	return value ? true : false;
}

static int GetIntParameter( ULONG pname )
{
	GLint value = 0;
	glGetIntegerv(pname, &value);
	return value;
}

static float GetFloatParameter( ULONG pname )
{
	GLfloat value = 0.0f;
	glGetFloatv(pname, &value);
	return value;
}

static CComPtr<IDispatch> GetBoolArrayParameter( ULONG pname, ULONG count, IPluginObject* plugin )
{
	CAtlArray<GLboolean> value;
	if (!value.SetCount(count))
		return CComPtr<IDispatch>();
	glGetBooleanv(pname, value.GetData());

	CAtlArray<bool> boolValue;
	if (!boolValue.SetCount(count))
		return CComPtr<IDispatch>();

	for(ULONG i = 0; i < count; ++i) {
		boolValue[i] = value[i] ? true : false;
	}

	return BuildScriptArray<bool>(plugin, count, boolValue.GetData());
}

static CComPtr<IDispatch> GetInt32ArrayParameter( ULONG pname, ULONG count)
{
	IArrayBufferViewPtr arr;
	if ( FAILED(CreateTypedArrayView<Int32ArrayType>(CComVariant(count), CComVariant(), CComVariant(), arr)) )
		return CComPtr<IDispatch>();
	
	BYTE * mem = nullptr;
	if (FAILED(arr->get_mem(&mem)) )
		return CComPtr<IDispatch>();

	glGetIntegerv(pname, (GLint*)mem);
	return CComPtr<IDispatch>(arr);
}

static CComPtr<IDispatch> GetFloat32ArrayParameter( ULONG pname, ULONG count )
{
	IArrayBufferViewPtr arr;
	if ( FAILED(CreateTypedArrayView<Float32ArrayType>(CComVariant(count), CComVariant(), CComVariant(), arr)) )
		return CComPtr<IDispatch>();

	BYTE * mem = nullptr;
	if ( FAILED(arr->get_mem(&mem)) )
		return CComPtr<IDispatch>();

	glGetFloatv(pname, (GLfloat*)mem);
	return CComPtr<IDispatch>(arr);
}

STDMETHODIMP CWebGLRenderingContext::getParameter( ULONG pname, VARIANT* retVal )
{
	if(!retVal)
		return E_INVALIDARG;

	if (!pluginObj_)
		return E_FAIL;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	switch(pname)
	{
	case GL_VENDOR:
		V_RET(CComVariant(L"IEWebGL").Detach(retVal)); break;
	case GL_RENDERER:
		V_RET(CComVariant(L"IEWebGL").Detach(retVal)); break;
	case GL_VERSION:
		V_RET(CComVariant(L"WebGL 1.0").Detach(retVal)); break;
	case GL_SHADING_LANGUAGE_VERSION:
		V_RET(CComVariant(L"WebGL GLSL ES 1.0").Detach(retVal)); break;

	case GL_COMPRESSED_TEXTURE_FORMATS:
		{
			IArrayBufferViewPtr arr;
			V_RET(CreateTypedArrayView<Uint32ArrayType>(CComVariant(compressedTexFormats_.GetCount()), CComVariant(), CComVariant(), arr));
	
			BYTE * mem = nullptr;
			V_RET(arr->get_mem(&mem));

			static_assert(sizeof(compressedTexFormats_[0]) == 4, "element size should be 4");
			memcpy(mem, compressedTexFormats_.GetData(), compressedTexFormats_.GetCount() * sizeof(compressedTexFormats_[0]));

			V_RET(CComVariant(arr).Detach(retVal));
		}
		break;

	case GL_UNPACK_FLIP_Y_WEBGL:
		V_RET(CComVariant(pixelStoreFlipY_ == 0 ? false : true).Detach(retVal)); break;
	case GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL:
		V_RET(CComVariant(pixelStorePremultiplyAlpha_ == 0 ? false : true).Detach(retVal)); break;
	case GL_UNPACK_COLORSPACE_CONVERSION_WEBGL:
		V_RET(CComVariant(pixelStoreColorspaceConversion_).Detach(retVal)); break;

	case GL_MAX_VERTEX_UNIFORM_VECTORS:
		V_RET(CComVariant(maxVertexUniformVectors_).Detach(retVal)); break;
	case GL_MAX_VARYING_VECTORS:
		V_RET(CComVariant(maxVaryingVectors_).Detach(retVal)); break;
	case GL_MAX_FRAGMENT_UNIFORM_VECTORS:
		V_RET(CComVariant(maxFragmentUniformVectors_).Detach(retVal)); break;

	case GL_CURRENT_PROGRAM:
		V_RET(CComVariant(currentProgram_).Detach(retVal)); break;
	case GL_ARRAY_BUFFER_BINDING:
		V_RET(CComVariant(boundArrayBuffer_).Detach(retVal)); break;
	case GL_ELEMENT_ARRAY_BUFFER_BINDING:
		V_RET(CComVariant(boundElementArrayBuffer_).Detach(retVal)); break;
	case GL_TEXTURE_BINDING_2D:
		V_RET(CComVariant(bound2DTextures_[activeTexture_]).Detach(retVal)); break;
	case GL_TEXTURE_BINDING_CUBE_MAP:
		V_RET(CComVariant(boundCubeMapTextures_[activeTexture_]).Detach(retVal)); break;
	case GL_RENDERBUFFER_BINDING :
		V_RET(CComVariant(boundRenderbuffer_).Detach(retVal)); break;
	case GL_FRAMEBUFFER_BINDING :
		V_RET(CComVariant(boundFramebuffer_).Detach(retVal)); break;

	case GL_BLEND:
	case GL_CULL_FACE:
	case GL_DEPTH_TEST:
	case GL_DEPTH_WRITEMASK:
	case GL_DITHER:
	case GL_POLYGON_OFFSET_FILL:
	case GL_SAMPLE_COVERAGE_INVERT:
	case GL_SCISSOR_TEST:
	case GL_STENCIL_TEST:
		V_RET(CComVariant(GetBoolParameter(pname)).Detach(retVal)); break;

	case GL_FRAGMENT_SHADER_DERIVATIVE_HINT_OES:
		{
			if (!IsExtensionEnabled(L"OES_standard_derivatives"))
				return GenerateError(GL_INVALID_ENUM, L"getParameter: pname");

			V_RET(CComVariant((ULONG)GetIntParameter(pname)).Detach(retVal)); break;
		}

	case GL_ACTIVE_TEXTURE:
	case GL_BLEND_DST_ALPHA:
	case GL_BLEND_DST_RGB:
	case GL_BLEND_EQUATION_ALPHA:
	case GL_BLEND_EQUATION_RGB:
	case GL_BLEND_SRC_ALPHA:
	case GL_BLEND_SRC_RGB:
	case GL_CULL_FACE_MODE:
	case GL_DEPTH_FUNC:
	case GL_FRONT_FACE:
	case GL_GENERATE_MIPMAP_HINT:
	case GL_STENCIL_BACK_FAIL:
	case GL_STENCIL_BACK_FUNC:
	case GL_STENCIL_BACK_PASS_DEPTH_FAIL:
	case GL_STENCIL_BACK_PASS_DEPTH_PASS:
	case GL_STENCIL_BACK_WRITEMASK:
	case GL_STENCIL_BACK_VALUE_MASK:
	case GL_STENCIL_FAIL:
	case GL_STENCIL_FUNC:
	case GL_STENCIL_PASS_DEPTH_FAIL:
	case GL_STENCIL_PASS_DEPTH_PASS:
	case GL_STENCIL_VALUE_MASK:
	case GL_STENCIL_WRITEMASK:
		V_RET(CComVariant((ULONG)GetIntParameter(pname)).Detach(retVal)); break;

	case GL_UNPACK_ALIGNMENT:
	case GL_PACK_ALIGNMENT:
	case GL_SAMPLES:
	case GL_SAMPLE_BUFFERS:		
	case GL_STENCIL_CLEAR_VALUE:
	case GL_STENCIL_REF:
	case GL_STENCIL_BACK_REF:
	case GL_RED_BITS:
	case GL_GREEN_BITS:
	case GL_BLUE_BITS:
	case GL_ALPHA_BITS:
	case GL_DEPTH_BITS:
	case GL_STENCIL_BITS:
	case GL_SUBPIXEL_BITS:
	case GL_MAX_TEXTURE_IMAGE_UNITS:
	case GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS:
	case GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS:
	case GL_MAX_TEXTURE_SIZE:
	case GL_MAX_CUBE_MAP_TEXTURE_SIZE:
	case GL_MAX_RENDERBUFFER_SIZE:
	case GL_MAX_VERTEX_ATTRIBS:
		V_RET(CComVariant(GetIntParameter(pname)).Detach(retVal)); break;
	case GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT:
		if (IsExtensionEnabled(L"ext_texture_filter_anisotropic"))
		{
			V_RET(CComVariant(GetFloatParameter(pname)).Detach(retVal));
		}
		else
		{
			retVal->vt = VT_R8;
			retVal->dblVal = 1.0;
		}
		break;

	case GL_DEPTH_CLEAR_VALUE:
	case GL_LINE_WIDTH:
	case GL_POLYGON_OFFSET_FACTOR:
	case GL_POLYGON_OFFSET_UNITS:
	case GL_SAMPLE_COVERAGE_VALUE:
		V_RET(CComVariant(GetFloatParameter(pname)).Detach(retVal)); break;

	case GL_COLOR_WRITEMASK:
		V_RET(CComVariant(GetBoolArrayParameter(pname, 4, pluginObj_)).Detach(retVal)); break;

	case GL_MAX_VIEWPORT_DIMS:
		V_RET(CComVariant(GetInt32ArrayParameter(pname, 2)).Detach(retVal)); break;

	case GL_SCISSOR_BOX:
	case GL_VIEWPORT:
		V_RET(CComVariant(GetInt32ArrayParameter(pname, 4)).Detach(retVal)); break;

	case GL_ALIASED_LINE_WIDTH_RANGE:
	case GL_ALIASED_POINT_SIZE_RANGE:
	case GL_DEPTH_RANGE:
		V_RET(CComVariant(GetFloat32ArrayParameter(pname, 2)).Detach(retVal)); break;

	case GL_BLEND_COLOR:
	case GL_COLOR_CLEAR_VALUE:
		V_RET(CComVariant(GetFloat32ArrayParameter(pname, 4)).Detach(retVal)); break;

	default:
		return GenerateError(GL_INVALID_ENUM, L"getParameter: pname");
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getBufferParameter( ULONG target, ULONG pname, VARIANT* retVal )
{
	if(!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (target != GL_ARRAY_BUFFER && target != GL_ELEMENT_ARRAY_BUFFER)
		return GenerateError(GL_INVALID_ENUM, L"getBufferParameter: target");

	if (pname != GL_BUFFER_SIZE && pname != GL_BUFFER_USAGE)
		return GenerateError(GL_INVALID_ENUM, L"getBufferParameter: pname");

	WebGLBufferPtr buffer = GetBoundBuffer(target);
	if (!buffer)
		return GenerateError(GL_INVALID_OPERATION, L"getBufferParameter: no buffer is bound");

	V_RET(CComVariant(buffer->GetParameter(pname)).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getError( ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (IsContextLost())
	{
		*retVal = GL_CONTEXT_LOST_WEBGL;
		return S_OK;
	}

	if (!syntheticErrors_.IsEmpty())
	{
		*retVal = syntheticErrors_[0];
		syntheticErrors_.RemoveAt(0);
	}
	else
	{
		V_RET(MakeCurrent());
		*retVal = glGetError();
	}

	return S_OK;
}

inline HRESULT GetNullFramebufferAttachmentParameter( CWebGLRenderingContext& ctxt, ULONG pname, VARIANT* retVal )
{
	switch(pname)
	{
	case GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
		CComVariant(GL_NONE).Detach(retVal); break;
	default:
		return ctxt.GenerateError(GL_INVALID_ENUM, L"getFramebufferAttachmentParameter: pname");
	}
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getFramebufferAttachmentParameter( ULONG target, ULONG attachment, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (target != GL_FRAMEBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"getFramebufferAttachmentParameter: target");

	if(!ValidateAttachmentEnum(attachment, L"getFramebufferAttachmentParameter: attachment"))
		return S_OK;

	if (!boundFramebuffer_)
		return GenerateError(GL_INVALID_OPERATION , L"getFramebufferAttachmentParameter: cannot query framebuffer 0");

	V_RET(MakeCurrent());

	auto attachmentPtr = boundFramebuffer_->GetAttachment(attachment);
	if(!attachmentPtr)
		return GetNullFramebufferAttachmentParameter(*this, pname, retVal);

	CComVariant pvalue;
	if(!attachmentPtr->GetParameter(pname, pvalue))
		return GenerateError(GL_INVALID_ENUM, L"getFramebufferAttachmentParameter: pname");

	pvalue.Detach(retVal);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getProgramParameter( IWebGLProgram* program, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isDeleted = FALSE;
	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getProgramParameter: program", *this, NULL, &isDeleted));

	V_RET(MakeCurrent());

	switch (pname)
	{
	case GL_ATTACHED_SHADERS:
	case GL_ACTIVE_UNIFORMS:
	case GL_ACTIVE_ATTRIBUTES:
		{
			GLint i = 0;
			glGetProgramiv(progImpl->GetGLName(), pname, &i);
			CComVariant v(i);
			V_RET(v.Detach(retVal));
		}
		break;
	case GL_DELETE_STATUS:
	case GL_LINK_STATUS:
	case GL_VALIDATE_STATUS:
		{
			GLint i = 0;
			glGetProgramiv(progImpl->GetGLName(), pname, &i);
			CComVariant v(i != 0);
			V_RET(v.Detach(retVal));
		}
		break;

	default:
		return GenerateError(GL_INVALID_ENUM, L"getProgramParameter: parameter");
	}

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::getProgramInfoLog( IWebGLProgram* program, BSTR* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = nullptr;

	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getProgramInfoLog: program", *this));

	V_RET(MakeCurrent());

	LONG length = -1;
	glGetProgramiv(progImpl->GetGLName(), GL_INFO_LOG_LENGTH, (GLint*)&length);
	if (length == -1)
		return E_FAIL;

	if (length > 0)
	{
		CAtlStringA log;
		log.Preallocate(length);

		glGetProgramInfoLog(progImpl->GetGLName(), length, (GLint*)&length, (char*) log.GetBuffer());

		_bstr_t str(log);
		*retVal = str.Detach();
	}

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::getRenderbufferParameter( ULONG target, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (target != GL_RENDERBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"getRenderbufferParameter: target");

	if (!boundRenderbuffer_ || !boundRenderbuffer_->GetGLName())
		return GenerateError(GL_INVALID_OPERATION, L"renderbufferStorage called on renderbuffer 0");

	V_RET(MakeCurrent());

	switch (pname)
	{
	case GL_RENDERBUFFER_WIDTH:
		V_RET(CComVariant(boundRenderbuffer_->GetWidth()).Detach(retVal)); break;
	case GL_RENDERBUFFER_HEIGHT:
		V_RET(CComVariant(boundRenderbuffer_->GetHeight()).Detach(retVal)); break;
	case GL_RENDERBUFFER_RED_SIZE:
		V_RET(CComVariant(GetRedChannelBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_GREEN_SIZE:
		V_RET(CComVariant(GetGreenChannelBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_BLUE_SIZE:
		V_RET(CComVariant(GetBlueChannelBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_ALPHA_SIZE:
		V_RET(CComVariant(GetAlphaChannelBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_DEPTH_SIZE:
		V_RET(CComVariant(GetDepthBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_STENCIL_SIZE:
		V_RET(CComVariant(GetStencilBits(GetTexelFormat(boundRenderbuffer_->GetInternalFormat()))).Detach(retVal)); break;
	case GL_RENDERBUFFER_INTERNAL_FORMAT:
		V_RET(CComVariant(boundRenderbuffer_->GetInternalFormat()).Detach(retVal)); break;
	default:
		return GenerateError(GL_INVALID_ENUM, L"getRenderbufferParameter: pname");
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getShaderParameter( IWebGLShader* shader, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"getShaderParameter: shader", *this));

	V_RET(MakeCurrent());

	GLint pvalue = 0;
	switch (pname)
	{
	case GL_SHADER_TYPE:
	case GL_DELETE_STATUS:
		{
			glGetShaderiv(shaderImpl->GetGLName(), pname, &pvalue);
			V_RET(CComVariant(pvalue).Detach(retVal));
		} break;
	case GL_COMPILE_STATUS:
		{
			glGetShaderiv(shaderImpl->GetGLName(), pname, &pvalue);
			V_RET(CComVariant(pvalue ? true : false).Detach(retVal));
		} break;
	default:
		return GenerateError(GL_INVALID_ENUM, L"getShaderParameter: pname"); break;
	}

	return S_OK;  
}

STDMETHODIMP CWebGLRenderingContext::getShaderPrecisionFormat(ULONG shaderType, ULONG precisionType, IWebGLShaderPrecisionFormat** retVal)
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(MakeCurrent());

	GLint range[2] = {0};
	GLint precision = 0;
	glGetShaderPrecisionFormat(shaderType, precisionType, range, &precision);

	WebGLShaderPrecisionFormatPtr format;
	V_RET(CreateWebGLShaderPrecisionFormat(this, range[0], range[1], precision, format));

	*retVal = format;
	(*retVal)->AddRef();
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getShaderInfoLog( IWebGLShader* shader, BSTR* retVal )
{
	if (!retVal)
		return E_INVALIDARG;
	
	*retVal = nullptr;

	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"getShaderInfoLog: shader", *this));

	if ( shaderImpl->GetShaderInfoLog() )
	{
		_bstr_t str(shaderImpl->GetShaderInfoLog());
		*retVal = str.Detach();
		return S_OK;
	}

	V_RET(MakeCurrent());

	LONG length = -1;
	glGetShaderiv(shaderImpl->GetGLName(), GL_INFO_LOG_LENGTH, (GLint*)&length);
	if (length == -1)
		return E_FAIL;

	if (length > 0)
	{
		CAtlStringA log;
		log.Preallocate(length);

		glGetShaderInfoLog(shaderImpl->GetGLName(), length, (GLint*)&length, log.GetBuffer());
		shaderImpl->SetShaderInfoLog(log.GetBuffer());

		_bstr_t str(shaderImpl->GetShaderInfoLog());
		*retVal = str.Detach();
	}

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::getShaderSource( IWebGLShader* shader, BSTR* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = nullptr;

	WebGLShaderType *shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"getShaderSource: shader", *this));

	CComBSTR str(shaderImpl->GetSource());
	*retVal = str.Detach();

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getTexParameter( ULONG target, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureTarget(target, L"getTexParameter: target"))
		return S_OK;

	if (!ValidateTextureParameter(pname, L"getTexParameter: pname"))
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"getTexParameter: no texture is bound");

	V_RET(CComVariant(texture->GetParameter(pname)).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getUniform( IWebGLProgram* program, IWebGLUniformLocation* location, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	if (!pluginObj_)
		return E_FAIL;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getUniform: program", *this));

	BOOL isNull = FALSE;
	WebGLUniformLocationType* locationImpl = nullptr;
	WEBGL_RET(GetConcrete(location, locationImpl, L"getUniform: location", *this, &isNull));

	if (isNull)
	{
		return GenerateError(GL_INVALID_OPERATION, L"GetUniform: location is null or undefined");
	}

	if (locationImpl->Program() != progImpl)
	{
		return GenerateError(GL_INVALID_OPERATION, L"GetUniform: this uniform location corresponds to another program");
	}

	if (locationImpl->ProgramGeneration() != progImpl->Generation())
	{
		return GenerateError(GL_INVALID_OPERATION, L"GetUniform: this uniform location is obsolete since the program has been relinked");
	}

	V_RET(MakeCurrent());

	GLint uniforms = 0;
	GLint uniformNameMaxLength = 0;
	glGetProgramiv(progImpl->GetGLName(), GL_ACTIVE_UNIFORMS, &uniforms);
	glGetProgramiv(progImpl->GetGLName(), GL_ACTIVE_UNIFORM_MAX_LENGTH, &uniformNameMaxLength);

	// we now need the type info to switch between fGetUniformfv and fGetUniformiv
	// the only way to get that is to iterate through all active uniforms by index until
	// one matches the given uniform location.
	GLenum uniformType = 0;
	CAtlStringA uniformName;
	uniformName.Preallocate(uniformNameMaxLength);
	// this buffer has 16 more bytes to be able to store [index] at the end.
	CAtlStringA uniformNameBracketIndex;
	uniformNameBracketIndex.Preallocate(uniformNameMaxLength + 16);

	GLint index;
	for (index = 0; index < uniforms; ++index)
	{
		GLsizei length;
		GLint size;
		glGetActiveUniform(progImpl->GetGLName(), index, uniformNameMaxLength, &length,
			&size, &uniformType, uniformName.GetBuffer());
		if (glGetUniformLocation(progImpl->GetGLName(), uniformName.GetBuffer()) == locationImpl->Location())
			break;

		// now we handle the case of array uniforms. In that case, fGetActiveUniform returned as 'size'
		// the biggest index used plus one, so we need to loop over that. The 0 index has already been handled above,
		// so we can start at one. For each index, we construct the string uniformName + "[" + index + "]".
		if (size > 1)
		{
			bool found_it = false;
			if (uniformName.GetBuffer()[length - 1] == ']')
			{ // if uniformName ends in [0]
				// remove the [0] at the end
				length -= 3;
				uniformName.GetBuffer()[length] = 0;
			}
			for (GLint arrayIndex = 1; arrayIndex < size; arrayIndex++)
			{
				sprintf(uniformNameBracketIndex.GetBuffer(), "%s[%d]", uniformName.GetBuffer(), arrayIndex);
				if (glGetUniformLocation(progImpl->GetGLName(), uniformNameBracketIndex.GetBuffer()) == locationImpl->Location())
				{
					found_it = true;
					break;
				}
			}
			if (found_it) break;
		}
	}

	if (index == uniforms)
		return E_FAIL; // XXX GL error? shouldn't happen.

	ULONG baseType;
	ULONG unitSize;
	if (!BaseTypeAndSizeFromUniformType(uniformType, &baseType, &unitSize))
		return E_FAIL;

	// this should never happen
	if (unitSize > 16)
		return E_FAIL;

	if (baseType == GL_FLOAT)
	{
		GLfloat fv[16] = { GLfloat(0) };
		glGetUniformfv(progImpl->GetGLName(), locationImpl->Location(), fv);
		if (unitSize == 1)
		{
			CComVariant v(fv[0]);
			V_RET(v.Detach(retVal));
		}
		else
		{
			IArrayBufferViewPtr arr;
			V_RET(CreateTypedArrayView<Float32ArrayType>(CComVariant(unitSize), CComVariant(), CComVariant(), arr));

			BYTE * mem = nullptr;
			V_RET(arr->get_mem(&mem));
			memcpy(mem, fv, unitSize*sizeof(fv[0]));
			retVal->vt = VT_DISPATCH;
			retVal->pdispVal = arr;
			retVal->pdispVal->AddRef();
		}
	}
	else if (baseType == GL_INT)
	{
		GLint iv[16] = { 0 };
		glGetUniformiv(progImpl->GetGLName(), locationImpl->Location(), iv);
		if (unitSize == 1)
		{
			CComVariant v(iv[0]);
			V_RET(v.Detach(retVal));
		}
		else
		{
			IArrayBufferViewPtr arr;
			V_RET(CreateTypedArrayView<Int32ArrayType>(CComVariant(unitSize), CComVariant(), CComVariant(), arr));

			BYTE * mem = nullptr;
			V_RET(arr->get_mem(&mem));
			memcpy(mem, iv, unitSize*sizeof(iv[0]));
			retVal->vt = VT_DISPATCH;
			retVal->pdispVal = arr;
			retVal->pdispVal->AddRef();
		}
	}
	else if (baseType == GL_BOOL)
	{
		GLint iv[16] = { 0 };
		glGetUniformiv(progImpl->GetGLName(), locationImpl->Location(), iv);
		if (unitSize == 1)
		{
			CComVariant v(iv[0] != 0);
			V_RET(v.Detach(retVal));
		}
		else
		{
			bool bv[16] = { 0 };
			for (ULONG k = 0; k < unitSize; k++)
				bv[k] = iv[k] != 0;

			CComPtr<IDispatchEx> ctx;
			V_RET(pluginObj_->GetScriptContext(ctx));

			ScriptArray<bool> arr;
			V_RET(arr.Init(ctx, bv, unitSize));

			CComPtr<IDispatch> jsArr;
			V_RET(arr.GetScriptArray(jsArr));

			retVal->vt = VT_DISPATCH;
			retVal->pdispVal = jsArr;
			retVal->pdispVal->AddRef();
		}
	}
	else
	{
		CComVariant v;
		V_RET(v.Detach(retVal));
	}

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::getUniformLocation( IWebGLProgram* program, BSTR name, IWebGLUniformLocation** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = nullptr;

	WebGLProgramType* progImpl = nullptr;
	WEBGL_RET(GetConcrete(program, progImpl, L"getUniform: program", *this));

	V_RET(MakeCurrent());

	_bstr_t str(name);
	const char* cStr = (const char *)str;
	if (!IsASCIIString(cStr, str.length()))
		return GenerateError(GL_INVALID_VALUE, L"getUniformLocation: name containing national symbols");

	GLint intLocation = glGetUniformLocation(progImpl->GetGLName(), cStr);
	if (intLocation == -1)
		return S_OK;

	WebGLUniformLocationPtr loc;
	V_RET(CreateWebGLUniformLocation(this, progImpl, intLocation, loc));
	*retVal = loc;
	(*retVal)->AddRef();
	return S_OK;
}

CComPtr<IDispatch> CWebGLRenderingContext::GetCurrentVertexAttrib( ULONG index )
{
	GLfloat value[4] = {0, 0, 0, 1};

	if (index == 0)
		memcpy(value, vertexAttrib0Value_, sizeof(value));
	else
		glGetVertexAttribfv(index, GL_CURRENT_VERTEX_ATTRIB, &value[0]);		

	return BuildScriptArray<float>(pluginObj_, 4, value);
}

STDMETHODIMP CWebGLRenderingContext::getVertexAttrib( ULONG index, ULONG pname, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant().Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (!ValidateAttribIndex(index, L"getVertexAttrib"))
		return S_OK;

	V_RET(MakeCurrent());
	switch (pname)
	{
	case GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING:
		V_RET(CComVariant(attribBuffers_[index].buffer).Detach(retVal)); break;
	case GL_VERTEX_ATTRIB_ARRAY_ENABLED:
		V_RET(CComVariant(attribBuffers_[index].enabled ? true : false).Detach(retVal)); break;
	case GL_VERTEX_ATTRIB_ARRAY_SIZE:
		V_RET(CComVariant(attribBuffers_[index].size).Detach(retVal)); break;
	case GL_VERTEX_ATTRIB_ARRAY_STRIDE:
		V_RET(CComVariant(attribBuffers_[index].stride).Detach(retVal)); break;
	case GL_VERTEX_ATTRIB_ARRAY_TYPE:
		V_RET(CComVariant(attribBuffers_[index].type).Detach(retVal)); break;
	case GL_VERTEX_ATTRIB_ARRAY_NORMALIZED:
		V_RET(CComVariant(attribBuffers_[index].normalized ? true : false).Detach(retVal)); break;
	case GL_CURRENT_VERTEX_ATTRIB:
		V_RET(CComVariant(GetCurrentVertexAttrib(index)).Detach(retVal)); break;
	default:
		return GenerateError(GL_INVALID_ENUM, L"getVertexAttrib: pname");
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::getVertexAttribOffset( ULONG index, ULONG pname, LONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = 0;

	if (IsContextLost())
		return S_OK;

	if (!ValidateAttribIndex(index, L"getVertexAttribOffset"))
		return S_OK;

	if (pname != GL_VERTEX_ATTRIB_ARRAY_POINTER)
		return GenerateError(GL_INVALID_ENUM, L"getVertexAttribOffset: pname");

	*retVal = attribBuffers_[index].byteOffset;
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::hint( ULONG target, ULONG mode )
{
	if (IsContextLost())
		return S_OK;

	if (!validatorHint_.ValidateValue(target))
		return GenerateError(GL_INVALID_ENUM, L"hint: target");

	if (mode != GL_FASTEST && mode != GL_NICEST && mode != GL_DONT_CARE)
		return GenerateError(GL_INVALID_ENUM, L"hint: mode");
	
	V_RET(MakeCurrent());
	glHint(target, mode);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isEnabled( ULONG cap, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	if (!ValidateCapabilityEnum(cap, L"isEnabled : cap"))
		return S_OK;

	V_RET(MakeCurrent());
	V_RET(CComVariant(glIsEnabled(cap) ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isBuffer( IWebGLBuffer* buffer, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLBufferType* bufferImpl = nullptr;
	WEBGL_RET(GetConcrete(buffer, bufferImpl, L"isBuffer: buffer", *this, &isNull, &isDeleted));

	if (!isNull && !isDeleted && bufferImpl->HasEverBeenBound())
	{
		V_RET(MakeCurrent());
		V_RET(CComVariant(glIsBuffer(bufferImpl->GetGLName()) ? true : false).Detach(retVal));
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isFramebuffer( IWebGLFramebuffer* framebuffer, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLFramebufferType* framebufferImpl = nullptr;
	WEBGL_RET(GetConcrete(framebuffer, framebufferImpl, L"isFramebuffer: framebuffer", *this, &isNull, &isDeleted));

	if (!isNull && !isDeleted && framebufferImpl->HasEverBeenBound())
	{
		V_RET(MakeCurrent());
		V_RET(CComVariant(glIsFramebuffer(framebufferImpl->GetGLName()) ? true : false).Detach(retVal));
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isProgram( IWebGLProgram* program, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLProgramType* programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"isProgram: program", *this, &isNull, &isDeleted));
	V_RET(CComVariant((!isNull && !isDeleted) ? true : false).Detach(retVal));

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isRenderbuffer( IWebGLRenderbuffer* renderbuffer, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLRenderbufferType* renderbufferImpl = nullptr;
	WEBGL_RET(GetConcrete(renderbuffer, renderbufferImpl, L"isRenderbuffer: renderbuffer", *this, &isNull, &isDeleted));

	if (!isNull && !isDeleted && renderbufferImpl->HasEverBeenBound())
	{
		V_RET(MakeCurrent());
		V_RET(CComVariant(glIsRenderbuffer(renderbufferImpl->GetGLName()) ? true : false).Detach(retVal));
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isShader( IWebGLShader* shader, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"isShader: shader", *this, &isNull, &isDeleted));
	V_RET(CComVariant((!isNull && !isDeleted) ? true : false).Detach(retVal));

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::isTexture( IWebGLTexture* texture, VARIANT* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(CComVariant(false).Detach(retVal));

	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	BOOL isDeleted = FALSE;
	WebGLTextureType* textureImpl = nullptr;
	WEBGL_RET(GetConcrete(texture, textureImpl, L"isTexture: texture", *this, &isNull, &isDeleted));

	if (!isNull && !isDeleted && textureImpl->HasEverBeenBound())
	{
		V_RET(MakeCurrent());
		V_RET(CComVariant(glIsTexture(textureImpl->GetGLName()) ? true : false).Detach(retVal));
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::lineWidth( FLOAT width )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glLineWidth(width);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::linkProgram( IWebGLProgram* program )
{
	if (IsContextLost())
		return S_OK;

	WebGLProgramType* programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"linkProgram: program", *this));

	if (!programImpl->HasBothShaderTypesAttached())
	{
		programImpl->SetLinkStatus(false);
		return S_OK;
	}

	if (!programImpl->NextGeneration())
		return E_FAIL; 

	V_RET(MakeCurrent());

	glLinkProgram(programImpl->GetGLName());

	GLint ok;
	glGetProgramiv(programImpl->GetGLName(), GL_LINK_STATUS, &ok);
	if (ok)
	{
		programImpl->SetLinkStatus(true);
		programImpl->UpdateInfo();
	}
	else
	{
		programImpl->SetLinkStatus(false);
	}

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::pixelStorei( ULONG pname, LONG param )
{
	if (IsContextLost())
		return S_OK;

	switch (pname)
	{
	case GL_UNPACK_FLIP_Y_WEBGL:
		pixelStoreFlipY_ = (param != 0); break;
	case GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL:
		pixelStorePremultiplyAlpha_ = (param != 0); break;
	case GL_UNPACK_COLORSPACE_CONVERSION_WEBGL:
		{
			if (param != GL_NONE && param != GL_BROWSER_DEFAULT_WEBGL)
				return GenerateError(GL_INVALID_ENUM, L"pixelStorei: invalid colorspace conversion parameter");
			pixelStoreColorspaceConversion_ = param;
		} break;
	case GL_PACK_ALIGNMENT:
	case GL_UNPACK_ALIGNMENT:
		{
			if (param != 1 && param != 2 && param != 4 && param != 8)
				return GenerateError(GL_INVALID_VALUE, L"pixelStorei: invalid pack/unpack alignment value");

			if (pname == GL_PACK_ALIGNMENT)
				pixelStorePackAlignment_ = param;
			else if (pname == GL_UNPACK_ALIGNMENT)
				pixelStoreUnpackAlignment_ = param;

			V_RET(MakeCurrent());
			glPixelStorei(pname, param);
		} break;
	default:
		return GenerateError(GL_INVALID_ENUM, L"pixelStorei: pname");
	}
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::polygonOffset( FLOAT factor, FLOAT units )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glPolygonOffset(factor, units);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::readPixels( LONG x, LONG y, LONG width, LONG height,
	ULONG format, ULONG type, IArrayBufferView* pixels )
{
	if (IsContextLost())
		return S_OK;

	if (!pixels)
		return GenerateError(GL_INVALID_VALUE, L"readPixels: pixels parameter is null");

	if (!ValidateTextureArrayBufferType(CComQIPtr<IArrayBufferView>(pixels), type))
		return GenerateError(GL_INVALID_OPERATION, L"readPixels: pixels. ArrayView type does not match type parameter");

	const ULONG dataSize = GetArraySize(pixels);
	BYTE* dataPtr = GetArrayData(pixels);

	if (format != GL_RGBA && type != GL_UNSIGNED_BYTE)
		return GenerateError(GL_INVALID_OPERATION, L"readPixels: not allowed format and type combination");

	if (format != GL_RGBA)
		return GenerateError(GL_INVALID_ENUM, L"readPixels: format is not an accepted value");
	if (type != GL_UNSIGNED_BYTE)
		return GenerateError(GL_INVALID_ENUM, L"readPixels: type is not an accepted value");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"readPixels: negative size passed");
	if (width == 0 || height == 0)
		return S_OK;

	const TexelFormat::Format texelFormat = GetTexelFormat(format, type);
	const ULONG texelSize = GetTexelByteSize(texelFormat);
	const ULONG alignedRowSize = GetAlignedRowByteSize(width, texelFormat, pixelStorePackAlignment_);
	const ULONG alignedImageSize = GetAlignedImageByteSize(width, height, texelFormat, pixelStorePackAlignment_);

	if (alignedImageSize > dataSize)
		return GenerateError(GL_INVALID_OPERATION, L"readPixels: buffer too small");

	V_RET(MakeCurrent());

	if(!ValidateBoundFramebufferStatus(L"readPixels"))
		return S_OK;

	auto attachment = boundFramebuffer_ ? boundFramebuffer_->GetAttachment(GL_COLOR_ATTACHMENT0) : NULL;
	LONG fboWidth = attachment ? attachment->GetWidth() : primaryFBO_.GetWidth();
	LONG fboHeight = attachment ? attachment->GetHeight() : primaryFBO_.GetHeight();

	/* HACK around ANGLE, until it supports multisampled buffers read*/
	CAtlArray<BYTE> data;
	data.SetCount(fboWidth*fboHeight*4);
	EGLDisplay eglDisplay = eglGetCurrentDisplay();
	CComPtr<IDirect3DDevice9> device(static_cast<egl::Display*>(eglDisplay)->getDevice());
	CComPtr<IDirect3DSurface9> rt;
	gl::Context * ctx = static_cast<gl::Context*>(eglCtx_);
	rt = ctx->getDrawFramebuffer()->getRenderTarget();
	V_RET(pixelReader_.ReadBackPixels(rt, data.GetData(), (ULONG)data.GetCount(), FALSE, FALSE, TRUE));
	
	memset(dataPtr, 0, dataSize);

	LONG srcX  = Min(Max(x, 0l), fboWidth);
	LONG srcY = Min(Max(y, 0l), fboHeight);
	LONG srcWidth = x >= 0 ? Min(width, fboWidth-srcX) : Min(width+x, fboWidth);
	LONG srcHeight = y >= 0 ? Min(height, fboHeight-srcY) : Min(height+y, fboHeight);

	LONG destX = srcX - x;
	LONG destY = srcY - y;
	LONG destStride = alignedRowSize;
	BYTE * destStart = dataPtr + destY*destStride + destX*4;

	ULONG srcRowByteLength = srcWidth*4;
	ULONG srcStride = fboWidth*4;
	ULONG srcRowCount = srcHeight;
	BYTE * srcStart = data.GetData() + srcY*srcStride + srcX*4;

	for (ULONG i = 0; i < srcRowCount; ++i)
	{
		assert(destStart + i*destStride + srcRowByteLength >= dataPtr);
		assert(destStart + i*destStride + srcRowByteLength <= dataPtr + dataSize);

		memcpy(destStart + i*destStride, srcStart + i*srcStride, srcRowByteLength);
	}
	pixels->put_modified(TRUE);
	
	/*END of HACK*/

	/* NORMAL WAY */
	/*if (x >= 0 && y >= 0 && x + width <= fboWidth && y + height <= fboHeight)
	{
		glReadPixels(x, y, width, height, format, type, dataPtr);
	}
	else
	{
		memset(dataPtr, 0, dataSize);

		if ( x < fboWidth && x + width > 0 && y < fboHeight && y + height > 0)
		{
			LONG subrectX = Max<LONG>(x, 0);
			LONG subrectWidth  = Min<LONG>(x + width, fboWidth) - subrectX;

			LONG subrectY = Max<LONG>(y, 0);
			LONG subrectHeight = Min<LONG>(y + height, fboHeight) - subrectY;

			if (subrectWidth < 0 || subrectHeight < 0 || subrectWidth > width || subrectHeight > height)
				return GenerateError(GL_INVALID_OPERATION, L"readPixels: integer overflow computing clipped rect size");

			CAtlArray<BYTE> subrectData;
			subrectData.SetCount(GetAlignedImageByteSize(subrectWidth, subrectHeight, texelFormat, pixelStorePackAlignment_));
			BYTE* subrectDataPtr = subrectData.GetData();

			glReadPixels(subrectX, subrectY, subrectWidth, subrectHeight, format, type, subrectDataPtr);

			const ULONG subrectPlainRowSize = subrectWidth * texelSize;
			const ULONG subrectAlignedRowSize = GetAlignedRowByteSize(subrectWidth, texelFormat, pixelStorePackAlignment_);

			for (LONG yInsideSubrect = 0; yInsideSubrect < subrectHeight; ++yInsideSubrect)
			{
				LONG subrectXInDestBuf = subrectX - x;
				LONG subrectYInDestBuf = subrectY - y;

				BYTE* destPtr = dataPtr + alignedRowSize * (subrectYInDestBuf + yInsideSubrect) + texelSize * subrectXInDestBuf;
				const BYTE* srcPtr = subrectDataPtr + subrectAlignedRowSize * yInsideSubrect;

				memcpy(destPtr, srcPtr, subrectPlainRowSize);
			}
		}
	}*/

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::renderbufferStorage( ULONG target, ULONG internalformat, LONG width, LONG height )
{
	if (IsContextLost())
		return S_OK;

	if (target != GL_RENDERBUFFER)
		return GenerateError(GL_INVALID_ENUM, L"renderbufferStorage: target");

	if (!boundRenderbuffer_ || !boundRenderbuffer_->GetGLName())
		return GenerateError(GL_INVALID_OPERATION, L"renderbufferStorage called on renderbuffer 0");

	if (width <= 0 || height <= 0)
		return GenerateError(GL_INVALID_VALUE, L"renderbufferStorage: width and height must be > 0");

	if (width > maxRenderBufferSize_ || height > maxRenderBufferSize_)
		return GenerateError(GL_INVALID_VALUE, L"renderbufferStorage: width and height must be > 0");

	if(!ValidateRenderbufferFormat(internalformat, L"renderbufferStorage: internalformat"))
		return S_OK;

	V_RET(MakeCurrent());

	boundRenderbuffer_->Storage(width, height, internalformat);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::sampleCoverage( FLOAT value, BOOL invert )
{
	if (IsContextLost())
		return S_OK;

	V_RET(MakeCurrent());

	glSampleCoverage(value, invert);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::scissor( LONG x, LONG y, LONG width, LONG height )
{
	if (IsContextLost())
		return S_OK;

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"scissor: negative size");
	
	V_RET(MakeCurrent());

	glScissor(x, y, width, height);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::shaderSource( IWebGLShader* shader, BSTR source )
{
	if (IsContextLost())
		return S_OK;

	WebGLShaderType* shaderImpl = nullptr;
	WEBGL_RET(GetConcrete(shader, shaderImpl, L"shaderSource: shader", *this));

	shaderImpl->SetSource(_bstr_t(source));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilFunc( ULONG func, LONG ref, ULONG mask )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateComparisonEnum(func, L"stencilFunc: func"))
		return S_OK;

	GLint stencilBits = 0;
	glGetIntegerv(GL_STENCIL_BITS, &stencilBits);

	stencilRef_ = Clamp<LONG>(ref, 0, (LONG)powf(2, (float)stencilBits) - 1);
	stencilValueMask_ = mask;

	V_RET(MakeCurrent());

	glStencilFunc(func, stencilRef_, stencilValueMask_);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilFuncSeparate( ULONG face, ULONG func, LONG ref, ULONG mask )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateFaceEnum(face, L"stencilFuncSeparate: face") ||
		!ValidateComparisonEnum(func, L"stencilFuncSeparate: func"))
		return S_OK;

	if (face != GL_FRONT_AND_BACK && (ref != stencilRef_ || mask != stencilValueMask_))
	{
		return GenerateError(GL_INVALID_OPERATION,
			L"stencilFuncSeparate: WebGL doesn't currently allow specifying different values for front and back.");
	}

	GLint stencilBits = 0;
	glGetIntegerv(GL_STENCIL_BITS, &stencilBits);

	stencilRef_ = Clamp<LONG>(ref, 0, (LONG)powf(2, (float)stencilBits) - 1);
	stencilValueMask_ = mask;

	V_RET(MakeCurrent());

	glStencilFuncSeparate(face, func, stencilRef_, stencilValueMask_);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilMask( ULONG mask )
{
	if (IsContextLost())
		return S_OK;

	stencilWriteMask_ = mask;

	V_RET(MakeCurrent());

	glStencilMask(mask);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilMaskSeparate( ULONG face, ULONG mask )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateFaceEnum(face, L"stencilMaskSeparate: face"))
		return S_OK;

	if (face != GL_FRONT_AND_BACK && mask != stencilWriteMask_)
	{
		return GenerateError(GL_INVALID_OPERATION,
			L"stencilMaskSeparate: WebGL doesn't currently allow specifying different values for front and back.");
	}

	stencilWriteMask_ = mask;
	
	V_RET(MakeCurrent());

	glStencilMaskSeparate(face, mask);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilOp( ULONG fail, ULONG zfail, ULONG zpass )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateStencilOpEnum(fail, L"stencilOp: fail") ||
		!ValidateStencilOpEnum(zfail, L"stencilOp: zfail") ||
		!ValidateStencilOpEnum(zpass, L"stencilOp: zpass"))
		return S_OK;
	
	V_RET(MakeCurrent());

	glStencilOp(fail, zfail, zpass);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::stencilOpSeparate( ULONG face, ULONG fail, ULONG zfail, ULONG zpass )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateFaceEnum(face, L"stencilOpSeparate: face") ||
		!ValidateStencilOpEnum(fail, L"stencilOpSeparate: fail") ||
		!ValidateStencilOpEnum(zfail, L"stencilOpSeparate: zfail") ||
		!ValidateStencilOpEnum(zpass, L"stencilOpSeparate: zpass"))
		return S_OK;

	V_RET(MakeCurrent());

	glStencilOpSeparate(face, fail, zfail, zpass);
	return S_OK;
}

HRESULT CWebGLRenderingContext::texImage2DImpl( ULONG target, LONG level, ULONG internalformat,
	LONG width, LONG height, LONG border, ULONG format, ULONG type, const BYTE* pixels, ULONG byteLength )
{
	if (!ValidateTextureOpTarget(target, L"texImage2D: target") ||
		!ValidateTextureFormat(internalformat, L"texImage2D: internalformat") ||
		!ValidateTextureType(type, L"texImage2D: type") ||
		!ValidateTextureFormatAndType(format, type, L"texImage2D"))
		return S_OK;

	if (format != internalformat)
		return GenerateError(GL_INVALID_OPERATION, L"texImage2D: format does not match internalformat");

	if (target != GL_TEXTURE_2D && width != height)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: width and height must be equal for cube map");

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: level must be >= 0");

	LONG maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;

	if (!(maxSize >> level))
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: 2^level exceeds maximum texture size");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: width and height must be >= 0");

	if (width > maxSize || height > maxSize)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: width or height exceeds maximum texture size");

	if (level > 0 && !IsPowerOfTwo(width, height))
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: width or height is not a power of 2, but level > 0");

	if (border != 0)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: border must be 0");

	ULONG srcImageSize = GetAlignedImageByteSize(width, height, GetTexelFormat(format, type), pixelStoreUnpackAlignment_);
	if (byteLength && byteLength < srcImageSize)
		return GenerateError(GL_INVALID_OPERATION, L"texImage2D: not enough data for operation");

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"texImage2D: no texture is bound to this target");

	texture->Image(target, level, internalformat, type, width, height);

	V_RET(MakeCurrent());

	CAtlArray<BYTE> mem;
	if (!pixels)
	{
		mem.SetCount(srcImageSize);
		memset(mem.GetData(), 0, srcImageSize);
		pixels = mem.GetData();
	}
	glTexImage2D(target, level, internalformat, width, height, border, format, type, pixels);
	return S_OK;
}

HRESULT CWebGLRenderingContext::texImage2DFromTypedArray( ULONG target, LONG level, ULONG internalformat,
	LONG width, LONG height, LONG border, ULONG format, ULONG type, CComPtr<IDispatch> pixels )
{
	if (!ValidateTextureFormat(internalformat, L"texImage2D: internalformat") ||
		!ValidateTextureType(type, L"texImage2D: type") ||
		!ValidateTextureFormatAndType(format, type, L"texImage2D"))
		return S_OK;

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"texImage2D: width and height must be >= 0");

	ULONG dataSize = 0;
	BYTE* dataPtr = NULL;

	if (pixels)
	{
		CComQIPtr<IArrayBufferView> arrBuffer(pixels);

		if (!ValidateTextureArrayBufferType(arrBuffer, type))
			return GenerateError(GL_INVALID_OPERATION, L"texImage2D: pixels. ArrayView type does not match type parameter");

		V_RET(arrBuffer->get_byteLength(&dataSize));
		V_RET(arrBuffer->get_mem(&dataPtr));

		if (pixelStoreFlipY_)
			FlipYImage(width, height, GetTexelFormat(format, type), pixelStoreUnpackAlignment_, dataPtr);
	}

	return texImage2DImpl(target, level, internalformat, width, height, border, format, type, dataPtr, dataSize);
}

HRESULT CWebGLRenderingContext::texImage2DFromJSObject( ULONG target, LONG level, ULONG internalformat,
	ULONG format, ULONG type, CComPtr<IDispatch> pixels )
{
	if (!pluginObj_)
		return E_FAIL;

	ULONG width = 0, height = 0;
	TexelFormat::Format texelFormat = GetTexelFormat(format, type);

	BOOL asyncInit = FALSE;
	BOOL mayRequireConvertion = TRUE;
	CAtlArray<BYTE> pixelData;
	TexelFormat::Format srcFormat;
	if ( SUCCEEDED(pluginObj_->GetHTMLObjectData(pixels, pixelData, format, width, height)) )
	{
		srcFormat = TexelFormat::RGBA8888;
	}
	else
	{
		WebGLTexturePtr texture = GetBoundTexture(target);
		if (!texture)
			return GenerateError(GL_INVALID_OPERATION, L"texImage2D: no texture is bound to this target");

		TexImageContext imgCtx = { texture, target, level, internalformat, 0, 0, 0, 0, 0, format, type, pixelStoreFlipY_, 1, FALSE };

		V_RET(pluginObj_->AsyncInitTexture(pixels, imgCtx, pixelData, asyncInit, width, height));
		srcFormat = texelFormat;
		mayRequireConvertion = FALSE;
	}
	
	if (!asyncInit)
	{
		CAtlArray<BYTE> convertedPixels;
		BYTE* pixelDataPtr = pixelData.GetData();
		ULONG pixelDataSize = (ULONG)pixelData.GetCount();

		if (mayRequireConvertion && (pixelStoreFlipY_ || texelFormat != srcFormat) )
		{
			convertedPixels.SetCount(GetAlignedImageByteSize(width, height, texelFormat, 1));
			if(!ConvertImage(width, height, MultiplyOp::None, 1, pixelStoreFlipY_,
				srcFormat, pixelData.GetData(), texelFormat, convertedPixels.GetData() ))
				return E_INVALIDARG;

			pixelDataPtr = convertedPixels.GetData();
			pixelDataSize = (ULONG)convertedPixels.GetCount();
		}
	
		V_RET(texImage2DImpl(target, level, internalformat, width, height, 0, format, type, pixelDataPtr, pixelDataSize));
	}
	
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::texImage2D( ULONG target, LONG level, ULONG internalformat, VARIANT arg0, VARIANT arg1, VARIANT arg2,
	VARIANT arg3, VARIANT arg4, VARIANT arg5 )
{
	if (IsContextLost())
		return S_OK;

	using namespace DataConvertion;

	if (arg3.vt == VT_EMPTY && arg4.vt == VT_EMPTY && arg5.vt == VT_EMPTY)
	{
		ULONG format = 0; V_RET(ECMACvt(format, arg0));
		ULONG type = 0; V_RET(ECMACvt(type, arg1));

		IDispatch * p = nullptr;
		V_RET(ECMACvt(p, arg2));
		CComPtr<IDispatch> pixels; 
		pixels.Attach(p);
		
		return texImage2DFromJSObject(target, level, internalformat, format, type, pixels);
	}
	else
	{
		LONG width = 0; V_RET(ECMACvt(width, arg0));
		LONG height = 0; V_RET(ECMACvt(height, arg1));
		LONG border = 0; V_RET(ECMACvt(border, arg2));
		ULONG format = 0; V_RET(ECMACvt(format, arg3));
		ULONG type = 0; V_RET(ECMACvt(type, arg4));

		IDispatch * p = nullptr;
		V_RET(ECMACvt(p, arg5));
		CComPtr<IDispatch> pixels; 
		pixels.Attach(p);
		return texImage2DFromTypedArray(target, level, internalformat, width, height, border, format, type, pixels);
	}

	return DISP_E_BADPARAMCOUNT;
}

STDMETHODIMP CWebGLRenderingContext::texParameterf( ULONG target, ULONG pname, FLOAT param )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureTarget(target, L"texParameterf: target"))
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"texParameterf: no texture is bound to this target");

	texture->SetParameter(pname, (ULONG)param);

	V_RET(MakeCurrent());

	glTexParameterf(target, pname, param);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::texParameteri( ULONG target, ULONG pname, LONG param )
{
	if (IsContextLost())
		return S_OK;

	if (!ValidateTextureTarget(target, L"texParameteri: target"))
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"texParameteri: no texture is bound to this target");

	texture->SetParameter(pname, (ULONG)param);

	V_RET(MakeCurrent());

	glTexParameteri(target, pname, param);
	return S_OK;
}

HRESULT CWebGLRenderingContext::texSubImage2DImpl( ULONG target, LONG level, LONG xoffset, LONG yoffset,
	LONG width, LONG height, ULONG format, ULONG type, const BYTE* pixels, ULONG byteLength )
{
	if (!ValidateTextureOpTarget(target, L"texSubImage2D: target") ||
		!ValidateTextureFormat(format, L"texSubImage2D: internalformat") ||
		!ValidateTextureType(type, L"texSubImage2D: type") ||
		!ValidateTextureFormatAndType(format, type, L"texSubImage2D"))
		return S_OK;

	if (level < 0)
		return GenerateError(GL_INVALID_VALUE, L"texSubImage2D: level must be >= 0");

	LONG maxSize = target == GL_TEXTURE_2D ? maxTextureSize_ : maxCubeMapTextureSize_;
	if (!(maxSize >> level))
		return GenerateError(GL_INVALID_VALUE, L"texSubImage2D: 2^level exceeds maximum texture size");

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"texSubImage2D: width and height must be >= 0");
	if (width == 0 || height == 0)
		return S_OK;

	WebGLTexturePtr texture = GetBoundTexture(target);
	if (!texture)
		return GenerateError(GL_INVALID_OPERATION, L"texSubImage2D: no texture is bound to this target");

	if ((LONG)texture->GetMipLevelCount() <= level)
		return GenerateError(GL_INVALID_OPERATION, L"texSubImage2D: texture image level has not been defined by a previous");
	const CWebGLTexture::MipLevelDesc& levelDesc = texture->GetMipLevelDesc(level, GetCubeMapFace(target));
	if (!levelDesc.isDefined)
		return GenerateError(GL_INVALID_OPERATION, L"texSubImage2D: texture image level has not been defined by a previous");
	if (levelDesc.internalFormat != format)
		return GenerateError(GL_INVALID_OPERATION, L"texSubImage2D: format isn't equal to initial internalformat");

	if (xoffset < 0 || xoffset + width > (LONG)levelDesc.width || yoffset < 0 || yoffset + height > (LONG)levelDesc.height)
		return GenerateError(GL_INVALID_VALUE, L"texSubImage2D: invalid x-offset or y-offset");

	V_RET(MakeCurrent());

	glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels);
	return S_OK;
}

HRESULT CWebGLRenderingContext::texSubImage2DFromTypedArray( ULONG target, LONG level, LONG xoffset, LONG yoffset,
	LONG width, LONG height, ULONG format, ULONG type, CComPtr<IDispatch> pixels )
{
	if (!ValidateTextureType(type, L"texSubImage2D: type") ||
		!ValidateTextureFormatAndType(format, type, L"texSubImage2D"))
		return S_OK;

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"texSubImage2D: width and height must be >= 0");
	if (width == 0 || height == 0)
		return S_OK;

	ULONG dataSize = 0;
	BYTE* dataPtr = NULL;

	if (pixels)
	{
		CComQIPtr<IArrayBufferView> arrBuffer(pixels);

		if (!ValidateTextureArrayBufferType(arrBuffer, type))
			return GenerateError(GL_INVALID_OPERATION, L"texSubImage2D: pixels. ArrayView type does not match type parameter");

		V_RET(arrBuffer->get_byteLength(&dataSize));
		V_RET(arrBuffer->get_mem(&dataPtr));

		if (pixelStoreFlipY_)
			FlipYImage(width, height, GetTexelFormat(format, type), pixelStoreUnpackAlignment_, dataPtr);
	}

	return texSubImage2DImpl(target, level, xoffset, yoffset, width, height, format, type, dataPtr, dataSize);
}

HRESULT CWebGLRenderingContext::texSubImage2DFromJSObject( ULONG target, LONG level,
	LONG xoffset, LONG yoffset, ULONG format, ULONG type, CComPtr<IDispatch> pixels )
{
	if (!pluginObj_)
		return E_FAIL;

	ULONG width = 0, height = 0;
	TexelFormat::Format texelFormat = GetTexelFormat(format, type);

	BOOL asyncInit = FALSE;
	BOOL mayRequireConvertion = TRUE;
	CAtlArray<BYTE> pixelData;
	TexelFormat::Format srcFormat;
	if ( SUCCEEDED(pluginObj_->GetHTMLObjectData(pixels, pixelData, format, width, height)))
	{
		srcFormat = TexelFormat::RGBA8888;
	}
	else
	{
		WebGLTexturePtr texture = GetBoundTexture(target);
		if (!texture)
			return GenerateError(GL_INVALID_OPERATION, L"texImage2D: no texture is bound to this target");

		pixelData.SetCount(GetAlignedImageByteSize(width, height, texelFormat, 1));

		TexImageContext imgCtx = { texture, target, level, 0, xoffset, yoffset, 0, 0, 0, format, type, pixelStoreFlipY_, 1, TRUE };

		V_RET(pluginObj_->AsyncInitTexture(pixels, imgCtx, pixelData, asyncInit, width, height));
		srcFormat = texelFormat;
		mayRequireConvertion = FALSE;
	}

	if (!asyncInit)
	{
		CAtlArray<BYTE> convertedPixels;
		BYTE* pixelDataPtr = pixelData.GetData();
		ULONG pixelDataSize = (ULONG)pixelData.GetCount();

		if (mayRequireConvertion && (pixelStoreFlipY_ || texelFormat != srcFormat) )
		{
			convertedPixels.SetCount(GetAlignedImageByteSize(width, height, texelFormat, 1));
			if(!ConvertImage(width, height, MultiplyOp::None, 1, pixelStoreFlipY_,
				srcFormat, pixelData.GetData(), texelFormat, convertedPixels.GetData() ))
				return E_INVALIDARG;

			pixelDataPtr = convertedPixels.GetData();
			pixelDataSize = (ULONG)convertedPixels.GetCount();
		}

		V_RET(texSubImage2DImpl(target, level, xoffset, yoffset, width, height, format, type, pixelDataPtr, pixelDataSize));
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::texSubImage2D( ULONG target, LONG level, LONG xoffset, LONG yoffset, VARIANT arg0, VARIANT arg1, VARIANT arg2,
	VARIANT arg3, VARIANT arg4 )
{
	if (IsContextLost())
		return S_OK;

	using namespace DataConvertion;

	if (arg3.vt == VT_EMPTY && arg4.vt == VT_EMPTY)
	{
		ULONG format = 0; V_RET(ECMACvt(format, arg0));
		ULONG type = 0; V_RET(ECMACvt(type, arg1));

		IDispatch * p = nullptr;
		V_RET(ECMACvt(p, arg2));
		CComPtr<IDispatch> pixels; 
		pixels.Attach(p);

		return texSubImage2DFromJSObject(target, level, xoffset, yoffset, format, type, pixels);
	}
	else
	{
		LONG width = 0; V_RET(ECMACvt(width, arg0));
		LONG height = 0; V_RET(ECMACvt(height, arg1));
		ULONG format = 0; V_RET(ECMACvt(format, arg2));
		ULONG type = 0; V_RET(ECMACvt(type, arg3));

		IDispatch * p = nullptr;
		V_RET(ECMACvt(p, arg4));
		CComPtr<IDispatch> pixels; 
		pixels.Attach(p);

		return texSubImage2DFromTypedArray(target, level, xoffset, yoffset, width, height, format, type, pixels);
	}

	return DISP_E_BADPARAMCOUNT;
}

template <typename T, typename glFunc>
HRESULT uniformV( IWebGLUniformLocation* location, IDispatch* v, T* data, glFunc func, ULONG count, CWebGLRenderingContext* ctx, const BSTR str )
{
	WebGLUniformLocationType * locImpl = nullptr;
	BOOL isNull = FALSE;
	WEBGL_RET(GetConcrete(location, locImpl, str, *ctx, &isNull));

	if (isNull || !ctx->currentProgram_)
		return S_OK;

	if (ctx->currentProgram_->Generation() != locImpl->ProgramGeneration())
		return ctx->GenerateError(GL_INVALID_OPERATION, L"%s: This uniform location is obsolete since the program has been relinked", str);

	CComPtr<IDispatch> valArray(v);
	CComQIPtr<std::conditional<std::is_floating_point<T>::value, IFloat32Array, IInt32Array>::type> dataArray(v);

	T * mem = data;
	ULONG length = 0;
	if (!mem)
	{
		if (dataArray)
		{
			V_RET(dataArray->get_length(&length));
			V_RET(dataArray->get_mem((byte**)&mem));
		}
		else
		{
			ScriptArray<T> sa;
			V_RET(sa.Attach(valArray));
			V_RET(sa.GetLength(length));
			mem = (T*)_alloca(length*sizeof(T));
			V_RET(sa.CopyToNative(mem, length));
		}
	}
	else
	{
		length = count;
	}
	
	if (length < count || length % count != 0)
	{
		return ctx->GenerateError(GL_INVALID_VALUE, L"value array is of invalid length");
	}

	bool isArray = false;
	int arrayIndex = -1;
	int arraySize = 0;
	ctx->currentProgram_->GetUniformInfo(locImpl->GetGLName(), isArray, arrayIndex, arraySize);

	if (isArray)
		length = Min(length, (arraySize-arrayIndex)*count);

	func(locImpl->Location(), length/count, mem);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::uniform1f( IWebGLUniformLocation* location, FLOAT x )
{
	if (IsContextLost())
		return S_OK;

	float val[1];
	val[0] = x;
	return uniformV(location, nullptr, val, glUniform1fv, sizeof(val)/sizeof(val[0]), this, L"uniform1f : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform1fv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<float>(location, v, nullptr, glUniform1fv, 1, this, L"uniform1fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform1i( IWebGLUniformLocation* location, LONG x )
{
	if (IsContextLost())
		return S_OK;

	GLint val[1];
	val[0] = x;
	return uniformV(location, nullptr, val, glUniform1iv, sizeof(val)/sizeof(val[0]), this, L"uniform1i : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform1iv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<GLint>(location, v, nullptr, glUniform1iv, 1, this, L"uniform1iv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform2f( IWebGLUniformLocation* location, FLOAT x, FLOAT y )
{
	if (IsContextLost())
		return S_OK;

	float val[2];
	val[0] = x;
	val[1] = y;
	return uniformV(location, nullptr, val, glUniform2fv, sizeof(val)/sizeof(val[0]), this, L"uniform2f : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform2fv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<float>(location, v, nullptr, glUniform2fv, 2, this, L"uniform2fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform2i( IWebGLUniformLocation* location, LONG x, LONG y )
{
	if (IsContextLost())
		return S_OK;

	GLint val[2];
	val[0] = x;
	val[1] = y;
	return uniformV(location, nullptr, val, glUniform2iv, sizeof(val)/sizeof(val[0]), this, L"uniform2i : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform2iv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<GLint>(location, v, nullptr, glUniform2iv, 2, this, L"uniform2iv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform3f( IWebGLUniformLocation* location, FLOAT x, FLOAT y, FLOAT z )
{
	if (IsContextLost())
		return S_OK;

	float val[3];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	return uniformV(location, nullptr, val, glUniform3fv, sizeof(val)/sizeof(val[0]), this, L"uniform3f : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform3fv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<float>(location, v, nullptr, glUniform3fv, 3, this, L"uniform3fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform3i( IWebGLUniformLocation* location, LONG x, LONG y, LONG z )
{
	if (IsContextLost())
		return S_OK;

	GLint val[3];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	return uniformV(location, nullptr, val, glUniform3iv, sizeof(val)/sizeof(val[0]), this, L"uniform3i : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform3iv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<GLint>(location, v, nullptr, glUniform3iv, 3, this, L"uniform3iv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform4f( IWebGLUniformLocation* location, FLOAT x, FLOAT y, FLOAT z, FLOAT w )
{
	if (IsContextLost())
		return S_OK;

	float val[4];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	val[3] = w;
	return uniformV(location, nullptr, val, glUniform4fv, sizeof(val)/sizeof(val[0]), this, L"uniform4f : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform4fv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<float>(location, v, nullptr, glUniform4fv, 4, this, L"uniform4fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform4i( IWebGLUniformLocation* location, LONG x, LONG y, LONG z, LONG w )
{
	if (IsContextLost())
		return S_OK;

	GLint val[4];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	val[3] = w;
	return uniformV(location, nullptr, val, glUniform4iv, sizeof(val)/sizeof(val[0]), this, L"uniform4i : location");
}

STDMETHODIMP CWebGLRenderingContext::uniform4iv( IWebGLUniformLocation* location, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return uniformV<GLint>(location, v, nullptr, glUniform4iv, 4, this, L"uniform4iv : location");
}

template <typename T, typename glFunc>
HRESULT uniformMatrix( IWebGLUniformLocation* location, IDispatch* v, glFunc func, ULONG count, BOOL transpose, CWebGLRenderingContext* ctx, const BSTR str )
{
	WebGLUniformLocationType * locImpl = nullptr;
	BOOL isNull = FALSE;
	WEBGL_RET(GetConcrete(location, locImpl, str, *ctx, &isNull));

	if (isNull || !ctx->currentProgram_)
		return S_OK;

	if (ctx->currentProgram_->Generation() != locImpl->ProgramGeneration())
		return ctx->GenerateError(GL_INVALID_OPERATION, L"%s: This uniform location is obsolete since the program has been relinked", str);

	CComPtr<IDispatch> valArray(v);
	CComQIPtr<std::conditional<std::is_floating_point<T>::value, IFloat32Array, IInt32Array>::type> dataArray(v);

	T * mem = nullptr;
	ULONG length = 0;
	if (dataArray)
	{
		V_RET(dataArray->get_length(&length));
		V_RET(dataArray->get_mem((byte**)&mem));
	}
	else
	{
		ScriptArray<T> sa;
		V_RET(sa.Attach(valArray));
		V_RET(sa.GetLength(length));
		mem = (T*)_alloca(length*sizeof(T));
		V_RET(sa.CopyToNative(mem, length));
	}

	if (length < count || length % count != 0)
	{
		return ctx->GenerateError(GL_INVALID_VALUE, L"value array is of invalid length");
	}

	if (transpose)
	{
		return ctx->GenerateError(GL_INVALID_VALUE, L"transpose != GL_FALSE");
	}

	func(locImpl->Location(), length/count, transpose, mem);
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::uniformMatrix2fv( IWebGLUniformLocation* location, BOOL transpose, IDispatch* value )
{
	if (IsContextLost())
		return S_OK;

	return uniformMatrix<float>(location, value, glUniformMatrix2fv, 2*2, transpose, this, L"uniformMatrix2fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniformMatrix3fv( IWebGLUniformLocation* location, BOOL transpose, IDispatch* value )
{
	if (IsContextLost())
		return S_OK;

	return uniformMatrix<float>(location, value, glUniformMatrix3fv, 3*3, transpose, this, L"uniformMatrix3fv : location");
}

STDMETHODIMP CWebGLRenderingContext::uniformMatrix4fv( IWebGLUniformLocation* location, BOOL transpose, IDispatch* value )
{
	if (IsContextLost())
		return S_OK;

	return uniformMatrix<float>(location, value, glUniformMatrix4fv, 4*4, transpose, this, L"uniformMatrix4fv : location");
}

STDMETHODIMP CWebGLRenderingContext::useProgram( IWebGLProgram* program )
{
	if (IsContextLost())
		return S_OK;

	BOOL isNull = FALSE;
	WebGLProgramType* programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"useProgram: program", *this, &isNull));

	V_RET(MakeCurrent());

	if (isNull)
	{
		glUseProgram(0);
	}
	else
	{
		if (programImpl && !programImpl->LinkStatus())
		{
			return GenerateError(GL_INVALID_OPERATION, L"UseProgram: program was not linked successfully");
		}

		glUseProgram(programImpl->GetGLName());
	}

	if (currentProgram_ && currentProgram_->HasDeletePending())
	{
		currentProgram_->DetachShaders();
		currentProgram_->ClearDeletePending();
	}
	
	currentProgram_ = programImpl;

	return S_OK; 
}

STDMETHODIMP CWebGLRenderingContext::validateProgram( IWebGLProgram* program )
{
	if (IsContextLost())
		return S_OK;

	WebGLProgramType* programImpl = nullptr;
	WEBGL_RET(GetConcrete(program, programImpl, L"validateProgram: program", *this));
	V_RET(MakeCurrent());
	glValidateProgram(programImpl->GetGLName());
	return S_OK; 
}

template <typename glFunc>
HRESULT vertexAttribV( ULONG indx, IDispatch* v, float* data, glFunc func, ULONG count, CWebGLRenderingContext* ctx )
{
	if (!ctx->currentProgram_)
		return S_OK;

	CComPtr<IDispatch> valArray(v);
	CComQIPtr<IFloat32Array> dataArray;
	CAtlArray<float> dataVector;

	float * mem = data;
	ULONG length = 0;
	if (!mem)
	{
		if (dataArray)
		{
			V_RET(dataArray->get_length(&length));
			V_RET(dataArray->get_mem((byte**)&mem));
		}
		else
		{
			ScriptArray<float> sa;
			V_RET(sa.Attach(valArray));
			V_RET(sa.GetLength(length));
			mem = (float*)_alloca(length*sizeof(mem[0]));
			V_RET(sa.CopyToNative(mem, length));
		}
	}
	else
	{
		length = count;
	}

	if (length < count || length % count != 0)
		return ctx->GenerateError(GL_INVALID_VALUE, L"vertexAttrib: value array is of invalid length");

	if (indx == 0)
	{
		GLfloat initValue[4] = {0, 0, 0, 1};
		memcpy(ctx->vertexAttrib0Value_, initValue, sizeof(initValue));
		memcpy(ctx->vertexAttrib0Value_, mem, Min<ULONG>(length * sizeof(GLfloat), sizeof(ctx->vertexAttrib0Value_)));
	}
	else
	{
		func(indx, mem);
	}

	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib1f( ULONG indx, FLOAT x )
{
	if (IsContextLost())
		return S_OK;

	float val[1];
	val[0] = x;
	return vertexAttribV(indx, nullptr, val, glVertexAttrib1fv, sizeof(val)/sizeof(val[0]), this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib1fv( ULONG indx, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return vertexAttribV(indx, v, nullptr, glVertexAttrib1fv, 1, this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib2f( ULONG indx, FLOAT x, FLOAT y )
{
	if (IsContextLost())
		return S_OK;

	float val[2];
	val[0] = x;
	val[1] = y;
	return vertexAttribV(indx, nullptr, val, glVertexAttrib2fv, sizeof(val)/sizeof(val[0]), this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib2fv( ULONG indx, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return vertexAttribV(indx, v, nullptr, glVertexAttrib2fv, 2, this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib3f( ULONG indx, FLOAT x, FLOAT y, FLOAT z )
{
	if (IsContextLost())
		return S_OK;

	float val[3];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	return vertexAttribV(indx, nullptr, val, glVertexAttrib3fv, sizeof(val)/sizeof(val[0]), this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib3fv( ULONG indx, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return vertexAttribV(indx, v, nullptr, glVertexAttrib3fv, 3, this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib4f( ULONG indx, FLOAT x, FLOAT y, FLOAT z, FLOAT w )
{
	if (IsContextLost())
		return S_OK;

	float val[4];
	val[0] = x;
	val[1] = y;
	val[2] = z;
	val[3] = w;
	return vertexAttribV(indx, nullptr, val, glVertexAttrib4fv, sizeof(val)/sizeof(val[0]), this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttrib4fv( ULONG indx, IDispatch* v )
{
	if (IsContextLost())
		return S_OK;

	return vertexAttribV(indx, v, nullptr, glVertexAttrib4fv, 4, this);
}

STDMETHODIMP CWebGLRenderingContext::vertexAttribPointer( ULONG index, LONG size, ULONG type,
	BOOL normalized, LONG stride, LONG offset )
{
	if (IsContextLost())
		return S_OK;

	if (!boundArrayBuffer_)
		return GenerateError(GL_INVALID_OPERATION, L"vertexAttribPointer: must have valid GL_ARRAY_BUFFER binding");

	if (!ValidateAttribType(type, L"vertexAttribPointer: type") ||
		!ValidateAttribIndex(index, L"vertexAttribPointer"))
		return S_OK;

    if (size < 1 || size > 4)
        return GenerateError(GL_INVALID_VALUE, L"vertexAttribPointer: invalid element size");
    if (stride < 0 || stride > 255)
        return GenerateError(GL_INVALID_VALUE, L"vertexAttribPointer: negative or too large stride");
    if (offset < 0)
        return GenerateError(GL_INVALID_VALUE, L"vertexAttribPointer: negative offset");

	ULONG requiredAlignmentMask = GetComponentSize(type) - 1;
    if (stride & requiredAlignmentMask)
        return GenerateError(GL_INVALID_OPERATION, L"VertexAttribPointer: stride doesn't satisfy the alignment");
    if (offset & requiredAlignmentMask)
        return GenerateError(GL_INVALID_OPERATION, L"VertexAttribPointer: byteOffset doesn't satisfy the alignment");

    WebGLVertexAttrib& attrib = attribBuffers_[index];
    attrib.buffer = boundArrayBuffer_;
    attrib.stride = stride;
    attrib.size = size;
    attrib.byteOffset = offset;
    attrib.type = type;
    attrib.normalized = normalized;

	V_RET(MakeCurrent());
    glVertexAttribPointer(index, size, type, normalized, stride, (void*)(offset));
	return S_OK;
}

STDMETHODIMP CWebGLRenderingContext::__viewport( LONG x, LONG y, LONG width, LONG height )
{
	if (IsContextLost())
		return S_OK;

	if (width < 0 || height < 0)
		return GenerateError(GL_INVALID_VALUE, L"viewport: negative size");
	
	V_RET(MakeCurrent());

	GLint dims[2] = {0};
	glGetIntegerv(GL_MAX_VIEWPORT_DIMS, dims);

	if (width > dims[0])
		width = dims[0];

	if (height > dims[1])
		height = dims[1];

	glViewport(x, y, width, height);
	return S_OK;
}

//////////////////////////////////////////////////////////////////////////

void CWebGLRenderingContext::GenerateInvalidGLenumError( ULONG value, const BSTR info )
{
	GenerateError(GL_INVALID_ENUM, L"%s : invalid enum value 0x%x", info, value);
}

BOOL CWebGLRenderingContext::ValidateCapabilityEnum( ULONG cap, const BSTR info )
{
	switch(cap)
	{
	case GL_BLEND:
	case GL_CULL_FACE:
	case GL_DEPTH_TEST:
	case GL_DITHER:
	case GL_POLYGON_OFFSET_FILL:
	case GL_SAMPLE_ALPHA_TO_COVERAGE:
	case GL_SAMPLE_COVERAGE:
	case GL_SCISSOR_TEST:
	case GL_STENCIL_TEST:
		return TRUE;
	}
	GenerateInvalidGLenumError(cap, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateBlendEquationEnum( ULONG value, const BSTR info )
{
	switch(value)
	{
	case GL_FUNC_ADD:
	case GL_FUNC_SUBTRACT:
	case GL_FUNC_REVERSE_SUBTRACT:
		return TRUE;
	}
	GenerateInvalidGLenumError(value, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateBlendFuncDstEnum( ULONG factor, const BSTR info )
{
	switch(factor)
	{
	case GL_ZERO:
	case GL_ONE:
	case GL_SRC_COLOR:
	case GL_ONE_MINUS_SRC_COLOR:
	case GL_DST_COLOR:
	case GL_ONE_MINUS_DST_COLOR:
	case GL_SRC_ALPHA:
	case GL_ONE_MINUS_SRC_ALPHA:
	case GL_DST_ALPHA:
	case GL_ONE_MINUS_DST_ALPHA:
	case GL_CONSTANT_COLOR:
	case GL_ONE_MINUS_CONSTANT_COLOR:
	case GL_CONSTANT_ALPHA:
	case GL_ONE_MINUS_CONSTANT_ALPHA:
		return TRUE;
	}
	GenerateInvalidGLenumError(factor, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateBlendFuncSrcEnum( ULONG factor, const BSTR info )
{
	if (factor == GL_SRC_ALPHA_SATURATE) {
		return TRUE;
	}
	return ValidateBlendFuncDstEnum(factor, info);
}

BOOL CWebGLRenderingContext::ValidateBlendFuncEnumsCompatibility( ULONG sfactor, ULONG dfactor, const BSTR info)
{
	BOOL sfactorIsConstantColor = sfactor == GL_CONSTANT_COLOR ||
		sfactor == GL_ONE_MINUS_CONSTANT_COLOR;
	BOOL sfactorIsConstantAlpha = sfactor == GL_CONSTANT_ALPHA ||
		sfactor == GL_ONE_MINUS_CONSTANT_ALPHA;
	BOOL dfactorIsConstantColor = dfactor == GL_CONSTANT_COLOR ||
		dfactor == GL_ONE_MINUS_CONSTANT_COLOR;
	BOOL dfactorIsConstantAlpha = dfactor == GL_CONSTANT_ALPHA ||
		dfactor == GL_ONE_MINUS_CONSTANT_ALPHA;

	if( (sfactorIsConstantColor && dfactorIsConstantAlpha) ||
	    (dfactorIsConstantColor && sfactorIsConstantAlpha) )
	{
		GenerateError(GL_INVALID_OPERATION, L"%s : are mutually incompatible, see section 6.8 in the WebGL 1.0 spec", info);
		return FALSE;
	}
	
	return TRUE;
}

BOOL CWebGLRenderingContext::ValidateDrawModeEnum( ULONG mode, const BSTR info )
{
	switch (mode)
	{
	case GL_TRIANGLES:
	case GL_TRIANGLE_STRIP:
	case GL_TRIANGLE_FAN:
	case GL_POINTS:
	case GL_LINE_STRIP:
	case GL_LINE_LOOP:
	case GL_LINES:
		return TRUE;
	}
	GenerateInvalidGLenumError(mode, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateFaceEnum( ULONG face, const BSTR info )
{
	switch (face)
	{
	case GL_FRONT:
	case GL_BACK:
	case GL_FRONT_AND_BACK:
		return TRUE;
	}
	GenerateInvalidGLenumError(face, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateComparisonEnum( ULONG target, const BSTR info )
{
	switch (target)
	{
	case GL_NEVER:
	case GL_LESS:
	case GL_LEQUAL:
	case GL_GREATER:
	case GL_GEQUAL:
	case GL_EQUAL:
	case GL_NOTEQUAL:
	case GL_ALWAYS:
		return TRUE;
	}
	GenerateInvalidGLenumError(target, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateCullMode( ULONG mode, const BSTR info )
{
	switch (mode)
	{
	case GL_CW:
	case GL_CCW:
		return TRUE;
	}
	GenerateInvalidGLenumError(mode, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateStencilOpEnum( ULONG action, const BSTR info )
{
	switch (action)
	{
	case GL_KEEP:
	case GL_ZERO:
	case GL_REPLACE:
	case GL_INCR:
	case GL_INCR_WRAP:
	case GL_DECR:
	case GL_DECR_WRAP:
	case GL_INVERT:
		return TRUE;
	}
	GenerateInvalidGLenumError(action, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateAttachmentEnum( ULONG attachment, const BSTR info )
{
	switch (attachment)
	{
	case GL_COLOR_ATTACHMENT0 :
	case GL_DEPTH_ATTACHMENT :
	case GL_STENCIL_ATTACHMENT :
	case GL_DEPTH_STENCIL_ATTACHMENT :
		return TRUE;
	}
	GenerateInvalidGLenumError(attachment, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateAttribIndex( ULONG index, const BSTR info )
{
	if (index >= attribBuffers_.GetCount())
	{
		if (index == GLuint(-1))
		{
			GenerateError(GL_INVALID_VALUE, L"%s: index -1 is invalid. That probably comes from a getAttribLocation() call, "
				L"where this return value -1 means that the passed name didn't correspond to an active attribute in "
				L"the specified program.", info);
		}
		else
		{
			GenerateError(GL_INVALID_VALUE, L"%s: index %d is out of range", info, index);
		}
		return FALSE;
	}
	return TRUE;
}

BOOL CWebGLRenderingContext::ValidateBuffers( const BSTR info, ULONG& maxElementCount )
{
	maxElementCount = -1;

	for (ULONG i = 0; i < attribBuffers_.GetCount(); ++i)
	{
		const WebGLVertexAttrib& attrib = attribBuffers_[i];
		if (!attrib.enabled || !currentProgram_->IsAttribInUse(i))
			continue;

		if (attrib.buffer == nullptr)
		{
			GenerateError(GL_INVALID_OPERATION, L"%s: no VBO bound to enabled vertex attrib index %d", info, i);
			return FALSE;
		}

		ULONG bufferSize = attrib.buffer->GetByteSize() - attrib.byteOffset;
		ULONG elementSize = GetComponentSize(attrib.type) * attrib.size;

		if (bufferSize < elementSize)
		{
			maxElementCount = 0;
			continue;
		}

		ULONG stride =  attrib.stride ? attrib.stride : elementSize;
		ULONG elementCount = ((bufferSize - elementSize) / stride) + 1;

		if (maxElementCount == -1 || maxElementCount > elementCount)
			maxElementCount = elementCount;
	}

	return TRUE;
}

BOOL CWebGLRenderingContext::ValidateBufferTarget( ULONG target, const BSTR info )
{
	switch (target)
	{
	case GL_ARRAY_BUFFER:
	case GL_ELEMENT_ARRAY_BUFFER:
		return TRUE;
	}
	GenerateInvalidGLenumError(target, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateBufferUsage( ULONG usage, const BSTR info )
{
	switch (usage)
	{
	case GL_STREAM_DRAW:
	case GL_STATIC_DRAW:
	case GL_DYNAMIC_DRAW:
		return TRUE;
	}
	GenerateInvalidGLenumError(usage, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateTextureFormat( ULONG format, const BSTR info )
{
	switch (format)
	{
	case GL_RGB:
	case GL_RGBA:
	case GL_ALPHA:
	case GL_LUMINANCE:
	case GL_LUMINANCE_ALPHA:
		return TRUE;
	}
	GenerateInvalidGLenumError(format, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateCompressedTextureFormat( ULONG format, const BSTR info )
{
	for (auto i = 0u; i < compressedTexFormats_.GetCount(); ++i)
	{
		if (compressedTexFormats_[i] == format)
			return TRUE;
	}

	GenerateInvalidGLenumError(format, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateTextureType( ULONG type, const BSTR info )
{
	if (validatorTextureType_.ValidateValue(type))
		return TRUE;

	GenerateInvalidGLenumError(type, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateRenderbufferFormat( ULONG format, const BSTR info )
{
	switch (format)
	{
	case GL_RGBA4:
	case GL_RGB5_A1:
	case GL_RGB565:
	case GL_DEPTH_STENCIL:
	case GL_DEPTH_COMPONENT16:
	case GL_STENCIL_INDEX:
	case GL_STENCIL_INDEX8:
		return TRUE;
	}
	GenerateInvalidGLenumError(format, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateTextureFormatAndType( ULONG format, ULONG type, const BSTR info )
{
	switch(type)
	{
	case GL_FLOAT:
	case GL_UNSIGNED_BYTE:
		return ValidateTextureFormat(format, info);
	case GL_UNSIGNED_SHORT_4_4_4_4:
	case GL_UNSIGNED_SHORT_5_5_5_1:
		if(format != GL_RGBA)
		{
			GenerateError(GL_INVALID_OPERATION, L"mutually incompatible format and type");
			return FALSE;
		}
		return TRUE;
	case GL_UNSIGNED_SHORT_5_6_5:
		if(format != GL_RGB)
		{
			GenerateError(GL_INVALID_OPERATION, L"mutually incompatible format and type");
			return FALSE;
		}
		return TRUE;
	default:
		GenerateInvalidGLenumError(type, info);
		return FALSE;
	}

	return TRUE;
}

BOOL CWebGLRenderingContext::ValidateTextureTarget( ULONG target, const BSTR info )
{
	switch (target)
	{
	case GL_TEXTURE_2D:
	case GL_TEXTURE_CUBE_MAP:
		return TRUE;
	}
	GenerateInvalidGLenumError(target, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateTextureOpTarget( ULONG target, const BSTR info )
{
	switch (target)
	{
	case GL_TEXTURE_2D:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_X:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_X:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_Y:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_Y:
	case GL_TEXTURE_CUBE_MAP_POSITIVE_Z:
	case GL_TEXTURE_CUBE_MAP_NEGATIVE_Z:
		return TRUE;
	}
	GenerateInvalidGLenumError(target, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateTextureParameter( ULONG pname, const BSTR info )
{
	switch (pname)
	{
	case GL_TEXTURE_MAX_ANISOTROPY_EXT:
		if (IsExtensionEnabled(L"ext_texture_filter_anisotropic"))
			return TRUE;
		break;
	case GL_TEXTURE_MIN_FILTER:
	case GL_TEXTURE_MAG_FILTER:
	case GL_TEXTURE_WRAP_S:
	case GL_TEXTURE_WRAP_T:
		return TRUE;
	}
	GenerateInvalidGLenumError(pname, info);
	return FALSE;
}

BOOL CWebGLRenderingContext::ValidateBoundFramebufferStatus( const BSTR info )
{
	if (FAILED(MakeCurrent()))
		return FALSE;

	ULONG status = 0;
	checkFramebufferStatus(GL_FRAMEBUFFER, &status);

	if(status != GL_FRAMEBUFFER_COMPLETE)
	{
		GenerateError(GL_INVALID_FRAMEBUFFER_OPERATION, L"%s : bound framebuffer has invalid status 0x%x", info, status);
		return FALSE;
	}

	if (boundFramebuffer_)
		boundFramebuffer_->MakeInitialClear();

	return TRUE;
}

HRESULT CWebGLRenderingContext::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}

BOOL CWebGLRenderingContext::ValidateAttribType( ULONG value, const BSTR info )
{
	switch (value)
	{
	case GL_BYTE:
	case GL_UNSIGNED_BYTE:
	case GL_SHORT:
	case GL_UNSIGNED_SHORT:
	case GL_FLOAT:
		return TRUE;
	}
	GenerateInvalidGLenumError(value, info);
	return FALSE;
}

ULONG CWebGLRenderingContext::GetPrimarySurfaceWidth() const
{
	return primaryFBO_.GetWidth();
}

ULONG CWebGLRenderingContext::GetPrimarySurfaceHeight() const
{
	return primaryFBO_.GetHeight();
}

IDirect3DSurface9* CWebGLRenderingContext::GetPrimarySurfaceD3DPtr()
{
	if(FAILED(MakeCurrent()))
		return NULL;

	return primaryFBO_.GetColorSurfaceD3DPtr();
}

//////////////////////////////////////////////////////////////////////////

HRESULT CreateWebGLRenderingContext( const VARIANT& attributes, IPluginObject* plugin,
	CComBSTR& errorMsg, WebGLRenderingContextPtr& retVal )
{
	WebGLRenderingContextType * ctxtPtr = nullptr;
	V_RET(WebGLRenderingContextType::CreateInstance(&ctxtPtr));
	WebGLRenderingContextPtr ctxt(ctxtPtr);

	HRESULT hr = ctxt->Init(attributes, plugin, errorMsg);
	if(FAILED(hr))
	{
		ctxt->Uninit();
		return hr;
	}

	retVal = ctxt;
	return S_OK;
}

template <typename T> BOOL CheckArrayBufferType(IArrayBufferViewPtr arrView)
{
	CComQIPtr<T> checker(arrView);
	return checker ? TRUE : FALSE;
}

BOOL ValidateTextureArrayBufferType(IArrayBufferViewPtr arrView, ULONG type)
{
	switch (type)
	{
	case GL_FLOAT:
		return CheckArrayBufferType<IFloat32Array>(arrView);
	case GL_UNSIGNED_BYTE:
		return CheckArrayBufferType<IUint8Array>(arrView);
	case GL_UNSIGNED_SHORT_5_6_5:
	case GL_UNSIGNED_SHORT_4_4_4_4:
	case GL_UNSIGNED_SHORT_5_5_5_1:
		return CheckArrayBufferType<IUint16Array>(arrView);
	}
	return FALSE;
}

inline void FormatCComBSTR(CComBSTR& out, const BSTR fmt, ...)
{
	va_list va;
	va_start(va, fmt);
	CAtlString str;
	str.FormatV(fmt, va);
	out = str.GetBuffer();
	va_end(va);
}

template <typename ElementType>
CComPtr<IDispatch> BuildScriptArray( IPluginObject* plugin, ULONG count, const ElementType* elements )
{
	assert(plugin);

	ScriptArray<ElementType> scriptArr;
	CComPtr<IDispatchEx> ctx;
	if(FAILED(plugin->GetScriptContext(ctx)))
		return CComPtr<IDispatch>();

	if(FAILED(scriptArr.Init(ctx)))
		return CComPtr<IDispatch>();

	for(ULONG i = 0; i < count; ++i)
	{
		scriptArr.Append((ElementType)elements[i]);
	}

	CComPtr<IDispatch> arr;
	if(FAILED(scriptArr.GetScriptArray(arr)))
		return CComPtr<IDispatch>();

	return arr;
}

void FixCopyRect( LONG fboWidth, LONG fboHeight, LONG& xoffset, LONG& yoffset,
	LONG& x, LONG& y, LONG& width, LONG& height )
{
	LONG actualX = Min<LONG>(fboWidth, Max<LONG>(0, x));
	LONG actualXPlusWidth = Min<LONG>(fboWidth, Max<LONG>(0, x + width));
	LONG actualWidth = actualXPlusWidth  - actualX;
	LONG actualXoffset = xoffset + actualX - x;

	LONG actualY = Min<LONG>(fboHeight, Max<LONG>(0, y));
	LONG actualYPlusHeight = Min<LONG>(fboHeight, Max<LONG>(0, y + height));
	LONG actualHeight = actualYPlusHeight - actualY;
	LONG actualYoffset = yoffset + actualY - y;

	x = actualX;
	y = actualY;
	width = actualWidth;
	height = actualHeight;
	xoffset = actualXoffset;
	yoffset = actualYoffset;
}

void EnumValidator::AddValue( ULONG value )
{
	values_.Add(value);
}

BOOL EnumValidator::ValidateValue( ULONG value )
{
	for (size_t i = 0; i < values_.GetCount(); ++i)
	{
		if (values_[i] == value)
			return TRUE;
	}
	return FALSE;
}

#pragma once

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "../JSObjectImpl.h"

using namespace ATL;

class CWebGLRenderingContext;
class CWebGLOESTextureFloat;
class CWebGLOESStandardDerivatives;
class CWebGLCompressedTextureS3TC;
class CEXTTextureFilterAnisotropic;

class WebGLExtensionBase
{
protected:
	ATL::CAutoPtr<JSObjectImpl> dispEx_;
	HRESULT Init(CComTypeInfoHolder& tih, IDispatch* external, LONG length);
public:
	WebGLExtensionBase() {}
	~WebGLExtensionBase() {}
};

//////////////////////////////////////////////////////////////////////////
// OES_texture_float extension object
//////////////////////////////////////////////////////////////////////////

typedef CComObject<CWebGLOESTextureFloat> WebGLOESTextureFloatType;

class ATL_NO_VTABLE CWebGLOESTextureFloat :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IOESTextureFloat, &IID_IOESTextureFloat, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLExtensionBase
{
public:
	friend HRESULT CreateOESTextureFloatEXT(CComPtr<IDispatch>& obj);

	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLOESTextureFloat)
	COM_INTERFACE_ENTRY(IOESTextureFloat)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()
};

HRESULT CreateOESTextureFloatEXT(CComPtr<IDispatch>& obj);


//////////////////////////////////////////////////////////////////////////
// OES_standard_derivatives extension object
//////////////////////////////////////////////////////////////////////////


typedef CComObject<CWebGLOESStandardDerivatives> CWebGLOESStandardDerivativesType;

class ATL_NO_VTABLE CWebGLOESStandardDerivatives :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IOESStandardDerivatives, &IID_IOESStandardDerivatives, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLExtensionBase
{
public:
	friend HRESULT CreateOESStandardDerivativesEXT(CComPtr<IDispatch>& obj);

	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLOESStandardDerivatives)
	COM_INTERFACE_ENTRY(IOESStandardDerivatives)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

public:
	STDMETHOD(get_FRAGMENT_SHADER_DERIVATIVE_HINT_OES)(ULONG * retVal);
};

HRESULT CreateOESStandardDerivativesEXT(CComPtr<IDispatch>& obj);

//////////////////////////////////////////////////////////////////////////
// WEBGL_compressed_texture_s3tc extension object
//////////////////////////////////////////////////////////////////////////

typedef CComObject<CWebGLCompressedTextureS3TC> CWebGLCompressedTextureS3TCType;

class ATL_NO_VTABLE CWebGLCompressedTextureS3TC :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLCompressedTextureS3TC, &IID_IWebGLCompressedTextureS3TC, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLExtensionBase
{
public:
	/* Compressed Texture Formats */
	STDMETHOD(get_COMPRESSED_RGB_S3TC_DXT1_EXT)(ULONG* retVal);
	STDMETHOD(get_COMPRESSED_RGBA_S3TC_DXT1_EXT)(ULONG* retVal);
	STDMETHOD(get_COMPRESSED_RGBA_S3TC_DXT3_EXT)(ULONG* retVal);
	STDMETHOD(get_COMPRESSED_RGBA_S3TC_DXT5_EXT)(ULONG* retVal);

	friend HRESULT CreateWebGLCompressedTextureS3TCEXT(CComPtr<IDispatch>& obj);

	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLCompressedTextureS3TC)
	COM_INTERFACE_ENTRY(IWebGLCompressedTextureS3TC)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()
};

HRESULT CreateWebGLCompressedTextureS3TCEXT(CComPtr<IDispatch>& obj);

//////////////////////////////////////////////////////////////////////////
// EXT_texture_filter_anisotropic extension object
//////////////////////////////////////////////////////////////////////////

typedef CComObject<CEXTTextureFilterAnisotropic> CEXTTextureFilterAnisotropicType;

class ATL_NO_VTABLE CEXTTextureFilterAnisotropic :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IEXTTextureFilterAnisotropic, &IID_IEXTTextureFilterAnisotropic, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLExtensionBase
{
public:
	/* Compressed Texture Formats */
	STDMETHOD(get_TEXTURE_MAX_ANISOTROPY_EXT)(ULONG* retVal);
	STDMETHOD(get_MAX_TEXTURE_MAX_ANISOTROPY_EXT)(ULONG* retVal);

	friend HRESULT CreateEXTTextureFilterAnisotropic(CComPtr<IDispatch>& obj);

	STDMETHOD(toString)(BSTR* retVal);

	BEGIN_COM_MAP(CEXTTextureFilterAnisotropic)
		COM_INTERFACE_ENTRY(IEXTTextureFilterAnisotropic)
		COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
		COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
	END_COM_MAP()
};

HRESULT CreateEXTTextureFilterAnisotropic(CComPtr<IDispatch>& obj);

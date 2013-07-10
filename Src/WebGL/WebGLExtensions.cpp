#include "stdafx.h"
#include "WebGLExtensions.h"

#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>

HRESULT WebGLExtensionBase::Init(CComTypeInfoHolder& tih, IDispatch* external, LONG length)
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(tih, external, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}

STDMETHODIMP CWebGLOESTextureFloat::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLOESTextureFloat]");
	return S_OK;
}

STDMETHODIMP CWebGLOESStandardDerivatives::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLOESStandardDerivatives]");
	return S_OK;
}

STDMETHODIMP CWebGLOESStandardDerivatives::get_FRAGMENT_SHADER_DERIVATIVE_HINT_OES( ULONG * retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = GL_FRAGMENT_SHADER_DERIVATIVE_HINT_OES;
	return S_OK;
}

STDMETHODIMP CWebGLCompressedTextureS3TC::get_COMPRESSED_RGB_S3TC_DXT1_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x83F0;
	return S_OK;
}

STDMETHODIMP CWebGLCompressedTextureS3TC::get_COMPRESSED_RGBA_S3TC_DXT1_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x83F1;
	return S_OK;
}

STDMETHODIMP CWebGLCompressedTextureS3TC::get_COMPRESSED_RGBA_S3TC_DXT3_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x83F2;
	return S_OK;
}

STDMETHODIMP CWebGLCompressedTextureS3TC::get_COMPRESSED_RGBA_S3TC_DXT5_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x83F3;
	return S_OK;
}

STDMETHODIMP CWebGLCompressedTextureS3TC::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLCompressedTextureS3TC]");
	return S_OK;
}

STDMETHODIMP CEXTTextureFilterAnisotropic::get_TEXTURE_MAX_ANISOTROPY_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x84FE;
	return S_OK;
}

STDMETHODIMP CEXTTextureFilterAnisotropic::get_MAX_TEXTURE_MAX_ANISOTROPY_EXT(ULONG* retVal)
{
	if (!retVal) return E_INVALIDARG;
	*retVal = 0x84FF;
	return S_OK;
}

STDMETHODIMP CEXTTextureFilterAnisotropic::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object EXTTextureFilterAnisotropic]");
	return S_OK;
}

HRESULT CreateOESTextureFloatEXT(CComPtr<IDispatch>& obj)
{
	WebGLOESTextureFloatType* impl = nullptr;
	V_RET(WebGLOESTextureFloatType::CreateInstance(&impl));
	obj = impl;
	V_RET(impl->Init(impl->_tih, impl, 0));
	return S_OK;
}

HRESULT CreateOESStandardDerivativesEXT(CComPtr<IDispatch>& obj)
{
	CWebGLOESStandardDerivativesType* impl = nullptr;
	V_RET(CWebGLOESStandardDerivativesType::CreateInstance(&impl));
	obj = impl;
	V_RET(impl->Init(impl->_tih, impl, 0));
	return S_OK;
}

HRESULT CreateWebGLCompressedTextureS3TCEXT(CComPtr<IDispatch>& obj)
{
	CWebGLCompressedTextureS3TCType* impl = nullptr;
	V_RET(CWebGLCompressedTextureS3TCType::CreateInstance(&impl));
	obj = impl;
	V_RET(impl->Init(impl->_tih, impl, 0));
	return S_OK;
}

HRESULT CreateEXTTextureFilterAnisotropic(CComPtr<IDispatch>& obj)
{
	CEXTTextureFilterAnisotropicType* impl = nullptr;
	V_RET(CEXTTextureFilterAnisotropicType::CreateInstance(&impl));
	obj = impl;
	V_RET(impl->Init(impl->_tih, impl, 0));
	return S_OK;
}
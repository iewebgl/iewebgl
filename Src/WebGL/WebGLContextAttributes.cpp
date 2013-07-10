// WebGLContextAttributes.cpp : Implementation of CWebGLContextAttributes

#include "stdafx.h"
#include "WebGLContextAttributes.h"


// CWebGLContextAttributes

CWebGLContextAttributes::CWebGLContextAttributes() :
alpha_(TRUE),
depth_(TRUE),
stencil_(FALSE),
antialias_(TRUE),
premultipliedAlpha_(TRUE),
preserveDrawingBuffer_(FALSE)
{

}

HRESULT CWebGLContextAttributes::Init( BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, BOOL premultipliedAlpha, BOOL preserveDrawingBuffer )
{
	alpha_ = alpha;
	depth_ = depth;
	stencil_ = stencil;
	antialias_ = antialias;
	premultipliedAlpha_ = premultipliedAlpha;
	preserveDrawingBuffer_ = preserveDrawingBuffer;

	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLContextAttributes]");
	return S_OK;
}


STDMETHODIMP CWebGLContextAttributes::get_alpha(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(alpha_ ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::get_depth(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(depth_ ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::get_stencil(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(stencil_ ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::get_antialias(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(antialias_ ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::get_premultipliedAlpha(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(premultipliedAlpha_ ? true : false).Detach(retVal));
	return S_OK;
}

STDMETHODIMP CWebGLContextAttributes::get_preserveDrawingBuffer(VARIANT* retVal)
{
	if (!retVal) return E_INVALIDARG;
	V_RET(CComVariant(preserveDrawingBuffer_ ? true : false).Detach(retVal));
	return S_OK;
}

HRESULT CreateWebGLContextAttributes( BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, BOOL premultipliedAlpha, BOOL preserveDrawingBuffer, WebGLContextAttributesPtr& retVal )
{
	WebGLContextAttributesType * a;
	WebGLContextAttributesType::CreateInstance(&a);
	WebGLContextAttributesPtr attr(a);

	V_RET(attr->Init(alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer));
	retVal = attr;
	return S_OK;
}

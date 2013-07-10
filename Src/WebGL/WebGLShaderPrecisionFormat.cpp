// WebGLShaderPrecisionFormat.cpp : Implementation of CWebGLShaderPrecisionFormat

#include "stdafx.h"
#include "WebGLShaderPrecisionFormat.h"
#include "WebGLRenderingContext.h"

#include "../JSObjectImpl.h"

// CWebGLShaderPrecisionFormat

CWebGLShaderPrecisionFormat::CWebGLShaderPrecisionFormat() :
rangeMin_(0),
rangeMax_(0),
precision_(0)
{
	
}

CWebGLShaderPrecisionFormat::~CWebGLShaderPrecisionFormat()
{

}

HRESULT CWebGLShaderPrecisionFormat::Init( LONG rangeMin, LONG rangeMax, LONG precision )
{
	rangeMin_ = rangeMin;
	rangeMax_ = rangeMax;
	precision_ = precision;

	V_RET(InitDispEx());
	return S_OK;
}

HRESULT CWebGLShaderPrecisionFormat::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}

STDMETHODIMP CWebGLShaderPrecisionFormat::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLShaderPrecisionFormat]");
	return S_OK;
}

STDMETHODIMP CWebGLShaderPrecisionFormat::get_rangeMin( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = rangeMin_;
	return S_OK;
}

STDMETHODIMP CWebGLShaderPrecisionFormat::get_rangeMax( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = rangeMax_;
	return S_OK;
}

STDMETHODIMP CWebGLShaderPrecisionFormat::get_precision( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = precision_;
	return S_OK;
}

HRESULT CreateWebGLShaderPrecisionFormat( CWebGLRenderingContext* ctx, LONG rangeMin, LONG rangeMax, LONG precision, WebGLShaderPrecisionFormatPtr& retVal )
{
	WebGLShaderPrecisionFormatType * impl = nullptr;
	V_RET(WebGLShaderPrecisionFormatType::CreateInstance(&impl));
	WebGLShaderPrecisionFormatPtr format(impl);

	V_RET(format->Init(rangeMin, rangeMax, precision));

	retVal = format;
	return S_OK;
}
// WebGLActiveInfo.cpp : Implementation of CWebGLActiveInfo

#include "stdafx.h"
#include "WebGLActiveInfo.h"
#include "WebGLRenderingContext.h"

#include "../JSObjectImpl.h"

// CWebGLActiveInfo

CWebGLActiveInfo::CWebGLActiveInfo() :
size_(0),
type_(0),
deleted_(FALSE)
{
	
}

CWebGLActiveInfo::~CWebGLActiveInfo()
{

}

HRESULT CWebGLActiveInfo::Init( LONG size, ULONG type, const char * name, ULONG len )
{
	size_ = size;
	type_ = type;
	name_.Append(name, len);

	V_RET(InitDispEx());
	return S_OK;
}

void CWebGLActiveInfo::Delete()
{
	if (deleted_)
		return;
	deleted_ = TRUE;
}

HRESULT CWebGLActiveInfo::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}

STDMETHODIMP CWebGLActiveInfo::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLActiveInfo]");
	return S_OK;
}

STDMETHODIMP CWebGLActiveInfo::get_size( LONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = size_;
	return S_OK;
}

STDMETHODIMP CWebGLActiveInfo::get_type( ULONG * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = type_;
	return S_OK;
}

STDMETHODIMP CWebGLActiveInfo::get_name( BSTR * retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = _bstr_t(name_.GetBuffer()).Detach();
	return S_OK;
}

HRESULT CreateWebGLActiveInfo( CWebGLRenderingContext* ctx, LONG size, ULONG type, const char * name, ULONG len, WebGLActiveInfoPtr& retVal )
{
	WebGLActiveInfoType * impl = nullptr;
	V_RET(WebGLActiveInfoType::CreateInstance(&impl));
	WebGLActiveInfoPtr activeInfo(impl);

	V_RET(activeInfo->Init(size, type, name, len));

	retVal = activeInfo;
	return S_OK;
}
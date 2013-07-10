// WebGLUniformLocation.cpp : Implementation of CWebGLUniformLocation

#include "stdafx.h"
#include "WebGLUniformLocation.h"
#include "WebGLProgram.h"
#include "WebGLRenderingContext.h"
// CWebGLUniformLocation


CWebGLUniformLocation::CWebGLUniformLocation() :
WebGLObjectBase(this),
programGeneration_(0),
loc_(-1),
program_(nullptr)
{

}

CWebGLUniformLocation::~CWebGLUniformLocation()
{

}

STDMETHODIMP CWebGLUniformLocation::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLUniformLocation]");
	return S_OK;
}

HRESULT CWebGLUniformLocation::Init( CWebGLRenderingContext* ctx, CWebGLProgram* program, LONG loc )
{
	program_ = program;
	if (!program_)
		return E_INVALIDARG;
	programGeneration_ = program_->Generation();
	loc_ = loc;
	return WebGLObjectBase::Init(ctx, _tih, this, 0);
}

HRESULT CreateWebGLUniformLocation( CWebGLRenderingContext* ctx, CWebGLProgram* program, LONG loc, WebGLUniformLocationPtr& retVal )
{
	WebGLUniformLocationType * impl = nullptr;
	V_RET(WebGLUniformLocationType::CreateInstance(&impl));
	WebGLUniformLocationPtr location(impl);

	V_RET(location->Init(ctx, program, loc));

	retVal = location;
	return S_OK;
}


#include "stdafx.h"
#include "WebGLObjectPointer.h"
#include "WebGLRenderingContext.h"

#include "../JSObjectImpl.h"


WebGLObjectBase::WebGLObjectBase(IUnknown * self) :
ctx_(nullptr),
name_(0),
ctxGeneration_(0),
deleted_(FALSE),
self_(self)
{
	assert(self_);
}

WebGLObjectBase::~WebGLObjectBase()
{

}

HRESULT WebGLObjectBase::Init( CWebGLRenderingContext* ctx, CComTypeInfoHolder& tih, IDispatch* external, ULONG name )
{
	V_RET(InitDispEx(tih, external));

	ctx_ = ctx;
	ctxGeneration_ = ctx_->GetGeneration();
	assert(ctxGeneration_ != 0);
	name_ = name;
	deleted_ = FALSE;
	return S_OK;
}

void WebGLObjectBase::MarkAsDeleted()
{
	deleted_ = TRUE;
}

void WebGLObjectBase::Delete()
{
	MarkAsDeleted();

	CComPtr<IUnknown> guard(self_); // prevent self delete inside ZeroOwners
	ZeroOwners();
}

BOOL WebGLObjectBase::IsCompatible( CWebGLRenderingContext* ctx )
{
	return ctx == ctx_ && ctx_ != nullptr && ctxGeneration_ == ctx->GetGeneration();
}

BOOL WebGLObjectBase::IsDeleted()
{
	return deleted_;
}

HRESULT WebGLObjectBase::InitDispEx(CComTypeInfoHolder& tih, IDispatch* external)
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(tih, external, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}


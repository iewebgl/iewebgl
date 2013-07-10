// WebGLRenderbuffer.cpp : Implementation of CWebGLRenderbuffer

#include "stdafx.h"
#include "WebGLRenderbuffer.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"


CWebGLRenderbuffer::CWebGLRenderbuffer() :
WebGLObjectBase(this),
cleared_(FALSE),
hasEverBeenBound_(FALSE),
internalFormat_(0),
width_(0),
height_(0)
{
}

CWebGLRenderbuffer::~CWebGLRenderbuffer()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteRenderbuffer(this);
	}
}

STDMETHODIMP CWebGLRenderbuffer::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLRenderbuffer]");
	return S_OK;
}

inline ULONG AdaptWebGLInternalFormat( ULONG internalFormat )
{
	switch (internalFormat)
	{
		case GL_DEPTH_STENCIL : return GL_DEPTH24_STENCIL8;
	}
	return internalFormat;
}

void CWebGLRenderbuffer::Storage( ULONG width, ULONG height, ULONG internalFormat )
{
	internalFormat_= internalFormat;
	width_ = width;
	height_ = height;

	glRenderbufferStorage(GL_RENDERBUFFER, AdaptWebGLInternalFormat(internalFormat_), width_, height_);
	cleared_ = FALSE;
}

void CWebGLRenderbuffer::Bind()
{
	hasEverBeenBound_ = TRUE;
}

HRESULT CreateWebGLRenderbuffer( CWebGLRenderingContext* ctx, ULONG name, WebGLRenderbufferPtr& retVal )
{
	WebGLRenderbufferType* impl = nullptr;
	V_RET(WebGLRenderbufferType::CreateInstance(&impl));
	WebGLRenderbufferPtr holder(impl);

	V_RET(impl->Init(ctx, impl->_tih, impl, name));

	retVal = holder;
	return S_OK;
}

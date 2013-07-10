// WebGLFramebuffer.cpp : Implementation of CWebGLFramebuffer

#include "stdafx.h"
#include "WebGLFramebuffer.h"
#include "WebGLRenderingContext.h"


CWebGLFramebuffer::CWebGLFramebuffer() :
WebGLObjectBase(this),
hasEverBeenBound_(FALSE)
{
}

CWebGLFramebuffer::~CWebGLFramebuffer()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteFramebuffer(this);
	}
}

STDMETHODIMP CWebGLFramebuffer::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLFramebuffer]");
	return S_OK;
}

void CWebGLFramebuffer::AttachRenderbuffer( ULONG attachment, WebGLRenderbufferType* renderbuffer )
{
	WebGLFramebufferAttachmentPtr ptr = nullptr;
	if (renderbuffer && SUCCEEDED(CreateWebGLRenderbufferAttachment(GetContext(), attachment, renderbuffer, ptr)))
		attachments_[attachment] = ptr;
	else
		attachments_.RemoveKey(attachment);

	ULONG glName = renderbuffer ? renderbuffer->GetGLName() : 0;
	if(attachment == GL_DEPTH_STENCIL_ATTACHMENT)
	{
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, glName);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, glName);
	}
	else
	{
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, attachment, GL_RENDERBUFFER, glName);
	}
}

void CWebGLFramebuffer::AttachTexture( ULONG attachment, WebGLTextureType* texture, ULONG texTarget, LONG level )
{
	WebGLFramebufferAttachmentPtr ptr = nullptr;
	if (texture && SUCCEEDED(CreateWebGLTextureAttachment(GetContext(), attachment, texture, texTarget, level, ptr)))
		attachments_[attachment] = ptr;
	else
		attachments_.RemoveKey(attachment);

	ULONG glName = texture ? texture->GetGLName() : 0;
	if(attachment == GL_DEPTH_STENCIL_ATTACHMENT)
	{
		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, texTarget, glName, level);
		glFramebufferTexture2D(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, texTarget, glName, level);
	}
	else
	{
		glFramebufferTexture2D(GL_FRAMEBUFFER, attachment, texTarget, glName, level);
	}
}

WebGLFramebufferAttachmentPtr CWebGLFramebuffer::GetAttachment( UINT attachment ) const
{
	WebGLFramebufferAttachmentPtr ptr;
	if(attachments_.Lookup(attachment, ptr))
		return ptr;

	return NULL;
}

inline BOOL IsDepthOrStencilAttachment( ULONG attachment )
{
	switch(attachment)
	{
	case GL_DEPTH_ATTACHMENT :
	case GL_STENCIL_ATTACHMENT :
	case GL_DEPTH_STENCIL_ATTACHMENT :
		return TRUE;
	}
	return FALSE;
}

void CWebGLFramebuffer::Bind()
{
	hasEverBeenBound_ = TRUE;
}

void CWebGLFramebuffer::MakeInitialClear()
{
	POSITION pos = attachments_.GetStartPosition();
	while(pos != NULL)
	{
		attachments_.GetNextValue(pos)->MakeInitialClear();
	}
}

ULONG CWebGLFramebuffer::CheckStatus() const
{
	if(IsMissing())
		return GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT;

	ULONG noColorAttacments = 0;
	ULONG width = 0, height = 0;

	POSITION pos = attachments_.GetStartPosition();
	while(pos != NULL)
	{
		if(IsDepthOrStencilAttachment(attachments_.GetKeyAt(pos)))
			++noColorAttacments;

		WebGLFramebufferAttachmentPtr attachment = attachments_.GetNextValue(pos);

		if(!attachment->IsComplite())
			return GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT;

		if( (width && width != attachment->GetWidth()) ||
			(height && height != attachment->GetHeight()) )
			return GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS;

		width = attachment->GetWidth();
		height = attachment->GetHeight();
	}

	if(noColorAttacments > 1)
		return GL_FRAMEBUFFER_UNSUPPORTED;

	return GL_FRAMEBUFFER_COMPLETE;
}

BOOL CWebGLFramebuffer::IsMissing() const
{
	BOOL isMissing = TRUE;
	POSITION pos = attachments_.GetStartPosition();
	while(pos != NULL)
	{
		if(attachments_.GetNextValue(pos)->IsDefined())
		{
			isMissing = FALSE;
			break;
		}
	}
	return isMissing;
}

HRESULT CreateWebGLFramebuffer( CWebGLRenderingContext* ctx, ULONG name, WebGLFramebufferPtr& retVal )
{
	WebGLFramebufferType* impl = nullptr;
	V_RET(WebGLFramebufferType::CreateInstance(&impl));
	WebGLFramebufferPtr holder(impl);

	V_RET(impl->Init(ctx, impl->_tih, impl, name));

	retVal = holder;
	return S_OK;
}
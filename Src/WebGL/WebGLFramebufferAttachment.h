#pragma once
#include "WebGLRenderbuffer.h"
#include "WebGLTexture.h"

class IWebGLFramebufferAttachment : public IUnknown
{
public:
	virtual ~IWebGLFramebufferAttachment() = 0 {}

	virtual BOOL IsDefined() const = 0;
	virtual BOOL IsComplite() const = 0;
	virtual void MakeInitialClear() = 0;

	virtual ULONG GetWidth() const = 0;
	virtual ULONG GetHeight() const = 0;
	virtual ULONG GetInternalFormat() const = 0;

	virtual BOOL GetParameter(ULONG pname, CComVariant& param) const = 0;
};

typedef CComPtr<IWebGLFramebufferAttachment> WebGLFramebufferAttachmentPtr;

HRESULT CreateWebGLRenderbufferAttachment(CWebGLRenderingContext* ctx,
	ULONG attachment, WebGLRenderbufferType* renderbuffer, WebGLFramebufferAttachmentPtr& retVal);

HRESULT CreateWebGLTextureAttachment(CWebGLRenderingContext* ctx, ULONG attachment,
	WebGLTextureType* texture, ULONG target, LONG level, WebGLFramebufferAttachmentPtr& retVal);

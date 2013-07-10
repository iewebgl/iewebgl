#include "stdafx.h"
#include "WebGLFramebufferAttachment.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"

inline BOOL CheckInternalFormatCompatible(ULONG attachment, ULONG internalFormat)
{
	switch(attachment)
	{
	case GL_COLOR_ATTACHMENT0 :
		return
			internalFormat == GL_ALPHA ||
			internalFormat == GL_LUMINANCE ||
			internalFormat == GL_LUMINANCE_ALPHA ||
			internalFormat == GL_RGB565 ||
			internalFormat == GL_RGB ||
			internalFormat == GL_RGBA4 ||
			internalFormat == GL_RGB5_A1 ||
			internalFormat == GL_RGBA;
	case GL_DEPTH_ATTACHMENT :
		return internalFormat == GL_DEPTH_COMPONENT16;
	case GL_STENCIL_ATTACHMENT :
		return internalFormat == GL_STENCIL_INDEX8;
	case GL_DEPTH_STENCIL_ATTACHMENT :
		return internalFormat == GL_DEPTH_STENCIL;
	}
	return TRUE;
}


//////////////////////////////////////////////////////////////////////////
// CWebGLRenderbufferAttachment
//////////////////////////////////////////////////////////////////////////

class CWebGLRenderbufferAttachment :
	public IWebGLFramebufferAttachment,
	public CComObjectRootEx<CComSingleThreadModel>
{
	CWebGLRenderingContext* ctx_;
	ULONG attachment_;
	WebGLRenderbufferPtr renderbuffer_;

	HRESULT Init(CWebGLRenderingContext* ctx, ULONG attachment,
		WebGLRenderbufferType* renderbuffer);
	friend HRESULT CreateWebGLRenderbufferAttachment(CWebGLRenderingContext* ctx,
		ULONG attachment, WebGLRenderbufferType* renderbuffer, WebGLFramebufferAttachmentPtr& retVal);

public:
	CWebGLRenderbufferAttachment();
	virtual ~CWebGLRenderbufferAttachment();

	BEGIN_COM_MAP(CWebGLRenderbufferAttachment)
	END_COM_MAP()

	virtual BOOL IsDefined() const;
	virtual BOOL IsComplite() const;
	virtual void MakeInitialClear();

	virtual ULONG GetWidth() const { return renderbuffer_->GetWidth(); }
	virtual ULONG GetHeight() const { return renderbuffer_->GetHeight(); }
	virtual ULONG GetInternalFormat() const { return renderbuffer_->GetInternalFormat(); }
	virtual BOOL GetParameter(ULONG pname, CComVariant& retVal) const;
};

typedef CComObject<CWebGLRenderbufferAttachment> WebGLRenderbufferAttachmentType;

HRESULT CreateWebGLRenderbufferAttachment( CWebGLRenderingContext* ctx,
	ULONG attachment, WebGLRenderbufferType* renderbuffer, WebGLFramebufferAttachmentPtr& retVal )
{
	WebGLRenderbufferAttachmentType* impl = nullptr;
	V_RET(WebGLRenderbufferAttachmentType::CreateInstance(&impl));
	WebGLFramebufferAttachmentPtr ptr(impl);
	V_RET(impl->Init(ctx, attachment, renderbuffer));

	retVal = ptr;
	return S_OK;
}

//////////////////////////////////////////////////////////////////////////

CWebGLRenderbufferAttachment::CWebGLRenderbufferAttachment() :
ctx_(nullptr),
attachment_(0),
renderbuffer_(nullptr)
{
	
}

CWebGLRenderbufferAttachment::~CWebGLRenderbufferAttachment()
{
	
}

HRESULT CWebGLRenderbufferAttachment::Init( CWebGLRenderingContext* ctx,
	ULONG attachment, WebGLRenderbufferType* renderbuffer )
{
	assert(renderbuffer != NULL && "framebuffer->AttachRenderbuffer() managed zero-renderbuffer behaviour");

	ctx_ = ctx;
	attachment_ = attachment;
	renderbuffer_ = renderbuffer;

	return S_OK;
}

BOOL CWebGLRenderbufferAttachment::IsDefined() const
{
	return renderbuffer_ != NULL && !renderbuffer_->IsDeleted();
}

BOOL CWebGLRenderbufferAttachment::IsComplite() const
{
	if(!IsDefined())
		return FALSE;

	if(renderbuffer_->GetWidth() == 0 || renderbuffer_->GetHeight() == 0)
		return FALSE;

	if(!CheckInternalFormatCompatible(attachment_, renderbuffer_->GetInternalFormat()))
		return FALSE;

	return TRUE;
}

void CWebGLRenderbufferAttachment::MakeInitialClear()
{
	if(renderbuffer_->IsCleared())
		return;

	if(glCheckFramebufferStatus(GL_FRAMEBUFFER) != GL_FRAMEBUFFER_COMPLETE)
		return;

	ULONG viewport[] = { 0, 0, GetWidth(), GetHeight() };
	BOOL clearColor = FALSE, clearDepth = FALSE, clearStencil = FALSE;

	switch(attachment_)
	{
	case GL_COLOR_ATTACHMENT0 : clearColor = TRUE; break;
	case GL_DEPTH_ATTACHMENT : clearDepth = TRUE; break;
	case GL_STENCIL_ATTACHMENT : clearStencil = TRUE; break;
	case GL_DEPTH_STENCIL_ATTACHMENT : clearDepth = TRUE; clearStencil = TRUE; break;
	// default case is no need because glCheckFramebufferStatus prevent any errors
	}

	MakeClear(viewport, clearColor, clearDepth, clearStencil);
	renderbuffer_->SetCleared();
}

BOOL CWebGLRenderbufferAttachment::GetParameter( ULONG pname, CComVariant& retVal ) const
{
	switch(pname)
	{
	case GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
		retVal = CComVariant(GL_RENDERBUFFER); break;
	case GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
		retVal = CComVariant(renderbuffer_); break;
	default:
		return FALSE;
	}
	return TRUE;
}



//////////////////////////////////////////////////////////////////////////
// CWebGLTextureAttachment
//////////////////////////////////////////////////////////////////////////

class CWebGLTextureAttachment :
	public IWebGLFramebufferAttachment,
	public CComObjectRootEx<CComSingleThreadModel>
{
	CWebGLRenderingContext* ctx_;
	ULONG attachment_;
	WebGLTexturePtr texture_;
	ULONG textureTarget_;
	LONG textureLevel_;
	ULONG textureCubeMapFace_;

	HRESULT Init(CWebGLRenderingContext* ctx, ULONG attachment,
		WebGLTextureType* texture, ULONG target, LONG level);
	friend HRESULT CreateWebGLTextureAttachment(CWebGLRenderingContext* ctx, ULONG attachment,
		WebGLTextureType* texture, ULONG target, LONG level, WebGLFramebufferAttachmentPtr& retVal);

public:
	CWebGLTextureAttachment();
	virtual ~CWebGLTextureAttachment();

	BEGIN_COM_MAP(CWebGLTextureAttachment)
	END_COM_MAP()

	virtual BOOL IsDefined() const;
	virtual BOOL IsComplite() const;
	virtual void MakeInitialClear() { /*Textures are cleared on creation.*/}

	virtual ULONG GetWidth() const { return texture_->GetWidth(); }
	virtual ULONG GetHeight() const { return texture_->GetHeight(); }
	virtual ULONG GetInternalFormat() const { return texture_->GetInternalFormat(); }
	virtual BOOL GetParameter(ULONG pname, CComVariant& retVal) const;
};

typedef CComObject<CWebGLTextureAttachment> WebGLTextureAttachmentType;

HRESULT CreateWebGLTextureAttachment( CWebGLRenderingContext* ctx, ULONG attachment,
	WebGLTextureType* texture, ULONG target, LONG level, WebGLFramebufferAttachmentPtr& retVal )
{
	WebGLTextureAttachmentType* impl = nullptr;
	V_RET(WebGLTextureAttachmentType::CreateInstance(&impl));
	WebGLFramebufferAttachmentPtr ptr(impl);

	V_RET(impl->Init(ctx, attachment, texture, target, level));

	retVal = ptr;
	return S_OK;
}

//////////////////////////////////////////////////////////////////////////

CWebGLTextureAttachment::CWebGLTextureAttachment(  ) :
ctx_(nullptr),
attachment_(0),
texture_(nullptr),
textureTarget_(0),
textureLevel_(0),
textureCubeMapFace_(0)
{

}

CWebGLTextureAttachment::~CWebGLTextureAttachment()
{

}


HRESULT CWebGLTextureAttachment::Init( CWebGLRenderingContext* ctx,
	ULONG attachment, WebGLTextureType* texture, ULONG target, LONG level )
{
	assert(texture != NULL && "framebuffer->AttachAttachTexture() managed zero-texture behaviour");

	ctx_ = ctx;
	attachment_ = attachment;
	texture_ = texture;
	textureTarget_ = target;
	textureLevel_ = level;
	textureCubeMapFace_ = (target == GL_TEXTURE_2D) ? 0 : target;

	return S_OK;
}

BOOL CWebGLTextureAttachment::IsDefined() const
{
	return texture_ != NULL && !texture_->IsDeleted();
}

BOOL CWebGLTextureAttachment::IsComplite() const
{
	if(!IsDefined())
		return FALSE;

	if(texture_->GetWidth() == 0 || texture_->GetHeight() == 0)
		return FALSE;

	if(attachment_ != GL_COLOR_ATTACHMENT0)
		return FALSE;

	if(!CheckInternalFormatCompatible(attachment_, texture_->GetInternalFormat()))
		return FALSE;

	return TRUE;
}

BOOL CWebGLTextureAttachment::GetParameter( ULONG pname, CComVariant& retVal ) const
{
	switch(pname)
	{
	case GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE:
		retVal = CComVariant(GL_TEXTURE); break;
	case GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME:
		retVal = CComVariant(texture_); break;
	case GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL:
		retVal = CComVariant(textureLevel_); break;
	case GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE:
		retVal = CComVariant(textureCubeMapFace_); break;
	default:
		return FALSE;
	}
	return TRUE;
}

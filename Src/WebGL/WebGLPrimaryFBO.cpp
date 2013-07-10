#include "stdafx.h"
#include "WebGLPrimaryFBO.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"

#undef GL_APICALL
#undef EGLAPI
#include <libEGL/Display.h>
#include <libEGL/Surface.h>
#include <libGLESv2/Renderbuffer.h>

static IDirect3DDevice9* GetD3DDevice()
{
	EGLDisplay eglDisplay = eglGetCurrentDisplay();
	if (eglDisplay)
	{
		egl::Display *display = static_cast<egl::Display*>(eglDisplay);
		return display->getDevice();
	}
	return NULL;
}

static IDirect3DSurface9* GetD3D9Surface( ULONG renderbuffer )
{
	EGLContext eglCtx = eglGetCurrentContext();
	if (eglCtx)
	{
		gl::Context* glCtx = static_cast<gl::Context*>(eglCtx);
		gl::Renderbuffer* rb = glCtx->getRenderbuffer(renderbuffer);
		if(rb)
		{
			return rb->getRenderTarget();
		}
	}
	return NULL;
}

CWebGLPrimaryFBO::CWebGLPrimaryFBO() :
ctxt_(NULL),
width_(0),
height_(0),
useAlpha_(FALSE),
useDepth_(FALSE),
useStencil_(FALSE),
useAntialias_(FALSE),
fbo_(NULL),
colorSurf_(NULL),
depthSurf_(NULL),
stencilSurf_(NULL)
{
}

HRESULT CWebGLPrimaryFBO::Init( CWebGLRenderingContext* ctxt, BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias )
{
	ctxt_ = ctxt;
	useAlpha_ = alpha;
	useDepth_ = depth;
	useStencil_ = stencil;
	useAntialias_ = antialias;

	glGenFramebuffers(1, (GLuint*)&fbo_);
	glBindFramebuffer(GL_FRAMEBUFFER, fbo_);

	glGenRenderbuffers(1, (GLuint*)&colorSurf_);
	glBindRenderbuffer(GL_RENDERBUFFER, colorSurf_);
	RenderbufferStorageEx(useAntialias_, useAlpha_ ? GL_RGBA8 : GL_RGB8, 1, 1);
	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, colorSurf_);

	if(useDepth_ && useStencil_)
	{
		glGenRenderbuffers(1, (GLuint*)&depthSurf_);
		glBindRenderbuffer(GL_RENDERBUFFER, depthSurf_);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthSurf_);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, depthSurf_);
	}
	else if(useDepth_)
	{
		glGenRenderbuffers(1, (GLuint*)&depthSurf_);
		glBindRenderbuffer(GL_RENDERBUFFER, depthSurf_);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT, GL_RENDERBUFFER, depthSurf_);
	}
	else if(useStencil_)
	{
		glGenRenderbuffers(1, (GLuint*)&stencilSurf_);
		glBindRenderbuffer(GL_RENDERBUFFER, stencilSurf_);
		glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_STENCIL_ATTACHMENT, GL_RENDERBUFFER, stencilSurf_);
	}

	return glGetError() == GL_NO_ERROR ? S_OK : E_FAIL;
}

void CWebGLPrimaryFBO::UnInit()
{
	if (colorSurf_)
	{
		glDeleteRenderbuffers(1, (GLuint*)&colorSurf_);
		colorSurf_ = 0;
	}
	if (depthSurf_)
	{
		glDeleteRenderbuffers(1, (GLuint*)&depthSurf_);
		depthSurf_ = 0;
	}
	if (stencilSurf_)
	{
		glDeleteRenderbuffers(1, (GLuint*)&stencilSurf_);
		stencilSurf_ = 0;
	}
	if (fbo_)
	{
		glDeleteFramebuffers(1, (GLuint*)&fbo_);
		fbo_ = 0;
	}
}

void CWebGLPrimaryFBO::Clear()
{
	if (width_ <= 0 || height_ <= 0)
		return;

	GLuint boundFBO = 0;
	glGetIntegerv(GL_FRAMEBUFFER_BINDING, (GLint*)&boundFBO);

	glBindFramebuffer(GL_FRAMEBUFFER, fbo_);
	ULONG viewport[] = { 0, 0, width_, height_ };
	MakeClear(viewport, TRUE, useDepth_, useStencil_);

	glBindFramebuffer(GL_FRAMEBUFFER, boundFBO);
}

HRESULT CWebGLPrimaryFBO::ResizeColorRenderbuffer()
{
	ULONG oldColorSurf = colorSurf_;
	glGenRenderbuffers(1, (GLuint*)&colorSurf_);
	glBindRenderbuffer(GL_RENDERBUFFER, colorSurf_);
	RenderbufferStorageEx(useAntialias_, useAlpha_ ? GL_RGBA8 : GL_RGB8, width_, height_);

	CComPtr<IDirect3DSurface9> oldSurf;
	oldSurf.Attach(GetD3D9Surface(oldColorSurf));
	CComPtr<IDirect3DSurface9> colorSurf;
	colorSurf.Attach(GetD3D9Surface(colorSurf_));

	V_RET(GetD3DDevice()->StretchRect(oldSurf, NULL, colorSurf, NULL, D3DTEXF_NONE));
	glDeleteRenderbuffers(1, (GLuint*)&oldColorSurf);

	glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_RENDERBUFFER, colorSurf_);
	return S_OK;
}

CWebGLPrimaryFBO::ResizeResult CWebGLPrimaryFBO::ResizeFBO()
{
	GLint boundFBO = 0, boundRBO = 0;
	glGetIntegerv(GL_FRAMEBUFFER_BINDING, &boundFBO);
	glGetIntegerv(GL_RENDERBUFFER_BINDING, &boundRBO);
	glBindFramebuffer(GL_FRAMEBUFFER, fbo_);

	if (FAILED(ResizeColorRenderbuffer())) return Err;
	if (glGetError() == GL_OUT_OF_MEMORY) return ErrOutOfMemory;

	if(useDepth_ && useStencil_)
	{
		glBindRenderbuffer(GL_RENDERBUFFER, depthSurf_);
		RenderbufferStorageEx(useAntialias_, ctxt_->GetDepthStencilFormat(), width_, height_);
		if (glGetError() == GL_OUT_OF_MEMORY) return ErrOutOfMemory;
	}
	else if(useDepth_)
	{
		glBindRenderbuffer(GL_RENDERBUFFER, depthSurf_);
		RenderbufferStorageEx(useAntialias_, ctxt_->GetDepthFormat(), width_, height_);
		if (glGetError() == GL_OUT_OF_MEMORY) return ErrOutOfMemory;
	}
	else if(useStencil_)
	{
		glBindRenderbuffer(GL_RENDERBUFFER, stencilSurf_);
		RenderbufferStorageEx(useAntialias_, ctxt_->GetStencilFormat(), width_, height_);
		if (glGetError() == GL_OUT_OF_MEMORY) return ErrOutOfMemory;
	}

	ULONG status = glCheckFramebufferStatus(GL_FRAMEBUFFER);

	glBindFramebuffer(GL_FRAMEBUFFER, boundFBO);
	glBindRenderbuffer(GL_RENDERBUFFER, boundRBO);

	if (status == GL_FRAMEBUFFER_COMPLETE)
		return Ok;
	if (status == GL_FRAMEBUFFER_INCOMPLETE_MULTISAMPLE_ANGLE)
		return ErrIncompleteMultisample;
	return Err;
}

HRESULT CWebGLPrimaryFBO::Resize( ULONG width, ULONG height )
{
	if (width == width_ && height == height_)
		return S_OK;

	width_ = width;
	height_ = height;
	
	switch (ResizeFBO())
	{
	case Ok :
		{
			return S_OK;
		} break;
	case ErrIncompleteMultisample :
		{
			useAntialias_ = FALSE;
			Resize(width_, height_);
		} break;
	case ErrOutOfMemory :
		{
			width_ /= 2;
			height_ /= 2;
			Resize(width_, height_);
		} break;
	}
	return E_FAIL;
}

IDirect3DSurface9* CWebGLPrimaryFBO::GetColorSurfaceD3DPtr() const
{
	return GetD3D9Surface(colorSurf_);
}

#pragma once
#include "WebGLRCConstants.h"

struct IDirect3DSurface9;
class CWebGLRenderingContext;

class CWebGLPrimaryFBO
{
	CWebGLRenderingContext* ctxt_;

	ULONG width_;
	ULONG height_;
	BOOL useAlpha_;
	BOOL useDepth_;
	BOOL useStencil_;
	BOOL useAntialias_;

	ULONG fbo_;
	ULONG colorSurf_;
	ULONG depthSurf_;
	ULONG stencilSurf_;

	enum ResizeResult { Ok, Err, ErrOutOfMemory, ErrIncompleteMultisample };
	ResizeResult ResizeFBO();
	HRESULT ResizeColorRenderbuffer();

public:
	CWebGLPrimaryFBO();
	HRESULT Init(CWebGLRenderingContext* ctxt, BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias);
	void UnInit();

	void Clear();
	HRESULT Resize(ULONG width, ULONG height);

	ULONG GetWidth() const { return width_; }
	ULONG GetHeight() const { return height_; }
	ULONG GetColorFormat() const { return useAlpha_ ? GL_RGBA : GL_RGB; }
	IDirect3DSurface9* GetColorSurfaceD3DPtr() const;
	ULONG GetGLName() const { return fbo_; }
};

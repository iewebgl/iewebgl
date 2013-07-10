// WebGLFramebuffer.h : Declaration of the CWebGLFramebuffer

#pragma once
#include "../resource.h"
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"
#include "WebGLFramebufferAttachment.h"

using namespace ATL;

class CWebGLRenderingContext;
class CWebGLFramebuffer;

typedef CComObject<CWebGLFramebuffer> WebGLFramebufferType;
typedef WebGLObjectRefPtr<WebGLFramebufferType> WebGLFramebufferPtr;

class ATL_NO_VTABLE CWebGLFramebuffer :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLFramebuffer, &IID_IWebGLFramebuffer, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
	CWebGLFramebuffer(const CWebGLFramebuffer&);
	CWebGLFramebuffer& operator=(const CWebGLFramebuffer&);

protected:
	CWebGLFramebuffer();
	friend HRESULT CreateWebGLFramebuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLFramebufferPtr& retVal);

public:
	~CWebGLFramebuffer();
	typedef IWebGLFramebuffer MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLFramebuffer)
	COM_INTERFACE_ENTRY(IWebGLFramebuffer)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	void AttachRenderbuffer(ULONG attachment, WebGLRenderbufferType* renderbuffer);
	void AttachTexture(ULONG attachment, WebGLTextureType* texture, ULONG texTarget, LONG level);
	WebGLFramebufferAttachmentPtr GetAttachment(UINT attachment) const;

	void Bind();
	void MakeInitialClear();
	ULONG CheckStatus() const;
	BOOL HasEverBeenBound() const { return hasEverBeenBound_; }

private:
	BOOL hasEverBeenBound_;
	CAtlMap<ULONG, WebGLFramebufferAttachmentPtr> attachments_;

	BOOL IsMissing() const;
};

HRESULT CreateWebGLFramebuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLFramebufferPtr& retVal);

// WebGLRenderbuffer.h : Declaration of the CWebGLRenderbuffer

#pragma once
#include "../resource.h"
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"

using namespace ATL;

class CWebGLRenderingContext;
class CWebGLRenderbuffer;

typedef CComObject<CWebGLRenderbuffer> WebGLRenderbufferType;
typedef WebGLObjectRefPtr<WebGLRenderbufferType> WebGLRenderbufferPtr;

class ATL_NO_VTABLE CWebGLRenderbuffer :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLRenderbuffer, &IID_IWebGLRenderbuffer, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
protected:
	CWebGLRenderbuffer();
	friend HRESULT CreateWebGLRenderbuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLRenderbufferPtr& retVal);

public:
	~CWebGLRenderbuffer();
	typedef IWebGLRenderbuffer MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLRenderbuffer)
	COM_INTERFACE_ENTRY(IWebGLRenderbuffer)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	void Storage(ULONG width, ULONG height, ULONG internalFormat);
	void Bind();
	BOOL HasEverBeenBound() const { return hasEverBeenBound_; }

	void SetCleared() { cleared_ = TRUE; }
	BOOL IsCleared() const { return cleared_; }

	ULONG GetWidth() const { return width_; }
	ULONG GetHeight() const { return height_; }
	ULONG GetInternalFormat() const { return internalFormat_; }

private:
	BOOL cleared_;
	BOOL hasEverBeenBound_;

	ULONG internalFormat_;
	ULONG width_;
	ULONG height_;
};

HRESULT CreateWebGLRenderbuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLRenderbufferPtr& retVal);

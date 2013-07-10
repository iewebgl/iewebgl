// WebGLContextAttributes.h : Declaration of the CWebGLContextAttributes

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

using namespace ATL;

// CWebGLContextAttributes

class ATL_NO_VTABLE CWebGLContextAttributes :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLContextAttributes, &IID_IWebGLContextAttributes, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
public:
	CWebGLContextAttributes();
	HRESULT Init(BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, BOOL premultipliedAlpha, BOOL preserveDrawingBuffer);

BEGIN_COM_MAP(CWebGLContextAttributes)
	COM_INTERFACE_ENTRY(IWebGLContextAttributes)
	COM_INTERFACE_ENTRY(IDispatch)
END_COM_MAP()

public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IWebGLContextAttributes
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(get_alpha)(VARIANT* retVal);
	STDMETHOD(get_depth)(VARIANT* retVal);
	STDMETHOD(get_stencil)(VARIANT* retVal);
	STDMETHOD(get_antialias)(VARIANT* retVal);
	STDMETHOD(get_premultipliedAlpha)(VARIANT* retVal);
	STDMETHOD(get_preserveDrawingBuffer)(VARIANT* retVal);

private:
	BOOL alpha_;
	BOOL depth_;
	BOOL stencil_;
	BOOL antialias_;
	BOOL premultipliedAlpha_;
	BOOL preserveDrawingBuffer_;
};

typedef CComObject<CWebGLContextAttributes> WebGLContextAttributesType;
typedef CComPtr<WebGLContextAttributesType> WebGLContextAttributesPtr;

HRESULT CreateWebGLContextAttributes(BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias,
	BOOL premultipliedAlpha, BOOL preserveDrawingBuffer, WebGLContextAttributesPtr& retVal );
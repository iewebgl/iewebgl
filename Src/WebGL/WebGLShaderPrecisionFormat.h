// WebGLActiveInfo.h : Declaration of the CWebGLActiveInfo

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include <atlstr.h>

using namespace ATL;

// CWebGLActiveInfo
class CWebGLRenderingContext;
class JSObjectImpl;

class ATL_NO_VTABLE CWebGLShaderPrecisionFormat :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLShaderPrecisionFormat, &IID_IWebGLShaderPrecisionFormat, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
public:
	CWebGLShaderPrecisionFormat();
	~CWebGLShaderPrecisionFormat();

	HRESULT Init(LONG rangeMin, LONG rangeMax, LONG precision);

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IWebGLActiveInfo
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(get_rangeMin)(LONG * retVal);
	STDMETHOD(get_rangeMax)(LONG * retVal);
	STDMETHOD(get_precision)(LONG * retVal);

BEGIN_COM_MAP(CWebGLShaderPrecisionFormat)
	COM_INTERFACE_ENTRY(IWebGLShaderPrecisionFormat)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

private:
	HRESULT InitDispEx();

	CAutoPtr<JSObjectImpl> dispEx_;
	LONG rangeMin_;
	LONG rangeMax_;
	LONG precision_;
};


typedef CComObject<CWebGLShaderPrecisionFormat> WebGLShaderPrecisionFormatType;
typedef CComPtr<WebGLShaderPrecisionFormatType> WebGLShaderPrecisionFormatPtr;
typedef CComPtr<IWebGLShaderPrecisionFormat> IWebGLShaderPrecisionFormatPtr;

HRESULT CreateWebGLShaderPrecisionFormat(CWebGLRenderingContext* ctx, LONG rangeMin, LONG rangeMax, LONG precision, WebGLShaderPrecisionFormatPtr& retVal);
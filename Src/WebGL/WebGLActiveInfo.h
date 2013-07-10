// WebGLActiveInfo.h : Declaration of the CWebGLActiveInfo

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include <atlstr.h>

using namespace ATL;

// CWebGLActiveInfo
class CWebGLRenderingContext;
class JSObjectImpl;

class ATL_NO_VTABLE CWebGLActiveInfo :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLActiveInfo, &IID_IWebGLActiveInfo, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
public:
	CWebGLActiveInfo();
	~CWebGLActiveInfo();

	HRESULT Init(LONG size, ULONG type, const char * name, ULONG len);
	void Delete();
	BOOL Deleted() { return deleted_; } 

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IWebGLActiveInfo
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(get_size)(LONG * retVal);
	STDMETHOD(get_type)(ULONG * retVal);
	STDMETHOD(get_name)(BSTR * retVal);

BEGIN_COM_MAP(CWebGLActiveInfo)
	COM_INTERFACE_ENTRY(IWebGLActiveInfo)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

private:
	HRESULT InitDispEx();

	CAutoPtr<JSObjectImpl> dispEx_;
	LONG size_;
	ULONG type_;
	CAtlStringA name_;
	BOOL deleted_;
};


typedef CComObject<CWebGLActiveInfo> WebGLActiveInfoType;
typedef CComPtr<WebGLActiveInfoType> WebGLActiveInfoPtr;
typedef CComPtr<IWebGLActiveInfo> IWebGLActiveInfoPtr;

HRESULT CreateWebGLActiveInfo(CWebGLRenderingContext* ctx, LONG size, ULONG type, const char * name, ULONG len, WebGLActiveInfoPtr& retVal);
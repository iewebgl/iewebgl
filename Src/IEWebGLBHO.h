// IEWebGLBHO.h : Declaration of the CIEWebGLBHO

#pragma once
#include "resource.h"       // main symbols
#include "IEWebGL_i.h"

#include <callobj.h>

#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as the Windows Mobile platforms that do not include full DCOM support. Define _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM object's and allow use of it's single-threaded COM object implementations. The threading model in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

using namespace ATL;

// CIEWebGLBHO

class ATL_NO_VTABLE CIEWebGLBHO :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CIEWebGLBHO, &CLSID_IEWebGLBHO>,
	public IObjectWithSiteImpl<CIEWebGLBHO>,
	public IIEWebGLBHO
{
public:
	CIEWebGLBHO() {}
	~CIEWebGLBHO() { interceptor_->RegisterSink(nullptr); }

//DECLARE_REGISTRY_RESOURCEID(IDR_IEWEBGLBHO)

BEGIN_COM_MAP(CIEWebGLBHO)
	COM_INTERFACE_ENTRY(IIEWebGLBHO)
	COM_INTERFACE_ENTRY(IObjectWithSite)
END_COM_MAP()

	DECLARE_PROTECT_FINAL_CONSTRUCT()
	HRESULT FinalConstruct() { return S_OK; }
	void FinalRelease() {}

private:
	CComPtr<ICallInterceptor> interceptor_;
};

//OBJECT_ENTRY_AUTO(__uuidof(IEWebGLBHO), CIEWebGLBHO)

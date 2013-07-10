#pragma once

#include <atlcom.h>
#include <utility>

using namespace ATL;

class JSObjectImpl : public IDispatchEx
{
public:
	friend HRESULT InitDispEx(CComTypeInfoHolder& tih, IDispatch* external, LONG length, JSObjectImpl*& retVal);
	JSObjectImpl(IDispatch* external);
	~JSObjectImpl();

	ULONG STDMETHODCALLTYPE AddRef();
	ULONG STDMETHODCALLTYPE Release();
	HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void **ppvObject);
	//////////////////////////////////////////////////////////////////////////
	// IDispatchEx implementation
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(GetTypeInfoCount)(UINT *pctinfo);
	STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo);
	STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId);
	STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult,
		EXCEPINFO *pExcepInfo, UINT *puArgErr);

	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(GetDispID)(BSTR bstrName, DWORD grfdex, DISPID *pid);
	STDMETHOD(InvokeEx)(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller);
	STDMETHOD(DeleteMemberByName)(BSTR bstrName, DWORD grfdex);
	STDMETHOD(DeleteMemberByDispID)(DISPID id);
	STDMETHOD(GetMemberProperties)(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex);
	STDMETHOD(GetMemberName)(DISPID id, BSTR *pbstrName);
	STDMETHOD(GetNextDispID)(DWORD grfdex, DISPID id, DISPID *pid);
	STDMETHOD(GetNameSpaceParent)(IUnknown **ppunk);

	DISPID GetStartID() const { return startID_; }

private:
	STDMETHOD(DefaultValue)( DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr );
	STDMETHOD(ForwardIndexedAccess)( DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr );
	STDMETHOD(GetMethodAsProperty)(FUNCDESC * desc, VARIANT* pvarResult);
	STDMETHOD(PutMethodAsProperty)(FUNCDESC * desc, DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr);
	STDMETHOD(InvokeWithECMAConvertion)(FUNCDESC * desc, DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr);
	STDMETHOD(StaticInvoke)(DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr);
	STDMETHOD(DynamicInvoke)( DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr );

	HRESULT InitTypeInfoMap(CComTypeInfoHolder& tih, LONG length);
	HRESULT UninitTypeInfoMap();

	IDispatch* external_;
	DISPID startID_;
	DISPID nextID_;
	LONG length_;
	CAtlMap<CComBSTR, DISPID> nameMap_;
	CAtlMap<DISPID, CComVariant> propMap_;

	CComPtr<ITypeInfo> typeInfo_;
	CRBMultiMap<DISPID, FUNCDESC*> dispIDMap_;
};

HRESULT InitDispEx(CComTypeInfoHolder& tih, IDispatch* external, LONG length, JSObjectImpl*& retVal);



//////////////////////////////////////////////////////////////////////////


typedef HRESULT (*JSObjectMakeFunction)(DISPPARAMS& params, CComVariant& result);
typedef HRESULT (*JSObjectConstPropFunction)(CAtlArray<std::pair<const CComBSTR, const CComVariant> >& props);

class CJSObjectFactory :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchEx
{
	static const ULONG PrototypePropID = 0x40404040;
	static const ULONG IsPrototypeOfID = 0x80808080;
	static const ULONG HasOwnPropertyID = 0x20202020;
public:

	BEGIN_COM_MAP(CJSObjectFactory)
		COM_INTERFACE_ENTRY(IDispatch)
		COM_INTERFACE_ENTRY(IDispatchEx)
	END_COM_MAP()

	CJSObjectFactory();

	void Init(IID objIID, JSObjectMakeFunction makerFunc, JSObjectConstPropFunction propsFunc);

	//////////////////////////////////////////////////////////////////////////
	// IDispatch
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD( GetTypeInfoCount )(UINT * retVal);
	STDMETHOD( GetTypeInfo )(UINT ,LCID , ITypeInfo **);
	STDMETHOD( GetIDsOfNames )(const IID & iid, LPOLESTR * names, UINT count, LCID lcid, DISPID * retVal);
	STDMETHOD( Invoke )(DISPID dispID, const IID & iid, LCID lcid, WORD flags, DISPPARAMS * params, VARIANT * retVal, EXCEPINFO *,UINT *);

	//////////////////////////////////////////////////////////////////////////
	// IDispatchEx
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD( GetDispID )(BSTR bstrName, DWORD grfdex, DISPID *pid);
	STDMETHOD( InvokeEx )(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *, IServiceProvider *);
	STDMETHOD( DeleteMemberByName )(BSTR bstrName, DWORD grfdex);
	STDMETHOD( DeleteMemberByDispID )(DISPID id);
	STDMETHOD( GetMemberProperties )(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex);
	STDMETHOD( GetMemberName )(DISPID id, BSTR *pbstrName);
	STDMETHOD( GetNextDispID )(DWORD grfdex, DISPID id, DISPID *pid);
	STDMETHOD( GetNameSpaceParent )(IUnknown **ppunk);

private:
	IID objIID_;
	JSObjectMakeFunction maker_;
	CAtlArray<std::pair<const CComBSTR, const CComVariant> > props_;
};

typedef CComObject<CJSObjectFactory> JSObjectFactory;

HRESULT UTF8DecoderMaker(DISPPARAMS& params, CComVariant& result);
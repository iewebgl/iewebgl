#include "stdafx.h"
#include "JSObjectImpl.h"
#include "ECMAConvertion.h"

#include <cassert>
#include <atlstr.h>

// {3BDB5AB5-AE6F-4740-B976-3E1E48167288}
GUID IID_IEWebGLObjectMarker = { 0x3bdb5ab5, 0xae6f, 0x4740, { 0xb9, 0x76, 0x3e, 0x1e, 0x48, 0x16, 0x72, 0x88 } };


class CFunctionObject :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatch
{
	static const size_t CallDispID = 1;
	static const size_t ApplyDispID = 2;
	CComBSTR name_;
public:
	BEGIN_COM_MAP(CFunctionObject)
		COM_INTERFACE_ENTRY(IDispatch)
	END_COM_MAP()

	HRESULT Init(BSTR name)
	{
		name_ = name;
		return S_OK;
	}
	//////////////////////////////////////////////////////////////////////////
	// IDispatch implementation
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(GetTypeInfoCount)(UINT *pctinfo)
	{
		if (pctinfo) *pctinfo = 0;
		return S_OK;
	}

	STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
	{
		return E_FAIL;
	}

	STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId)
	{
		HRESULT retVal = S_OK;
		for (UINT i = 0; i < cNames; ++i)
		{
			if ( wcscmp(rgszNames[i], L"call") == 0 )
			{
				rgDispId[i] = CallDispID;
			}
			else if ( wcscmp(rgszNames[i], L"apply") == 0 )
			{
				rgDispId[i] = ApplyDispID;
			}
			else
			{
				rgDispId[i] = DISPID_UNKNOWN;
				retVal = DISP_E_UNKNOWNNAME;
			}
		}
		return retVal;
	}

	STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult,
		EXCEPINFO *pExcepInfo, UINT *puArgErr)
	{
		if (!pDispParams)
			return E_INVALIDARG;
		if (pDispParams->cArgs < 1)
			return DISP_E_BADPARAMCOUNT;
		if (pDispParams->rgvarg[pDispParams->cArgs-1].vt != VT_DISPATCH)
			return DISP_E_BADVARTYPE;
		if (pDispParams->rgvarg[pDispParams->cArgs-1].pdispVal == nullptr) // will not call in context of Global object
			return DISP_E_EXCEPTION;

		IDispatch* disp = pDispParams->rgvarg[pDispParams->cArgs-1].pdispVal;
		switch (dispIdMember)
		{
		case CallDispID:
			{
				DISPID id;
				DISPPARAMS params = *pDispParams;
				--params.cArgs;

				V_RET(disp->GetIDsOfNames(IID_NULL, &name_.m_str, 1, LOCALE_USER_DEFAULT, &id));
				return disp->Invoke(id, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, pVarResult, pExcepInfo, puArgErr);
			}
			break;
		case ApplyDispID:
			return E_NOTIMPL;
			break;
		default:
			return DISP_E_UNKNOWNNAME;
		}
		return S_OK;
	}
};

typedef CComObject<CFunctionObject> FunctionObjectType;
typedef CComPtr<FunctionObjectType> FunctionObjectPtr;

//////////////////////////////////////////////////////////////////////////

JSObjectImpl::JSObjectImpl(IDispatch* external) :
external_(external),
startID_(0),
nextID_(0),
length_(0)
{
}

JSObjectImpl::~JSObjectImpl()
{
	UninitTypeInfoMap();
}

ULONG STDMETHODCALLTYPE JSObjectImpl::AddRef()
{
	return external_->AddRef();
}

ULONG STDMETHODCALLTYPE JSObjectImpl::Release()
{
	return external_->Release();
}

HRESULT STDMETHODCALLTYPE JSObjectImpl::QueryInterface( REFIID riid, void **ppvObject )
{
	if ( riid == IID_IEWebGLObjectMarker) // return success code, but do not increment refCount and do not return reference
		return S_OK;

	if (!ppvObject)
		return E_INVALIDARG;

	if (riid == IID_IDispatch)
	{
		*ppvObject = this;
		AddRef();
		return S_OK;
	}

	if (riid == IID_IDispatchEx)
	{
		*ppvObject = this;
		AddRef();
		return S_OK;
	}

	return external_->QueryInterface(riid, ppvObject);
}

STDMETHODIMP JSObjectImpl::GetTypeInfoCount( UINT *pctinfo )
{
	return external_->GetTypeInfoCount(pctinfo);
}

STDMETHODIMP JSObjectImpl::GetTypeInfo( UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo )
{
	return external_->GetTypeInfo(iTInfo, lcid, ppTInfo);
}

STDMETHODIMP JSObjectImpl::GetIDsOfNames( REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId )
{
	for (ULONG i = 0; i < cNames; ++i)
	{
		V_RET(GetDispID(rgszNames[i], 0, &rgDispId[i]));
	}

	return S_OK;
}

STDMETHODIMP JSObjectImpl::DefaultValue( DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr )
{
	DISPID id;
	V_RET(GetDispID(L"toString", 0, &id));

	if (wFlags & DISPATCH_PROPERTYGET)
	{
		return Invoke(id, riid, lcid, DISPATCH_METHOD, pDispParams, pVarResult, pExcepInfo, puArgErr);
	}
	return S_OK;
}

STDMETHODIMP JSObjectImpl::ForwardIndexedAccess( DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr )
{
	return external_->Invoke(dispidMember, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
}

STDMETHODIMP JSObjectImpl::GetMethodAsProperty(FUNCDESC * desc, VARIANT* pvarResult)
{
	assert(desc);

	FunctionObjectType * f = nullptr;
	V_RET(FunctionObjectType::CreateInstance(&f));
	FunctionObjectPtr funcObj(f);

	CComBSTR name;
	V_RET(typeInfo_->GetDocumentation(desc->memid, &name, nullptr, nullptr, nullptr));

	ATL::CAtlStringW str(name); 
	str.Replace(L"__", L"");

	V_RET(f->Init(str.GetBuffer()));
	V_RET(CComVariant(funcObj).Detach(pvarResult));
	return S_OK;
}

STDMETHODIMP JSObjectImpl::PutMethodAsProperty(FUNCDESC * desc, DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr)
{
	assert(desc);

	CComBSTR name;
	V_RET(typeInfo_->GetDocumentation(desc->memid, &name, nullptr, nullptr, nullptr));

	ATL::CAtlStringW str(name); 
	str.Replace(L"__", L"");

	nameMap_.RemoveKey(str.GetBuffer()); // forget method name

	DISPID id;
	V_RET(GetDispID(str.GetBuffer(), fdexNameEnsure, &id)); // get new ID for the name
	assert(id >= startID_ + length_);

	return Invoke(id, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr); // put as regular member
}

STDMETHODIMP JSObjectImpl::InvokeWithECMAConvertion(FUNCDESC * desc, DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr)
{
	const size_t MemSize = desc->cParams*sizeof(VARIANT);
	VARIANT * pParams = (VARIANT*)_alloca(MemSize);
	memset(pParams, 0, MemSize);
	
	const LONG Offset = max(0l, (LONG)pdispparams->cArgs - (LONG)desc->cParams);
	const ULONG Count = min((ULONG)desc->cParams, pdispparams->cArgs);
	for (ULONG i = 0; i < Count; ++i)
	{
		pParams[desc->cParams - i - 1] = pdispparams->rgvarg[pdispparams->cArgs - i - 1];
	}
	
	for (ULONG i = 0; i < (ULONG)desc->cParams; ++i) 
	{
		V_RET(DataConvertion::ECMACvt(pParams[i], pParams[i], desc->lprgelemdescParam[desc->cParams - i - 1].tdesc.vt));
	}

	DISPPARAMS params = { pParams, nullptr, desc->cParams, 0 };
	HRESULT hr = external_->Invoke(dispidMember, riid, lcid,
		wFlags, &params, pvarResult, pexcepinfo, puArgErr);

	for (ULONG i = 0; i < Count; ++i)
	{
		DataConvertion::CopyBackArrayBufferView(pParams[desc->cParams - i - 1], pdispparams->rgvarg[pdispparams->cArgs - i - 1]);
	}

	for (LONG i = 0; i < (LONG)desc->cParams; ++i)
	{
		VariantClear(&pParams[desc->cParams - i - 1]);
	}

	return hr;
}

STDMETHODIMP JSObjectImpl::StaticInvoke( DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr )
{
	if ( (dispidMember >= startID_ && dispidMember < startID_ + length_) )
	{
		return ForwardIndexedAccess(dispidMember, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
	}

	FUNCDESC * desc = nullptr;
	auto pos = dispIDMap_.FindFirstWithKey(dispidMember);
	while (pos)
	{
		desc = dispIDMap_.GetValueAt(pos);
		if ( wFlags & desc->invkind || desc->invkind & INVOKE_FUNC)
			break;

		desc = nullptr;
		dispIDMap_.GetNextWithKey(pos, dispidMember);
	}
	if ( !desc )
	{
		return DISP_E_UNKNOWNNAME;
	}

	if (wFlags == DISPATCH_PROPERTYGET && desc->invkind == INVOKE_FUNC)
	{
		return GetMethodAsProperty(desc, pvarResult);
	}
	else if (wFlags & DISPATCH_PROPERTYPUT && desc->invkind == INVOKE_FUNC)
	{
		return PutMethodAsProperty(desc, dispidMember, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
	}
	else
	{
		return InvokeWithECMAConvertion(desc, dispidMember, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
	}

	return S_OK;
}

STDMETHODIMP JSObjectImpl::DynamicInvoke( DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr )
{
	CComVariant item;
	if ( !propMap_.Lookup(dispIdMember, item) )
		return DISP_E_UNKNOWNNAME;

	if (wFlags & DISPATCH_PROPERTYGET) // DISPATCH_PROPERTYGET may be combined with DISPATCH_METHOD
	{
		if (wFlags & DISPATCH_METHOD && item.vt == VT_DISPATCH)
		{
			if (!item.pdispVal)
				return DISP_E_EXCEPTION;
			return item.pdispVal->Invoke(DISPID_VALUE, riid, lcid, DISPATCH_METHOD, pDispParams, pVarResult, pExcepInfo, puArgErr);
		}
		else
		{
			V_RET(VariantCopy(pVarResult, &item));
		}
		return S_OK;
	}
	if (wFlags & DISPATCH_PROPERTYPUT) // DISPATCH_PROPERTYPUT may be combined with DISPATCH_PROPERTYPUTREF
	{
		if ( !pDispParams || !pDispParams->cArgs )
			return DISP_E_PARAMNOTFOUND;

		propMap_.SetAt(dispIdMember, pDispParams->rgvarg[0]);
		return S_OK;
	}

	return E_NOTIMPL;
}

STDMETHODIMP JSObjectImpl::Invoke( DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult, EXCEPINFO *pExcepInfo, UINT *puArgErr )
{
	if (DISPID_VALUE == dispIdMember)
	{
		return DefaultValue(dispIdMember, riid, lcid, wFlags, pDispParams, pVarResult, pExcepInfo, puArgErr);
	}

	if (dispIdMember < startID_ + length_) // static member access
	{
		return StaticInvoke(dispIdMember, riid, lcid, wFlags, pDispParams, pVarResult, pExcepInfo, puArgErr);
	}

	// dynamic member access
	return DynamicInvoke(dispIdMember, riid, lcid, wFlags, pDispParams, pVarResult, pExcepInfo, puArgErr);
}

STDMETHODIMP JSObjectImpl::InvokeEx( DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller )
{
	return Invoke(id, IID_NULL, lcid, wFlags, pdp, pvarRes, pei, nullptr);
}

STDMETHODIMP JSObjectImpl::GetDispID( BSTR bstrName, DWORD grfdex, DISPID *pid )
{
	if (!pid)
		return E_INVALIDARG;

	BSTR p = bstrName;
	bool isNumber = p != nullptr;
	while (isNumber && *p)
	{
		int delta = (*p - L'0'); 
		isNumber &= delta >= 0 && delta < 10;
		++p;
	}
	if ( isNumber )
	{
		LONG val = _wtoi(bstrName);
		if (val < length_)
		{
			*pid = startID_ + val;
			return S_OK;
		}
	}

	if ( !nameMap_.Lookup(bstrName, *pid) )
	{
		if (grfdex & fdexNameEnsure)
		{
			propMap_.SetAt(nextID_, CComVariant());
			nameMap_.SetAt(bstrName, nextID_);

			*pid = nextID_;
			++nextID_;
			return S_OK;
		}
		return DISP_E_UNKNOWNNAME;
	}
	else
	{
		if (*pid < startID_)
		{
			return S_OK;
		}

		auto lookupResult = propMap_.Lookup(*pid);
		if ( !lookupResult )
		{
			if (grfdex & fdexNameEnsure)
			{
				propMap_.SetAt(*pid, CComVariant());
				return S_OK;
			}
		}
		else
		{
			return S_OK;
		}
	}

	return DISP_E_UNKNOWNNAME;
}

STDMETHODIMP JSObjectImpl::DeleteMemberByName( BSTR bstrName, DWORD grfdex )
{
	DISPID id;
	if ( !nameMap_.Lookup(bstrName, id) )
		return DISP_E_UNKNOWNNAME;

	return DeleteMemberByDispID(id);
}

STDMETHODIMP JSObjectImpl::DeleteMemberByDispID( DISPID id )
{
	if (id < (startID_ + length_) )
		return S_FALSE;

	if ( propMap_.RemoveKey(id) )
		return S_OK;

	return DISP_E_UNKNOWNNAME;
}

STDMETHODIMP JSObjectImpl::GetMemberProperties( DISPID id, DWORD grfdexFetch, DWORD *pgrfdex )
{
	DWORD staticProp = 0;
	DWORD indexProp = fdexPropCanGet | fdexPropCanPut | fdexPropCannotCall | fdexPropCannotConstruct | fdexPropCannotSourceEvents;
	DWORD dynamicProp = fdexPropDynamicType;

	if (!pgrfdex)
		return E_INVALIDARG;

	if ( !propMap_.Lookup(id) )
		return DISP_E_UNKNOWNNAME;

	if (id < startID_) *pgrfdex = staticProp;
	else if (id < (startID_ + length_) ) *pgrfdex = indexProp;
	else *pgrfdex = dynamicProp;

	return S_OK;
}

STDMETHODIMP JSObjectImpl::GetMemberName( DISPID id, BSTR *pbstrName )
{
	if ( !pbstrName )
		return E_INVALIDARG;

	if ( !propMap_.Lookup(id) )
		return DISP_E_UNKNOWNNAME;

	POSITION pos = nameMap_.GetStartPosition();
	while (pos)
	{
		if ( nameMap_.GetAt(pos)->m_value == id )
		{
			*pbstrName = nameMap_.GetAt(pos)->m_key.Copy();
			return S_OK;
		}
		nameMap_.GetNext(pos);
	}

	assert(!"should never happen");
	return DISP_E_UNKNOWNNAME;
}

STDMETHODIMP JSObjectImpl::GetNextDispID( DWORD grfdex, DISPID id, DISPID *pid )
{
	if (!pid)
		return E_INVALIDARG;

	*pid = DISPID_UNKNOWN;

	if (id == DISPID_STARTENUM)
	{
		if ( !propMap_.GetCount() )
			return S_FALSE;

		*pid = propMap_.GetAt(propMap_.GetStartPosition())->m_key;
		return S_OK;
	}
	else
	{
		POSITION p = propMap_.GetStartPosition();
		while (p && propMap_.GetAt(p)->m_key != id)
		{
			propMap_.GetNext(p);
		}

		if (!p)
			return DISP_E_UNKNOWNNAME;

		propMap_.GetNext(p);
		if (!p)
			return S_FALSE;

		*pid = propMap_.GetAt(p)->m_key;
		return S_OK;
	}

	return S_OK;
}

STDMETHODIMP JSObjectImpl::GetNameSpaceParent( IUnknown **ppunk )
{
	if (!ppunk)
		return E_INVALIDARG;

	*ppunk = nullptr;
	return E_NOT_SET;
}


HRESULT JSObjectImpl::InitTypeInfoMap(CComTypeInfoHolder& tih, LONG length)
{
	if (!external_)
		return E_FAIL;

	V_RET(tih.GetTI(LOCALE_USER_DEFAULT, &typeInfo_));

	TYPEATTR * typeAttr = nullptr;
	V_RET(typeInfo_->GetTypeAttr(&typeAttr));
	
	startID_ = 1;
	FUNCDESC * funcDesc = nullptr;
	for (WORD i = 0; i < typeAttr->cFuncs; ++i)
	{
		if ( SUCCEEDED(typeInfo_->GetFuncDesc(i, &funcDesc)) )
		{
			if ( !(funcDesc->wFuncFlags & FUNCFLAG_FRESTRICTED) )
			{
				dispIDMap_.Insert(funcDesc->memid, funcDesc);

				startID_ = max(funcDesc->memid, startID_);
				CComBSTR nameStr;
				V_RET(typeInfo_->GetDocumentation(funcDesc->memid, &nameStr, nullptr, nullptr, nullptr));

				ATL::CAtlStringW str(nameStr); 
				str.Replace(L"__", L"");

				nameMap_.SetAt(str.GetBuffer(), funcDesc->memid);
			}
			else
			{
				typeInfo_->ReleaseFuncDesc(funcDesc);
			}
		}
	}

	++startID_;
	length_ = length;
	nextID_ = startID_ + length_;

	typeInfo_->ReleaseTypeAttr(typeAttr);
	return S_OK;
}

HRESULT JSObjectImpl::UninitTypeInfoMap()
{
	if (typeInfo_ && dispIDMap_.GetCount())
	{
		POSITION pos = dispIDMap_.GetHeadPosition();
		while (pos)
		{
			typeInfo_->ReleaseFuncDesc(dispIDMap_.GetValueAt(pos));
			dispIDMap_.GetNext(pos);
		}
		dispIDMap_.RemoveAll();
	}
	return S_OK;
}

HRESULT InitDispEx( CComTypeInfoHolder& tih, IDispatch* external, LONG length, JSObjectImpl*& retVal )
{
	retVal = nullptr;
	JSObjectImpl* dispEx = new JSObjectImpl(external);
	if (!dispEx)
		return E_OUTOFMEMORY;

	HRESULT hr = dispEx->InitTypeInfoMap(tih, length);
	if ( FAILED(hr) )
	{
		delete dispEx;
		return hr;
	}

	retVal = dispEx;
	return S_OK;
}


//////////////////////////////////////////////////////////////////////////



CJSObjectFactory::CJSObjectFactory() : maker_(nullptr)
{

}

void CJSObjectFactory::Init( IID objIID, JSObjectMakeFunction makerFunc, JSObjectConstPropFunction propsFunc )
{
	objIID_ = objIID;
	maker_ = makerFunc;
	propsFunc(props_);
}

STDMETHODIMP CJSObjectFactory::GetTypeInfoCount( UINT * retVal )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetTypeInfo( UINT ,LCID , ITypeInfo ** )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetIDsOfNames( const IID & iid, LPOLESTR * names, UINT count, LCID lcid, DISPID * retVal )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::Invoke( DISPID dispID, const IID & iid, LCID lcid, WORD flags, DISPPARAMS * params, VARIANT * retVal, EXCEPINFO *,UINT * )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetDispID( BSTR bstrName, DWORD grfdex, DISPID *pid )
{
	if (!pid)
		return E_INVALIDARG;

	if (wcscmp(bstrName, L"prototype") == 0)
	{
		*pid = PrototypePropID;
		return S_OK;
	}

	if (wcscmp(bstrName, L"isPrototypeOf") == 0)
	{
		*pid = IsPrototypeOfID;
		return S_OK;
	}

	if (wcscmp(bstrName, L"hasOwnProperty") == 0)
	{
		*pid = HasOwnPropertyID;
		return S_OK;
	}

	for (UINT i = 0; i < props_.GetCount(); ++i)
	{
		if (props_[i].first == bstrName)
		{
			*pid = i + 1;
			return S_OK;
		}
	}
	return DISP_E_UNKNOWNNAME;
}

STDMETHODIMP CJSObjectFactory::InvokeEx( DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *, IServiceProvider * )
{
	if (id == PrototypePropID && wFlags == DISPATCH_PROPERTYGET)
	{
		return CComVariant((IDispatch*)this).Detach(pvarRes);
	}

	if (id == IsPrototypeOfID && (wFlags & DISPATCH_METHOD) )
	{
		if (!pvarRes)
			return E_INVALIDARG;

		pvarRes->vt = VT_BOOL;

		if (pdp->cArgs == 1 && pdp->rgvarg[0].vt == VT_DISPATCH && pdp->rgvarg[0].pdispVal)
		{
			CComPtr<IUnknown> unk;
			HRESULT hr = pdp->rgvarg[0].pdispVal->QueryInterface(objIID_, (void**)&unk);
			pvarRes->boolVal = SUCCEEDED(hr) ? VARIANT_TRUE : VARIANT_FALSE;
		}
		else
		{
			pvarRes->boolVal = VARIANT_FALSE;
		}

		return S_OK;
	}

	if (id == HasOwnPropertyID && (wFlags & DISPATCH_METHOD) )
	{
		if (!pvarRes)
			return E_INVALIDARG;

		pvarRes->vt = VT_BOOL;
		pvarRes->boolVal = VARIANT_FALSE;

		if (pdp->cArgs == 1 && pdp->rgvarg[0].vt == VT_BSTR)
		{
			pvarRes->boolVal = wcscmp(pdp->rgvarg[0].bstrVal, L"iewebgl") == 0 ? VARIANT_TRUE : VARIANT_FALSE;
		}

		return S_OK;
	}

	if (id == 0 && wFlags == DISPATCH_CONSTRUCT)
	{
		DISPPARAMS params(*pdp);
		// delete named arguments
		params.rgvarg += params.cNamedArgs; 
		params.cArgs -= params.cNamedArgs;
		params.cNamedArgs = 0;
		params.rgdispidNamedArgs = nullptr;

		CComVariant result;
		V_RET(maker_(params, result));

		V_RET(result.Detach(pvarRes));
		return S_OK;
	}
	if (id > 0)
	{
		const ULONG Index = id - 1;
		if (Index >= props_.GetCount())
		{
			return E_FAIL;
		}

		V_RET(CComVariant(props_[Index].second).Detach(pvarRes));
		return S_OK;
	}
	return E_FAIL;
}

STDMETHODIMP CJSObjectFactory::DeleteMemberByName( BSTR bstrName, DWORD grfdex )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::DeleteMemberByDispID( DISPID id )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetMemberProperties( DISPID id, DWORD grfdexFetch, DWORD *pgrfdex )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetMemberName( DISPID id, BSTR *pbstrName )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetNextDispID( DWORD grfdex, DISPID id, DISPID *pid )
{
	return E_NOTIMPL;
}

STDMETHODIMP CJSObjectFactory::GetNameSpaceParent( IUnknown **ppunk )
{
	return E_NOTIMPL;
}

//////////////////////////////////////////////////////////////////////////

class UTF8Decoder :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatch
{
	static const size_t DecodeID = 1;
public:
	BEGIN_COM_MAP(UTF8Decoder)
		COM_INTERFACE_ENTRY(IDispatch)
	END_COM_MAP()

	//////////////////////////////////////////////////////////////////////////
	// IDispatch implementation
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(GetTypeInfoCount)(UINT *pctinfo)
	{
		if (pctinfo) *pctinfo = 0;
		return S_OK;
	}

	STDMETHOD(GetTypeInfo)(UINT iTInfo, LCID lcid, ITypeInfo **ppTInfo)
	{
		return E_FAIL;
	}

	STDMETHOD(GetIDsOfNames)(REFIID riid, LPOLESTR *rgszNames, UINT cNames, LCID lcid, DISPID *rgDispId)
	{
		HRESULT retVal = S_OK;
		for (UINT i = 0; i < cNames; ++i)
		{
			if ( wcscmp(rgszNames[i], L"decode") == 0 )
			{
				rgDispId[i] = DecodeID;
			}
			else
			{
				rgDispId[i] = DISPID_UNKNOWN;
				retVal = DISP_E_UNKNOWNNAME;
			}
		}
		return retVal;
	}

	STDMETHOD(DecodeUTF8)(VARIANT input, VARIANT * retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		retVal->vt = VT_BSTR;
		retVal->bstrVal = nullptr;

		if (input.vt != (VT_ARRAY | VT_UI1) || !input.parray ||
			input.parray->cDims != 1)
			return E_FAIL;

		auto required = MultiByteToWideChar(CP_UTF8, 0, (LPCSTR)input.parray->pvData, input.parray->rgsabound[0].cElements, nullptr, 0);

		auto resStr = SysAllocStringLen(nullptr, required);
		if (!resStr)
		{
			return E_FAIL;
		}
		auto copied = MultiByteToWideChar(CP_UTF8, 0, (LPCSTR)input.parray->pvData, input.parray->rgsabound[0].cElements, resStr, required);

		if (required != copied)
		{
			SysFreeString(resStr);
			return E_FAIL;
		}

		retVal->bstrVal = resStr;
		return S_OK;
	}

	STDMETHOD(Invoke)(DISPID dispIdMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS *pDispParams, VARIANT *pVarResult,
		EXCEPINFO *pExcepInfo, UINT *puArgErr)
	{
		if (!pDispParams)
			return E_INVALIDARG;
		if (pDispParams->cArgs < 1)
			return DISP_E_BADPARAMCOUNT;
		
		IDispatch* disp = pDispParams->rgvarg[pDispParams->cArgs-1].pdispVal;
		switch (dispIdMember)
		{
		case DecodeID:
			{
				DISPPARAMS params = *pDispParams;
				if (params.cArgs != 1)
					return E_FAIL;

				return DecodeUTF8(params.rgvarg[0], pVarResult);
			}
			break;
		default:
			return DISP_E_UNKNOWNNAME;
		}
		return S_OK;
	}
};

typedef CComObject<UTF8Decoder> DecoderObjectType;
typedef CComPtr<DecoderObjectType> DecoderObjectPtr;

HRESULT UTF8DecoderMaker(DISPPARAMS& params, CComVariant& result)
{
	DecoderObjectType* pObj = nullptr;
	DecoderObjectType::CreateInstance(&pObj);
	DecoderObjectPtr objPtr(pObj);

	result.vt = VT_DISPATCH;
	result.pdispVal = objPtr;
	result.pdispVal->AddRef();

	return S_OK;
}
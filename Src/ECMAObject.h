#pragma once

#include "ECMAConvertion.h"
#include <dispex.h>
#include <cassert>

using namespace ATL;

template <class T, const IID* piid = &__uuidof(T), const GUID* plibid = &CAtlModule::m_libid, WORD wMajor = 1,
	WORD wMinor = 0, class tihclass = CComTypeInfoHolder>
class ATL_NO_VTABLE IECMADispatchExImpl : public T
{
	CComPtr<IDispatchEx> implObj_;
	CAtlMap<DISPID, DISPID> staticRemap_;

	CComPtr<ITypeInfo> typeInfo_;
	CAtlMap<DISPID, FUNCDESC*> dispIDMap_;
	
	HRESULT InitTypeInfoMap()
	{
		V_RET(GetTI(LOCALE_USER_DEFAULT, &typeInfo_));

		TYPEATTR * typeAttr = nullptr;
		V_RET(typeInfo_->GetTypeAttr(&typeAttr));

		FUNCDESC * funcDesc = nullptr;
		for (WORD i = 0; i < typeAttr->cFuncs; ++i)
		{
			if ( SUCCEEDED(typeInfo_->GetFuncDesc(i, &funcDesc)) )
			{
				if ( !(funcDesc->wFuncFlags & FUNCFLAG_FRESTRICTED) )
				{
					dispIDMap_.SetAt(funcDesc->memid, funcDesc);
				}
			}
		}
		typeInfo_->ReleaseTypeAttr(typeAttr);
		return S_OK;
	}

	HRESULT UninitTypeInfoMap()
	{
		if (typeInfo_ && dispIDMap_.GetCount())
		{
			POSITION pos = dispIDMap_.GetStartPosition();
			while (pos)
			{
				typeInfo_->ReleaseFuncDesc(dispIDMap_.GetValueAt(pos));
				dispIDMap_.GetNext(pos);
			}
			dispIDMap_.RemoveAll();
		}
		return S_OK;
	}

	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(StaticInvoke)( DISPID dispidMember, REFIID riid, LCID lcid, WORD wFlags, DISPPARAMS* pdispparams, VARIANT* pvarResult, EXCEPINFO* pexcepinfo, UINT* puArgErr )
	{
		FUNCDESC * desc = nullptr;
		if ( !dispIDMap_.Lookup(dispidMember, desc) )
			return DISP_E_MEMBERNOTFOUND;
		assert(desc);

		VARIANT * pParams = pdispparams->rgvarg;
		CAtlArray<VARIANT> paramStorage;
		if (pdispparams->cArgs != (ULONG)desc->cParams)
		{
			paramStorage.SetCount(desc->cParams);
			LONG offset = desc->cParams - (LONG)pdispparams->cArgs;
			LONG i = 0;
			for (; i < offset; ++i)
			{
				VariantInit(paramStorage.GetData() + i);
			}

			for (; i < (LONG)desc->cParams; ++i)
			{
				V_RET(VariantCopy(paramStorage.GetData() + i, pdispparams->rgvarg + i - offset));
			}
			
			pParams = paramStorage.GetData();
		}

		for (ULONG i = 0; i < (ULONG)desc->cParams; ++i)
		{
			V_RET(DataConvertion::ECMACvt(pParams[i], pParams[i], desc->lprgelemdescParam[desc->cParams-i-1].tdesc.vt));
		}

		DISPPARAMS params = { pParams, nullptr, desc->cParams, 0 };
		HRESULT hr = _tih.Invoke((IDispatchEx*)this, dispidMember, riid, lcid,
			wFlags, &params, pvarResult, pexcepinfo, puArgErr);

		for (ULONG i = 0; i < paramStorage.GetCount(); ++i)
		{
			VariantClear(paramStorage.GetData() + i);
		}

		return hr;
	}

public:
	HRESULT InitDispEx(CComPtr<IDispatchEx> implObj)
	{
		if (!implObj)
			return E_FAIL;

		implObj_ = implObj;

		V_RET(_tih.GetTI(LOCALE_USER_DEFAULT));

		for (int i = 0; i < _tih.m_nCount; ++i)
		{
			DISPID id;
			V_RET(implObj_->GetDispID(_tih.m_pMap[i].bstr, fdexNameEnsure, &id));
			staticRemap_.SetAt(id, _tih.m_pMap[i].id);
		}
		return S_OK;
	}

	typedef tihclass _tihclass;
	// IDispatch
	STDMETHOD(GetTypeInfoCount)(_Out_ UINT* pctinfo)
	{
		if (pctinfo == NULL) 
			return E_POINTER; 
		*pctinfo = 1;
		return S_OK;
	}
	STDMETHOD(GetTypeInfo)(
		_In_ UINT itinfo, 
		_In_ LCID lcid, 
		_Deref_out_ ITypeInfo** pptinfo)
	{
		return _tih.GetTypeInfo(itinfo, lcid, pptinfo);
	}
	STDMETHOD(GetIDsOfNames)(
		_In_ REFIID riid, 
		_In_count_(cNames) _Deref_pre_z_ LPOLESTR* rgszNames, 
		_In_ UINT cNames,
		_In_ LCID lcid, 
		_Out_ DISPID* rgdispid)
	{
		for (ULONG i = 0; i < cNames; ++i)
		{
			V_RET(implObj_->GetDispID(rgszNames[i], 0, &rgdispid[i]));
		}

		return S_OK;
	}
	STDMETHOD(Invoke)(
		_In_ DISPID dispidMember, 
		_In_ REFIID riid,
		_In_ LCID lcid, 
		_In_ WORD wFlags, 
		_In_ DISPPARAMS* pdispparams, 
		_Out_opt_ VARIANT* pvarResult,
		_Out_opt_ EXCEPINFO* pexcepinfo, 
		_Out_opt_ UINT* puArgErr)
	{
		DISPID staticId;
		if (staticRemap_.Lookup(dispidMember, staticId))
		{
			return StaticInvoke(staticId, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
		}
		else
		{
			return implObj_->InvokeEx(dispidMember, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, nullptr);
		}
	}

	// IDispatchEx
	STDMETHOD(GetDispID)(BSTR bstrName, DWORD grfdex, DISPID *pid)
	{
		if (!implObj_)
			return E_FAIL;

		return implObj_->GetDispID(bstrName, grfdex, pid);
	}

	STDMETHOD(InvokeEx)(DISPID id, LCID lcid, WORD wFlags, DISPPARAMS *pdp, VARIANT *pvarRes, EXCEPINFO *pei, IServiceProvider *pspCaller)
	{
		if (!implObj_)
			return E_FAIL;

		DISPID staticId;
		if (staticRemap_.Lookup(id, staticId))
		{
			return StaticInvoke(staticId, IID_NULL, lcid, wFlags, pdp, pvarRes, pei, nullptr);
		}
		else
		{
			return implObj_->InvokeEx(id, lcid, wFlags, pdp, pvarRes, pei, pspCaller);
		}
	}

	STDMETHOD(DeleteMemberByName)(BSTR bstrName, DWORD grfdex)
	{
		DISPID id;
		V_RET(GetDispID(bstrName, 0, &id));
		return DeleteMemberByDispID(id);
	}

	STDMETHOD(DeleteMemberByDispID)(DISPID id)
	{
		if ( !implObj_ )
			return E_FAIL;

		DISPID staticId;
		if (staticRemap_.Lookup(id, staticId))
		{
			return DISP_E_EXCEPTION;
		}
		else
		{
			return implObj_->DeleteMemberByDispID(id);
		}
	}

	STDMETHOD(GetMemberProperties)(DISPID id, DWORD grfdexFetch, DWORD *pgrfdex)
	{
		if (!implObj_)
			return E_FAIL;

		return implObj_->GetMemberProperties(id, grfdexFetch, pgrfdex);
	}

	STDMETHOD(GetMemberName)(DISPID id, BSTR *pbstrName)
	{
		if (!implObj_)
			return E_FAIL;

		return implObj_->GetMemberName(id, pbstrName);
	}

	STDMETHOD(GetNextDispID)(DWORD grfdex, DISPID id, DISPID *pid)
	{
		if (!implObj_)
			return E_FAIL;

		return implObj_->GetNextDispID(grfdex, id, pid);
	}

	STDMETHOD(GetNameSpaceParent)(IUnknown **ppunk)
	{
		if (!implObj_)
			return E_FAIL;

		return implObj_->GetNameSpaceParent(ppunk);
	}

#ifdef _ATL_DLL_IMPL
	// Do not cache type info if it is used in the ATL dll
	IECMADispatchExImpl() : _tih(piid, plibid, wMajor, wMinor)
	{
		InitTypeInfoMap();
	}
	virtual ~IECMADispatchExImpl()
	{
		UninitTypeInfoMap();
	}

protected:
	_tihclass _tih;
	HRESULT GetTI(
		_In_ LCID lcid, 
		_Deref_out_ ITypeInfo** ppInfo)
	{
		return _tih.GetTI(lcid, ppInfo);
	}

#else

	IECMADispatchExImpl()
	{
		InitTypeInfoMap();
	}

	virtual ~IECMADispatchExImpl()
	{
		UninitTypeInfoMap();
	}

protected:
	static _tihclass _tih;
	static HRESULT GetTI(
		_In_ LCID lcid, 
		_Deref_out_ ITypeInfo** ppInfo)
	{
		return _tih.GetTI(lcid, ppInfo);
	}

#endif
};

#ifndef _ATL_DLL_IMPL

template <class T, const IID* piid, const GUID* plibid, WORD wMajor, WORD wMinor, class tihclass>
typename IECMADispatchExImpl<T, piid, plibid, wMajor, wMinor, tihclass>::_tihclass
	IECMADispatchExImpl<T, piid, plibid, wMajor, wMinor, tihclass>::_tih =
{piid, plibid, wMajor, wMinor, NULL, 0, NULL, 0};

#endif
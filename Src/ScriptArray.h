#pragma once

#include <comutil.h>
#include <atlcom.h>

#include "ECMAConvertion.h"

using namespace ATL;

HRESULT CreateScriptArray(CComPtr<IDispatchEx> scriptContext, CComPtr<IDispatch>& scriptArray);
HRESULT ScriptArrayIsArray(CComPtr<IDispatch> scriptArray);
HRESULT ScriptArraySetLength(CComPtr<IDispatch> scriptArray, ULONG length);
HRESULT ScriptArrayGetLength(CComPtr<IDispatch> scriptArray, ULONG& length);
HRESULT ScriptArraySetAt(CComPtr<IDispatch> scriptArray, ULONG index, CComVariant& val);
HRESULT ScriptArrayGetAt(CComPtr<IDispatch> scriptArray, ULONG index, CComVariant& retVal);
HRESULT ScriptArrayAppend(CComPtr<IDispatch> scriptArray, CComVariant& val);
HRESULT ScriptArrayRemoveAt(CComPtr<IDispatch> scriptArray, ULONG index);

template <typename T>
class ScriptArray
{
public:

	HRESULT Init(CComPtr<IDispatchEx> scriptContext)
	{
		return CreateScriptArray(scriptContext, scriptArray_);
	}

	HRESULT Init(CComPtr<IDispatchEx> scriptContext, T* items, ULONG itemCount)
	{
		if (!items)
			return E_INVALIDARG;

		V_RET(CreateScriptArray(scriptContext, scriptArray_));
		V_RET(SetLength(itemCount));

		for (ULONG i = 0; i < itemCount; ++i)
		{
			V_RET(SetAt(i, items[i]));
		}
		return S_OK;
	}

	HRESULT Attach(CComPtr<IDispatch> scriptArray)
	{
		scriptArray_ = scriptArray;
		
		return S_OK;
	}

	HRESULT GetLength(ULONG& length)
	{
		return ScriptArrayGetLength(scriptArray_, length);
	}

	HRESULT SetLength(ULONG count)
	{
		return ScriptArraySetLength(scriptArray_, count);
	}

	HRESULT GetScriptArray(CComPtr<IDispatch>& arr)
	{
		if (!scriptArray_)
			return E_FAIL;
		arr = scriptArray_;
		return S_OK;
	}

	HRESULT Append(T val)
	{
		return ScriptArrayAppend(scriptArray_, CComVariant(val));
	}

	HRESULT SetAt(ULONG index, const T& val)
	{
		return ScriptArraySetAt(scriptArray_, index, CComVariant(val));
	}


	template <typename U>
	HRESULT CopyToNative(U* ptr, ULONG size)
	{
		if (!scriptArray_)
			return E_FAIL;

		ULONG len = 0;
		V_RET(GetLength(len));
		if (len != size)
			return E_INVALIDARG;

		if (len == 0)
			return S_OK;
		
		wchar_t buf[32] = {0};
		BSTR name = L"0";
		DISPPARAMS params = {0};
		for (ULONG i = 0; i < len; ++i)
		{
			CComVariant v;
			_itow(i, buf, 10);
			DISPID id;
			name = buf;

			V_RET(scriptArray_->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_INVARIANT, &id));
			V_RET(scriptArray_->Invoke(id, IID_NULL, LOCALE_INVARIANT, DISPATCH_PROPERTYGET, &params, &v, NULL, NULL));
			V_RET(DataConvertion::ECMACvt(ptr[i], v));
		}
		return S_OK;
	}

	HRESULT GetAt(ULONG index, T& retVal)
	{
		using namespace DataConvertion;

		CComVariant var;
		V_RET(ScriptArrayGetAt(scriptArray_, index, var));
		V_RET(ECMACvt(retVal, var));
		return S_OK;
	}

	HRESULT RemoveAt(ULONG index)
	{
		return ScriptArrayRemoveAt(scriptArray_, index);
	}

	HRESULT Detach()
	{
		scriptArray_ = nullptr;
		return S_OK;
	}

private:
	CComPtr<IDispatch> scriptArray_;
};
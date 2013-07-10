#include "stdafx.h"
#include "ScriptArray.h"
#include "PluginUtils.h"

HRESULT CreateScriptArray( CComPtr<IDispatchEx> scriptContext, CComPtr<IDispatch>& scriptArray )
{
	CComPtr<IDispatchEx> arr;

	V_RET(CreateJSObject(L"Array", scriptContext, arr));

	scriptArray = arr;
	return S_OK;
}

HRESULT ScriptArrayIsArray( CComPtr<IDispatch> scriptArray )
{
	ULONG l;
	return ScriptArrayGetLength(scriptArray, l);
}

HRESULT ScriptArraySetLength(CComPtr<IDispatch> scriptArray, ULONG length)
{
	if (!scriptArray)
		return E_INVALIDARG;

	return scriptArray.PutPropertyByName(L"length", &CComVariant(length));
}

HRESULT ScriptArrayGetLength(CComPtr<IDispatch> scriptArray, ULONG& length)
{
	if (!scriptArray)
		return E_INVALIDARG;

	CComVariant v;
	V_RET(scriptArray.GetPropertyByName(L"length", &v));

	V_RET(v.ChangeType(VT_UI4));
	length = v.ulVal;
	return S_OK;
}

HRESULT ScriptArraySetAt(CComPtr<IDispatch> scriptArray, ULONG index, CComVariant& val)
{
	if (!scriptArray)
		return E_INVALIDARG;

	wchar_t buf[32];
	_itow(index, buf, 10);

	CComQIPtr<IDispatchEx> dispEx(scriptArray);
	DISPID id;
	V_RET(dispEx->GetDispID(buf, fdexNameEnsure, &id));
	return scriptArray.PutPropertyByName(buf, &val);
}

HRESULT ScriptArrayGetAt(CComPtr<IDispatch> scriptArray, ULONG index, CComVariant& retVal)
{
	if (!scriptArray)
		return E_INVALIDARG;

	wchar_t buf[32];
	_itow(index, buf, 10);
	return scriptArray.GetPropertyByName(buf, &retVal);
}

HRESULT ScriptArrayAppend(CComPtr<IDispatch> scriptArray, CComVariant& v)
{
	if (!scriptArray)
		return E_INVALIDARG;

	return scriptArray.Invoke1(L"push", &v);
}

HRESULT ScriptArrayRemoveAt(CComPtr<IDispatch> scriptArray, ULONG index)
{
	if (!scriptArray)
		return E_INVALIDARG;

	return scriptArray.Invoke2(L"splice", &CComVariant(index), &CComVariant(1));
}


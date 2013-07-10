#include "stdafx.h"
#include "InvokeHelper.h"

using namespace ATL;

HRESULT InvokeHelper( CComPtr<IDispatch> obj, BSTR name, WORD wFlags, CComVariant& result )
{
	if (!obj || !name)
		return E_INVALIDARG;

	DISPPARAMS params = {0};
	DISPID dispId;
	V_RET(obj->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispId));
	return obj->Invoke(dispId, IID_NULL, LOCALE_USER_DEFAULT, wFlags, &params, &result, nullptr, nullptr);
}

HRESULT InvokeHelper( CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const CComVariant& arg0, CComVariant& result )
{
	if (!obj || !name)
		return E_INVALIDARG;

	DISPPARAMS params = {0};
	params.cArgs = 1;
	params.rgvarg = (VARIANT*)&arg0;
	DISPID dispId;
	V_RET(obj->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispId));
	return obj->Invoke(dispId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, &result, nullptr, nullptr);
}

HRESULT InvokeHelper( CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const CComVariant& arg0, const CComVariant& arg1, CComVariant& result )
{
	if (!obj || !name)
		return E_INVALIDARG;

	VARIANT args[2] = { arg0, arg1 };
	DISPPARAMS params = {0};
	params.cArgs = sizeof(args)/sizeof(args[0]);
	params.rgvarg = args;
	DISPID dispId;
	V_RET(obj->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispId));
	return obj->Invoke(dispId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, &result, nullptr, nullptr);
}

HRESULT InvokeHelper( CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const CComVariant& arg0, const CComVariant& arg1, const CComVariant& arg2, CComVariant& result )
{
	if (!obj || !name)
		return E_INVALIDARG;

	VARIANT args[] = { arg0, arg1, arg2 };
	DISPPARAMS params = {0};
	params.cArgs = sizeof(args)/sizeof(args[0]);
	params.rgvarg = args;
	DISPID dispId;
	V_RET(obj->GetIDsOfNames(IID_NULL, &name, 1, LOCALE_USER_DEFAULT, &dispId));
	return obj->Invoke(dispId, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_METHOD, &params, &result, nullptr, nullptr);
}


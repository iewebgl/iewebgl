#include "stdafx.h"
#include "PluginUtils.h"


HRESULT CreateJSObject(BSTR objType, CComPtr<IDispatchEx> scriptContext, CComPtr<IDispatchEx>& scriptObject )
{
	if (!scriptContext)
		return E_INVALIDARG;

	DISPID id;
	V_RET(scriptContext->GetDispID(objType, 0, &id));
	DISPPARAMS params = {NULL, NULL, 0, 0};
	CComVariant objConstructorVar;
	V_RET(scriptContext->InvokeEx(id, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &params, &objConstructorVar, NULL, NULL));

	if ( objConstructorVar.vt != VT_DISPATCH || objConstructorVar.pdispVal == nullptr)
		return E_FAIL;

	CComPtr<IDispatch> objConstructor(objConstructorVar.pdispVal);

	CComVariant objVar;
	V_RET(objConstructor->Invoke(DISPID_VALUE, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &objVar, NULL, NULL));

	if ( objVar.vt != VT_DISPATCH || objVar.pdispVal == nullptr)
		return E_FAIL;

	scriptObject = CComQIPtr<IDispatchEx>(objVar.pdispVal);
	if (!scriptObject)
		return E_FAIL;

	return S_OK;
}
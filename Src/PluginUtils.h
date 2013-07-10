#pragma once

using namespace ATL;

HRESULT CreateJSObject(BSTR objType, CComPtr<IDispatchEx> scriptContext, CComPtr<IDispatchEx>& scriptObject);
#pragma once

HRESULT InvokeHelper(ATL::CComPtr<IDispatch> obj, BSTR name, WORD wFlags, ATL::CComVariant& result);
HRESULT InvokeHelper(ATL::CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const ATL::CComVariant& arg0, ATL::CComVariant& result);
HRESULT InvokeHelper(ATL::CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const ATL::CComVariant& arg0, const ATL::CComVariant& arg1, ATL::CComVariant& result);
HRESULT InvokeHelper(ATL::CComPtr<IDispatch> obj, BSTR name, WORD wFlags, const ATL::CComVariant& arg0, const ATL::CComVariant& arg1, const ATL::CComVariant& arg2, ATL::CComVariant& result);
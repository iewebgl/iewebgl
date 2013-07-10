// Int8Array.cpp : Implementation of CInt8Array

#include "stdafx.h"
#include "Int8Array.h"

#include "TypedArrayMaker.h"

// CInt8Array

HRESULT CInt8Array::CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Int8ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CInt8Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Int8Array]");
	return S_OK;
}
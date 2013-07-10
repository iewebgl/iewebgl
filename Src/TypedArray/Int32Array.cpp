// Int32Array.cpp : Implementation of CInt32Array

#include "stdafx.h"
#include "Int32Array.h"

#include "TypedArrayMaker.h"
// CInt32Array


HRESULT CInt32Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Int32ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CInt32Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Int32Array]");
	return S_OK;
}
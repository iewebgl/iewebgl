// Int16Array.cpp : Implementation of CInt16Array

#include "stdafx.h"
#include "Int16Array.h"

#include "TypedArrayMaker.h"
// CInt16Array


HRESULT CInt16Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Int16ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CInt16Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Int16Array]");
	return S_OK;
}
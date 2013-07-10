// Uint16Array.cpp : Implementation of CUint16Array

#include "stdafx.h"
#include "Uint16Array.h"

#include "TypedArrayMaker.h"

// CUint16Array

HRESULT CUint16Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Uint16ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CUint16Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Uint16Array]");
	return S_OK;
}
// Uint8Array.cpp : Implementation of CUint8Array

#include "stdafx.h"
#include "Uint8Array.h"

#include "TypedArrayMaker.h"
// CUint8Array

HRESULT CUint8Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Uint8ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CUint8Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Uint8Array]");
	return S_OK;
}
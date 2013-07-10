// Uint32Array.cpp : Implementation of CUint32Array

#include "stdafx.h"
#include "Uint32Array.h"

#include "TypedArrayMaker.h"

// CUint32Array

HRESULT CUint32Array::CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Uint32ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CUint32Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Uint32Array]");
	return S_OK;
}
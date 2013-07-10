// Float32Array.cpp : Implementation of CFloat32Array

#include "stdafx.h"
#include "Float32Array.h"

#include "TypedArrayMaker.h"
// CFloat32Array


HRESULT CFloat32Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Float32ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CFloat32Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Float32Array]");
	return S_OK;
}
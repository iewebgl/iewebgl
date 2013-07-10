// Float64Array.cpp : Implementation of CFloat64Array

#include "stdafx.h"
#include "Float64Array.h"

#include "TypedArrayMaker.h"
// CFloat64Array


HRESULT CFloat64Array::CreateInstance( IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal )
{
	return CreateTypedArrayView<Float64ArrayType>(CComVariant(arrayBuffer), CComVariant(offset), CComVariant(length), retVal);
}

STDMETHODIMP CFloat64Array::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object Float64Array]");
	return S_OK;
}
// ArrayBuffer.cpp : Implementation of CArrayBuffer

#include "stdafx.h"
#include "ArrayBuffer.h"
#include "../JSObjectImpl.h"

// CArrayBuffer

CArrayBuffer::CArrayBuffer() : data_(nullptr), size_(0), ownMemory_(true)
{
}

CArrayBuffer::~CArrayBuffer()
{
	if (data_ && ownMemory_)
	{
		free(data_);
	}
	data_ = nullptr;
	size_ = 0;
}

HRESULT CArrayBuffer::Init(ULONG size)
{
	ownMemory_ = true;
	data_ = (BYTE*)calloc(size, 1);
	if ( !data_ )
		return E_OUTOFMEMORY;

	size_ = size;
	V_RET(InitDispEx());
	return S_OK;
}

HRESULT CArrayBuffer::Init(void* mem, ULONG size)
{
	ownMemory_ = false;
	data_ = (BYTE*)mem;
	if ( !data_ )
		return E_OUTOFMEMORY;

	size_ = size;
	V_RET(InitDispEx());
	return S_OK;
}


HRESULT CArrayBuffer::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}


STDMETHODIMP CArrayBuffer::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object ArrayBuffer]");
	return S_OK;
}

STDMETHODIMP CArrayBuffer::get_byteLength(ULONG* pVal)
{
	if (!pVal)
		return E_INVALIDARG;

	*pVal = size_;
	return S_OK;
}

STDMETHODIMP CArrayBuffer::get_mem(BYTE** pVal)
{
	if (!pVal)
		return E_INVALIDARG;

	*pVal = data_;
	return S_OK;
}

HRESULT CreateArrayBuffer(ULONG size, IArrayBufferPtr& retVal )
{
	ArrayBufferType * impl = nullptr;
	V_RET(ArrayBufferType::CreateInstance(&impl));
	ArrayBufferPtr buf(impl);

	V_RET(buf->Init(size));

	retVal = buf;
	return S_OK;
}

HRESULT CreateArrayBuffer(void * mem, ULONG size, IArrayBufferPtr& retVal )
{
	ArrayBufferType * impl = nullptr;
	V_RET(ArrayBufferType::CreateInstance(&impl));
	ArrayBufferPtr buf(impl);

	V_RET(buf->Init(mem, size));

	retVal = buf;
	return S_OK;
}

HRESULT ArrayBufferMaker( DISPPARAMS& params, CComVariant& result )
{
	if (params.cArgs < 1)
		return E_INVALIDARG;

	CComVariant var;

	V_RET(VariantChangeType(&var, &params.rgvarg[params.cArgs-1], 0, VT_UI4));

	IArrayBufferPtr buf;
	V_RET(CreateArrayBuffer(var.ulVal, buf));

	result = buf;
	return S_OK;
}


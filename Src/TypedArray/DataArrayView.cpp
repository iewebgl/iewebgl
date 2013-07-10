// DataArrayView.cpp : Implementation of CDataArrayView

#include "stdafx.h"
#include "DataArrayView.h"
#include "../JSObjectImpl.h"

#include "../ECMAConvertion.h"

#include <Winsock2.h>
#pragma comment(lib, "Ws2_32.lib")

// CDataArrayView

CDataArrayView::CDataArrayView() :
isModified_(FALSE)
{

}

CDataArrayView::~CDataArrayView()
{

}

HRESULT CDataArrayView::Init( IArrayBufferPtr array, const VARIANT& byteOffset, const VARIANT& length )
{
	if (!array)
	{
		return E_INVALIDARG;
	}

	ULONG newByteLength = 0;
	V_RET(array->get_byteLength(&newByteLength));
	const ULONG BufferByteLength = newByteLength;

	ULONG newByteOffset = 0;
	if (byteOffset.vt != VT_EMPTY)
	{
		CComVariant v(byteOffset);
		V_RET(v.ChangeType(VT_UI4));
		newByteOffset = v.ulVal;
	}

	if (newByteLength < newByteOffset)
	{
		return E_INVALIDARG;
	}

	newByteLength -= newByteOffset;

	if (length.vt != VT_EMPTY)
	{
		CComVariant v(length);
		V_RET(v.ChangeType(VT_UI4));
		newByteLength = v.ulVal;
	}


	if ( newByteOffset + newByteLength > BufferByteLength)
	{
		return E_INVALIDARG;
	}

	view_.reset(new View(array, newByteOffset, newByteLength, newByteLength));
	if (!view_)
		return E_OUTOFMEMORY;

	return S_OK;
}

HRESULT CDataArrayView::Init( const VARIANT& arg0, const VARIANT& arg1, const VARIANT& arg2 )
{
	if (arg0.vt == VT_DISPATCH)
	{
		if (!arg0.pdispVal)
			return E_INVALIDARG;

		V_RET(InitDispEx());

		CComQIPtr<IArrayBuffer> arrBuffer(arg0.pdispVal);
		if (arrBuffer)
		{
			IArrayBuffer * arrBuf = arrBuffer;
			return Init(arrBuf, arg1, arg2);
		}
	}

	return DISP_E_TYPEMISMATCH;
}

STDMETHODIMP CDataArrayView::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object DataView]");
	return S_OK;
}

STDMETHODIMP CDataArrayView::get_buffer( IArrayBuffer** retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	V_RET(view_->arrayBuffer_.CopyTo(retVal));
	return S_OK;
}

STDMETHODIMP CDataArrayView::get_byteOffset( ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = view_->byteOffset_;
	return S_OK;
}

STDMETHODIMP CDataArrayView::get_byteLength( ULONG* retVal )
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = view_->byteLength_;
	return S_OK;
}

STDMETHODIMP CDataArrayView::get_mem( byte** mem )
{
	if (!mem)
		return E_INVALIDARG;

	V_RET(view_->arrayBuffer_->get_mem(mem));

	*mem += view_->byteOffset_;
	return S_OK;
}

STDMETHODIMP CDataArrayView::get_modified(BOOL* retVal)
{
	if (!retVal)
		return E_INVALIDARG;

	*retVal = isModified_;
	return S_OK;
}

STDMETHODIMP CDataArrayView::put_modified(BOOL isModified)
{
	isModified_ = isModified;
	return S_OK;
}

STDMETHODIMP CDataArrayView::getInt8( ULONG byteOffset, char * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset >= view_->byteLength_)
		return E_INVALIDARG;

	*retVal = *(char*)(view_->mem_+byteOffset);
	return S_OK;
}

STDMETHODIMP CDataArrayView::getUint8( ULONG byteOffset, unsigned char * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset >= view_->byteLength_)
		return E_INVALIDARG;

	*retVal = *(unsigned char*)(view_->mem_+byteOffset);
	return S_OK;
}

STDMETHODIMP CDataArrayView::getInt16( ULONG byteOffset, VARIANT littleEndian, SHORT * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset + sizeof(*retVal) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	*retVal = *(SHORT*)(view_->mem_+byteOffset);
	if (!isLE)
	{
		*retVal = (SHORT)htons(*retVal);
	}
	
	return S_OK;
}

STDMETHODIMP CDataArrayView::getUint16( ULONG byteOffset, VARIANT littleEndian, USHORT * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset + sizeof(*retVal) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	*retVal = *(USHORT*)(view_->mem_+byteOffset);
	if (!isLE)
	{
		*retVal = htons(*retVal);
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::getInt32( ULONG byteOffset, VARIANT littleEndian, LONG * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset + sizeof(*retVal) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	*retVal = *(LONG*)(view_->mem_+byteOffset);
	if (!isLE)
	{
		*retVal = (LONG)htonl(*retVal);
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::getUint32( ULONG byteOffset, VARIANT littleEndian, ULONG * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset + sizeof(*retVal) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	*retVal = *(ULONG*)(view_->mem_+byteOffset);
	if (!isLE)
	{
		*retVal = htonl(*retVal);
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::getFloat32( ULONG byteOffset, VARIANT littleEndian, float * retVal )
{
	if (!retVal) return E_INVALIDARG;

	if (byteOffset + sizeof(*retVal) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	*retVal = *(float*)(view_->mem_+byteOffset);
	if (!isLE)
	{
		static_assert(sizeof(ULONG) == sizeof(float), "sizeof(float) != sizeof(unsigned long)");
		ULONG lv = htonl(*(ULONG*)retVal);
		*retVal = *(float*)&lv;
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::getFloat64( ULONG byteOffset, VARIANT littleEndian, double * retVal )
{
	return E_NOTIMPL;
}

STDMETHODIMP CDataArrayView::setInt8( ULONG byteOffset, VARIANT val )
{
	if (byteOffset >= view_->byteLength_)
		return E_INVALIDARG;

	V_RET(DataConvertion::ECMACvt(*(char*)(view_->mem_+byteOffset), val));

	return S_OK;
}

STDMETHODIMP CDataArrayView::setUint8( ULONG byteOffset, VARIANT val )
{
	if (byteOffset >= view_->byteLength_)
		return E_INVALIDARG;

	V_RET(DataConvertion::ECMACvt(*(unsigned char*)(view_->mem_+byteOffset), val));

	return S_OK;
}

STDMETHODIMP CDataArrayView::setInt16( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	if (byteOffset + sizeof(short) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	V_RET(DataConvertion::ECMACvt(*(SHORT*)(view_->mem_+byteOffset), val));
	if (!isLE)
	{
		*(SHORT*)(view_->mem_+byteOffset) = (SHORT)htons(*(SHORT*)(view_->mem_+byteOffset));
	}
	return S_OK;
}

STDMETHODIMP CDataArrayView::setUint16( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	if (byteOffset + sizeof(unsigned short) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	V_RET(DataConvertion::ECMACvt(*(USHORT*)(view_->mem_+byteOffset), val));
	if (!isLE)
	{
		*(USHORT*)(view_->mem_+byteOffset) = htons(*(USHORT*)(view_->mem_+byteOffset));
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::setInt32( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	if (byteOffset + sizeof(long) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	V_RET(DataConvertion::ECMACvt(*(LONG*)(view_->mem_+byteOffset), val));
	if (!isLE)
	{
		*(LONG*)(view_->mem_+byteOffset) = (LONG)htonl(*(LONG*)(view_->mem_+byteOffset));
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::setUint32( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	if (byteOffset + sizeof(unsigned long) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	V_RET(DataConvertion::ECMACvt(*(ULONG*)(view_->mem_+byteOffset), val));
	if (!isLE)
	{
		*(ULONG*)(view_->mem_+byteOffset) = htonl(*(ULONG*)(view_->mem_+byteOffset));
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::setFloat32( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	if (byteOffset + sizeof(float) > view_->byteLength_)
		return E_INVALIDARG;

	bool isLE = false;
	if (littleEndian.vt != VT_EMPTY && littleEndian.vt != VT_ERROR)
	{
		V_RET(VariantChangeType(&littleEndian, &littleEndian, 0, VT_BOOL));
		isLE = _variant_t(littleEndian);
	}

	V_RET(DataConvertion::ECMACvt(*(float*)(view_->mem_+byteOffset), val));
	if (!isLE)
	{
		static_assert(sizeof(ULONG) == sizeof(float), "sizeof(float) != sizeof(unsigned long)");
		*(ULONG*)(view_->mem_+byteOffset) = htonl(*(ULONG*)(view_->mem_+byteOffset));
	}

	return S_OK;
}

STDMETHODIMP CDataArrayView::setFloat64( ULONG byteOffset, VARIANT val, VARIANT littleEndian )
{
	return E_NOTIMPL;
}

HRESULT CDataArrayView::InitDispEx()
{
	if (dispEx_)
		return S_OK;

	JSObjectImpl * dispEx = nullptr;
	V_RET(::InitDispEx(_tih, this, 0, dispEx));
	dispEx_.Attach(dispEx);
	return S_OK;
}


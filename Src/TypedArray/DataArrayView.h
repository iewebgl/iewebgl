// DataArrayView.h : Declaration of the CDataArrayView

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "ArrayBuffer.h"

#include <memory>

using namespace ATL;

// CDataArrayView
class JSObjectImpl;

class ATL_NO_VTABLE CDataArrayView :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CDataArrayView, &CLSID_DataArrayView>,
	public IDispatchImpl<IDataArrayView, &IID_IDataArrayView, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
	struct View
	{
		View(IArrayBufferPtr arrayBuffer, ULONG byteOffset, ULONG byteLength, ULONG length) :
		arrayBuffer_(arrayBuffer),	byteOffset_(byteOffset), byteLength_(byteLength), length_(length), mem_(nullptr)
		{
			arrayBuffer_->get_mem(&mem_);
			mem_ += byteOffset;
		}

		IArrayBufferPtr arrayBuffer_;
		ULONG byteOffset_;
		ULONG byteLength_;
		ULONG length_;
		BYTE* mem_;
	};

	std::unique_ptr<View> view_;
	CAutoPtr<JSObjectImpl> dispEx_;
	BOOL isModified_;

	HRESULT Init( IArrayBufferPtr array, const VARIANT& byteOffset, const VARIANT& length );
	HRESULT InitDispEx();

public:
	CDataArrayView();
	~CDataArrayView();
	HRESULT Init(const VARIANT& arg0, const VARIANT& arg1, const VARIANT& arg2);

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IArrayBufferView
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(get_buffer)(IArrayBuffer** retVal);
	STDMETHOD(get_byteOffset)(ULONG* retVal);
	STDMETHOD(get_byteLength)(ULONG* retVal);
	STDMETHOD(get_mem)(byte** mem);
	STDMETHOD(get_modified)(BOOL* retVal);
	STDMETHOD(put_modified)(BOOL isModified);

	//////////////////////////////////////////////////////////////////////////
	// IDataArrayView
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(getInt8)(ULONG byteOffset, char * retVal);
	STDMETHOD(getUint8)(ULONG byteOffset, unsigned char * retVal);
	STDMETHOD(getInt16)(ULONG byteOffset, VARIANT littleEndian, SHORT * retVal);
	STDMETHOD(getUint16)(ULONG byteOffset, VARIANT littleEndian, USHORT * retVal);
	STDMETHOD(getInt32)(ULONG byteOffset, VARIANT littleEndian, LONG * retVal);
	STDMETHOD(getUint32)(ULONG byteOffset, VARIANT littleEndian, ULONG * retVal);
	STDMETHOD(getFloat32)(ULONG byteOffset, VARIANT littleEndian, float * retVal);
	STDMETHOD(getFloat64)(ULONG byteOffset, VARIANT littleEndian, double * retVal);

	STDMETHOD(setInt8)(ULONG byteOffset, VARIANT val);
	STDMETHOD(setUint8)(ULONG byteOffset, VARIANT val);
	STDMETHOD(setInt16)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);
	STDMETHOD(setUint16)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);
	STDMETHOD(setInt32)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);
	STDMETHOD(setUint32)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);
	STDMETHOD(setFloat32)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);
	STDMETHOD(setFloat64)(ULONG byteOffset, VARIANT val, VARIANT littleEndian);

BEGIN_COM_MAP(CDataArrayView)
	COM_INTERFACE_ENTRY(IDataArrayView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CDataArrayView> DataArrayViewType;
typedef CComPtr<DataArrayViewType> DataArrayViewPtr;
typedef CComPtr<IDataArrayView> IDataArrayViewPtr;


// Uint8Array.h : Declaration of the CUint8Array

#pragma once
#include "../resource.h"		// main symbols
#include "../IEWebGL_i.h"	// 

#include "TypedArrayView.h"

using namespace ATL;

// CUint8Array

class ATL_NO_VTABLE CUint8Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CUint8Array, &CLSID_Uint8Array>,
	public TypedArrayView<unsigned char, IDispatchImpl<IUint8Array, &IID_IUint8Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>>
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CUint8Array)
	COM_INTERFACE_ENTRY(IUint8Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CUint8Array> Uint8ArrayType;
typedef CComPtr<Uint8ArrayType> Uint8ArrayPtr;
typedef CComPtr<IUint8Array> IUint8ArrayPtr;

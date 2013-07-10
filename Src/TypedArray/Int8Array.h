// Int8Array.h : Declaration of the CInt8Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CInt8Array

class ATL_NO_VTABLE CInt8Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CInt8Array, &CLSID_Int8Array>,
	public TypedArrayView<char, IDispatchImpl<IInt8Array, &IID_IInt8Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CInt8Array)
	COM_INTERFACE_ENTRY(IInt8Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CInt8Array> Int8ArrayType;
typedef CComPtr<Int8ArrayType> Int8ArrayPtr;
typedef CComPtr<IInt8Array> IInt8ArrayPtr;




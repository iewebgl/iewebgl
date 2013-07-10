// Int32Array.h : Declaration of the CInt32Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CInt32Array

class ATL_NO_VTABLE CInt32Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CInt32Array, &CLSID_Int32Array>,
	public TypedArrayView<signed int, IDispatchImpl<IInt32Array, &IID_IInt32Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CInt32Array)
	COM_INTERFACE_ENTRY(IInt32Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CInt32Array> Int32ArrayType;
typedef CComPtr<Int32ArrayType> Int32ArrayPtr;
typedef CComPtr<IInt32Array> IInt32ArrayPtr;

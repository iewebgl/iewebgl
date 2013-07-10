// Int16Array.h : Declaration of the CInt16Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CInt16Array

class ATL_NO_VTABLE CInt16Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CInt16Array, &CLSID_Int16Array>,
	public TypedArrayView<signed short, IDispatchImpl<IInt16Array, &IID_IInt16Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CInt16Array)
	COM_INTERFACE_ENTRY(IInt16Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()
};

typedef CComObject<CInt16Array> Int16ArrayType;
typedef CComPtr<Int16ArrayType> Int16ArrayPtr;
typedef CComPtr<IInt16Array> IInt16ArrayPtr;

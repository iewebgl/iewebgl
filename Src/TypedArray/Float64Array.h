// Float64Array.h : Declaration of the CFloat64Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CFloat64Array

class ATL_NO_VTABLE CFloat64Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CFloat64Array, &CLSID_Float64Array>,
	public TypedArrayView<double, IDispatchImpl<IFloat64Array, &IID_IFloat64Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CFloat64Array)
	COM_INTERFACE_ENTRY(IFloat64Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};


typedef CComObject<CFloat64Array> Float64ArrayType;
typedef CComPtr<Float64ArrayType> Float64ArrayPtr;
typedef CComPtr<IFloat64Array> IFloat64ArrayPtr;






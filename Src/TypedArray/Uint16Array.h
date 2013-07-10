// Uint16Array.h : Declaration of the CUint16Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CUint16Array

class ATL_NO_VTABLE CUint16Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CUint16Array, &CLSID_Uint16Array>,
	public TypedArrayView<unsigned short, IDispatchImpl<IUint16Array, &IID_IUint16Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CUint16Array)
	COM_INTERFACE_ENTRY(IUint16Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CUint16Array> Uint16ArrayType;
typedef CComPtr<Uint16ArrayType> Uint16ArrayPtr;
typedef CComPtr<IUint16Array> IUint16ArrayPtr;

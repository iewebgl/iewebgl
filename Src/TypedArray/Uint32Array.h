// Uint32Array.h : Declaration of the CUint32Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CUint32Array

class ATL_NO_VTABLE CUint32Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CUint32Array, &CLSID_Uint32Array>,
	public TypedArrayView<unsigned int, IDispatchImpl<IUint32Array, &IID_IUint32Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CUint32Array)
	COM_INTERFACE_ENTRY(IUint32Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()


public:



};


typedef CComObject<CUint32Array> Uint32ArrayType;
typedef CComPtr<Uint32ArrayType> Uint32ArrayPtr;
typedef CComPtr<IUint32Array> IUint32ArrayPtr;


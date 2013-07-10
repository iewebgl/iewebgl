// Float32Array.h : Declaration of the CFloat32Array

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "TypedArrayView.h"

using namespace ATL;

// CFloat32Array

class ATL_NO_VTABLE CFloat32Array :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IProvideClassInfo2Impl<&CLSID_Float32Array, &IID_IFloat32Array, &LIBID_IEWebGLLib>,
	public CComCoClass<CFloat32Array, &CLSID_Float32Array>,
	public TypedArrayView<float, IDispatchImpl<IFloat32Array, &IID_IFloat32Array, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal);
public:

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CFloat32Array)
	COM_INTERFACE_ENTRY(IFloat32Array)
	COM_INTERFACE_ENTRY(ITypedArrayBufferView)
	COM_INTERFACE_ENTRY(IArrayBufferView)
	COM_INTERFACE_ENTRY(IProvideClassInfo)
	COM_INTERFACE_ENTRY(IProvideClassInfo2)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

};

typedef CComObject<CFloat32Array> Float32ArrayType;
typedef CComPtr<Float32ArrayType> Float32ArrayPtr;
typedef CComPtr<IFloat32Array> IFloat32ArrayPtr;






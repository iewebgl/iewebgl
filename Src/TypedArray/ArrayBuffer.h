// ArrayBuffer.h : Declaration of the CArrayBuffer

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

using namespace ATL;

// CArrayBuffer
class JSObjectImpl;

class ATL_NO_VTABLE CArrayBuffer :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CArrayBuffer, &CLSID_ArrayBuffer>,
	public IDispatchImpl<IArrayBuffer, &IID_IArrayBuffer, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>
{
public:
	CArrayBuffer();
	~CArrayBuffer();

BEGIN_COM_MAP(CArrayBuffer)
	COM_INTERFACE_ENTRY(IArrayBuffer)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

public:
	HRESULT Init(ULONG size);
	HRESULT Init(void* mem, ULONG size);

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IArrayBuffer
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(get_byteLength)(ULONG* pVal);
	STDMETHOD(get_mem)(BYTE** pVal);

private:
	HRESULT InitDispEx();

	CAutoPtr<JSObjectImpl> dispEx_;
	BYTE* data_;
	ULONG size_;
	bool ownMemory_;
};

typedef CComObject<CArrayBuffer> ArrayBufferType;
typedef CComPtr<ArrayBufferType> ArrayBufferPtr;
typedef CComPtr<IArrayBuffer> IArrayBufferPtr;

HRESULT CreateArrayBuffer(ULONG size, IArrayBufferPtr& retVal);
HRESULT CreateArrayBuffer(void * mem, ULONG size, IArrayBufferPtr& retVal);

HRESULT ArrayBufferMaker(DISPPARAMS& params, CComVariant& result);
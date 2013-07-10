// WebGLBuffer.h : Declaration of the CWebGLBuffer

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"
#include "WebGLObjectPointer.h"

using namespace ATL;

class CWebGLRenderingContext;
class CWebGLBuffer;

typedef CComObject<CWebGLBuffer> WebGLBufferType;
typedef WebGLObjectRefPtr<WebGLBufferType> WebGLBufferPtr;

class ATL_NO_VTABLE CWebGLBuffer :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLBuffer, &IID_IWebGLBuffer, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
protected:
	CWebGLBuffer();
	friend HRESULT CreateWebGLBuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLBufferPtr& retVal);

public:
	~CWebGLBuffer();
	typedef IWebGLBuffer MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLBuffer)
	COM_INTERFACE_ENTRY(IWebGLBuffer)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	void Bind(ULONG target);
	BOOL HasEverBeenBound() const { return hasEverBeenBound_; }

	void BufferData(ULONG target, ULONG usage, ULONG size, const BYTE* data);
	void BufferSubData(ULONG target, ULONG offset, ULONG size, const BYTE* data);
	BOOL HasData() const { return hasData_; }

	ULONG GetTarget() const { return target_; }
	ULONG GetMaxDataElement(ULONG type) const;
	ULONG GetParameter(ULONG pname) const;
	ULONG GetByteSize() const { return dataSize_; }

private:
	BOOL hasEverBeenBound_;
	ULONG hasData_;
	ULONG maxUByteDataElement_;
	ULONG maxUShortDataElement_;

	ULONG target_;
	ULONG usage_;
	ULONG dataSize_;
};

HRESULT CreateWebGLBuffer(CWebGLRenderingContext* ctx, ULONG name, WebGLBufferPtr& retVal);

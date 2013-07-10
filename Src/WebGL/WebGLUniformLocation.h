// WebGLUniformLocation.h : Declaration of the CWebGLUniformLocation

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"

using namespace ATL;

// CWebGLUniformLocation
class CWebGLProgram;

class ATL_NO_VTABLE CWebGLUniformLocation :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLUniformLocation, &IID_IWebGLUniformLocation, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
public:
	CWebGLUniformLocation();
	~CWebGLUniformLocation();

	typedef IWebGLUniformLocation MainInterface;

	HRESULT Init(CWebGLRenderingContext* ctx, CWebGLProgram* program, LONG loc);
	LONG Location() { return loc_; }
	CWebGLProgram* Program() { return program_; }
	ULONG ProgramGeneration() { return programGeneration_; }

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLUniformLocation)
	COM_INTERFACE_ENTRY(IWebGLUniformLocation)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

private:
	CWebGLProgram* program_;
	LONG loc_;
	ULONG programGeneration_;
};

typedef CComObject<CWebGLUniformLocation> WebGLUniformLocationType;
typedef WebGLObjectRefPtr<WebGLUniformLocationType> WebGLUniformLocationPtr;

HRESULT CreateWebGLUniformLocation( CWebGLRenderingContext* ctx, CWebGLProgram* program, LONG loc, WebGLUniformLocationPtr& retVal );
// WebGLProgram.h : Declaration of the CWebGLProgram

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"
#include "WebGLShader.h"
#include "WebGLUniformLocation.h"

#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>

#include <atlstr.h>
using namespace ATL;

class CWebGLProgram;

typedef CComObject<CWebGLProgram> WebGLProgramType;
typedef WebGLObjectRefPtr<WebGLProgramType> WebGLProgramPtr;

class ATL_NO_VTABLE CWebGLProgram :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLProgram, &IID_IWebGLProgram, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
	CWebGLProgram(const CWebGLProgram&);
	CWebGLProgram& operator=(const CWebGLProgram&);

protected:
	CWebGLProgram();
	friend HRESULT CreateWebGLProgram(CWebGLRenderingContext* ctx, ULONG name, WebGLProgramPtr& retVal);

public:
	~CWebGLProgram();

	static const size_t MaxShaderCount = 2;
	static const size_t VShader = 0;
	static const size_t FShader = 1;
	typedef IWebGLProgram MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLProgram)
	COM_INTERFACE_ENTRY(IWebGLProgram)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	void SetDeletePending();
	bool AttachShader(WebGLShaderPtr shader);
	bool DetachShader(WebGLShaderPtr shader);
	const WebGLShaderPtr* AttachedShaders();
	void DetachShaders();

	bool LinkStatus();
	bool HasDeletePending();
	void ClearDeletePending();

	bool HasBothShaderTypesAttached();
	void SetLinkStatus(bool status);
	void UpdateInfo();

	BOOL IsAttribInUse(ULONG i) const { return attribsInUse_[i]; }
	BOOL IsArrayName(const char * name);
	void GetUniformInfo(LONG location, bool& isArray, int& arrayIndex, int& arraySize);

	BOOL NextGeneration();
	ULONG Generation() { return progGeneration_; }


private:

	struct UniformLocationInfo
	{
		UniformLocationInfo(bool isArray = false, int arrayIndex = -1, int arraySize = 0) :
		isArray(isArray), arrayIndex(arrayIndex), arraySize(arraySize) {}

		bool isArray;
		int arrayIndex;
		int arraySize;
	};

	bool ContainsShader(WebGLShaderPtr shader);
	bool HasAttachedShaderOfType(ULONG shaderType);

	ULONG progGeneration_;
	bool deletePending_;
	bool linkStatus_;
	// attached shaders of the program object
	WebGLShaderPtr attachedShaders_[MaxShaderCount];
	
	// post-link data
	CAtlMap<ULONG, WebGLUniformLocationPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLUniformLocationType> > mapUniformLocations_;
	CAtlMap<LONG, UniformLocationInfo> uniformInfos_;

	LONG uniformMaxNameLength_;
	LONG attribMaxNameLength_;
	LONG uniformCount_;
	LONG attribCount_;
	CAtlArray<BOOL> attribsInUse_;
};

HRESULT CreateWebGLProgram( CWebGLRenderingContext* ctx, ULONG name, WebGLProgramPtr& retVal );

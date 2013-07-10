// WebGLShader.h : Declaration of the CWebGLShader

#pragma once
#include "../resource.h"       // main symbols
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"

#include <atlstr.h>
using namespace ATL;

// CWebGLShader

class CWebGLRenderingContext;

class ATL_NO_VTABLE CWebGLShader :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLShader, &IID_IWebGLShader, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
public:
	CWebGLShader();
	~CWebGLShader();

	typedef IWebGLShader MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLShader)
	COM_INTERFACE_ENTRY(IWebGLShader)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	//////////////////////////////////////////////////////////////////////////

	using WebGLObjectBase::Init;
	HRESULT Init(CWebGLRenderingContext* ctx, ULONG type, ULONG name);

	void SetShaderInfoLog(const char * log);
	const char * GetShaderInfoLog();

	void SetSource(const char * src);
	const char * GetSource();

	void SetNeedsTranslation(BOOL isCompiled);
	BOOL GetNeedsTranslation();

	void SetTranslationSuccess(BOOL isSuccessful);
	BOOL GetTranslationSuccess();

	void IncrementAttachCount();
	void DecrementAttachCount();

	ULONG ShaderType() { return type_; }
	ULONG AttachCount() { return attachCount_; } 

	virtual void Delete();
	bool IsDeleted();

	void ResetInfo();
	void AddActiveUniform(const char * name, int size, int type);
	bool IsArrayName(const char * name);
private:

	struct ActiveUniformInfo
	{
		CAtlStringA name;
		int size;
		int type;
	};

	CAtlArray<ActiveUniformInfo> activeUniforms_;

	ULONG attachCount_;
	BOOL needsTranslation_;
	BOOL translationSuccessful_;
	ULONG type_;
	_bstr_t shaderSource_;
	_bstr_t shaderInfoLog_;
};

typedef CComObject<CWebGLShader> WebGLShaderType;
typedef WebGLObjectRefPtr<WebGLShaderType> WebGLShaderPtr;

HRESULT CreateWebGLShader( CWebGLRenderingContext* ctx, ULONG type, ULONG name, WebGLShaderPtr& retVal );
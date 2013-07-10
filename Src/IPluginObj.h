#pragma once
#include <atlcom.h>
#include "WebGL/WebGLObjectPointer.h"

using namespace ATL;

class CWebGLTexture;
typedef CComObject<CWebGLTexture> WebGLTextureType;
typedef WebGLObjectRefPtr<WebGLTextureType> WebGLTexturePtr;

struct TexImageContext;

class IPluginObject : public IUnknown
{
public:
	virtual HWND GetHWND() = 0;
	STDMETHOD(Invalidate)() = 0;
	STDMETHOD(Log)(BSTR message, ULONG level) = 0;
	STDMETHOD(DispatchEvent)(BSTR eventType, BSTR details) = 0;
	STDMETHOD(GetScriptContext)(CComPtr<IDispatchEx>& retVal) = 0;
	STDMETHOD(GetCanvas)(CComPtr<IHTMLCanvasElement>& retVal) = 0;
	STDMETHOD(CreateJSObject)(CComPtr<IDispatchEx>& retVal) = 0;
	STDMETHOD(GetHTMLObjectData)(CComPtr<IDispatch> htmlObject, CAtlArray<BYTE>& pixelData, ULONG format, ULONG& width, ULONG& height) = 0;
	STDMETHOD(AsyncInitTexture)(CComPtr<IDispatch> htmlObject, const TexImageContext& ctx, CAtlArray<BYTE>& pixelData, BOOL& isAsync, ULONG& width, ULONG& height) = 0;
};
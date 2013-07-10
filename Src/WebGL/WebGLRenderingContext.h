// WebGLRenderingContext.h : Declaration of the CWebGLRenderingContext

#pragma once

#include "../resource.h"
#include "../IEWebGL_i.h"
#include "../IPluginObj.h"

#include "WebGLRCConstants.h"
#include "WebGLContextAttributes.h"
#include "WebGLShader.h"
#include "WebGLProgram.h"
#include "WebGLActiveInfo.h"
#include "WebGLShaderPrecisionFormat.h"
#include "WebGLUniformLocation.h"
#include "WebGLBuffer.h"
#include "WebGLTexture.h"
#include "WebGLRenderbuffer.h"
#include "WebGLFramebuffer.h"
#include "WebGLPrimaryFBO.h"

#include "../DrawUtils.h"

#include <EGL\egl.h>

using namespace ATL;

class JSObjectImpl;

class EnumValidator
{
	CAtlArray<ULONG> values_;
public:
	void AddValue(ULONG value);
	BOOL ValidateValue(ULONG value);
};

class ATL_NO_VTABLE CWebGLRenderingContext :
	public CComObjectRootEx<CComSingleThreadModel>,
	public CComCoClass<CWebGLRenderingContext, &CLSID_WebGLRenderingContext>,
	public WebGLContextConstants<IDispatchImpl<IWebGLRenderingContext, &IID_IWebGLRenderingContext, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> >
{
	typedef IDispatchImpl<IWebGLRenderingContext, &IID_IWebGLRenderingContext, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> DispBase;
public:
	CWebGLRenderingContext();
	~CWebGLRenderingContext();

	HRESULT Init(const VARIANT& attributes, IPluginObject* pluginObj, CComBSTR& errorMsg);
	void Uninit();
	BOOL IsContextLost() const;
	HRESULT ResetLostContext();
	HRESULT MakeCurrent();

	BOOL IsAlphaSurface() const { return isAlpha_; }
	BOOL IsPremultipliedContent() const { return isPremultiplied_; }
	BOOL IsPreserveDrawBuffer() const { return isPreserveDrawBuffer_; }

	ULONG GetPrimarySurfaceWidth() const;
	ULONG GetPrimarySurfaceHeight() const;
	IDirect3DSurface9* GetPrimarySurfaceD3DPtr();
	HRESULT ClearPrimarySurface();
	HRESULT ResizePrimarySurface(ULONG width, ULONG height);
	HRESULT SwapBuffers();

	BOOL CreateEGLSurface();
	BOOL DeleteEGLSurface();

	void Invalidate();

	ULONG GetGeneration() const { return generation_; }

	HRESULT GenerateError(const BSTR fmt = 0, ...);
	HRESULT GenerateError(ULONG error, const BSTR fmt = 0, ...);

	ULONG GetDepthStencilFormat() const { return depthStencilFormat_; }
	ULONG GetDepthFormat() const { return depthFormat_; }
	ULONG GetStencilFormat() const { return stencilFormat_; }

	WebGLTexturePtr GetBoundTexture(ULONG target) const;
	WebGLBufferPtr GetBoundBuffer(ULONG target) const;

	void CleanupOldResources();

BEGIN_COM_MAP(CWebGLRenderingContext)
	COM_INTERFACE_ENTRY(IWebGLRenderingContext)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

	//////////////////////////////////////////////////////////////////////////
	// IWebGLRenderingContext
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(get_canvas)(IDispatch** retVal);
	STDMETHOD(get_drawingBufferWidth)(ULONG* retVal);
	STDMETHOD(get_drawingBufferHeight)(ULONG* retVal);

    STDMETHOD(getContextAttributes)(IWebGLContextAttributes** retVal);
    STDMETHOD(isContextLost)(VARIANT* retVal);
    
    STDMETHOD(getSupportedExtensions)(IDispatch** retVal);
    STDMETHOD(getExtension)(BSTR name, IDispatch** retVal);

    STDMETHOD(activeTexture)(ULONG texture);
    STDMETHOD(attachShader)(IWebGLProgram* program, IWebGLShader* shader);
    STDMETHOD(bindAttribLocation)(IWebGLProgram* program, ULONG index, BSTR name);
    STDMETHOD(bindBuffer)(ULONG target, IWebGLBuffer* buffer);
    STDMETHOD(bindFramebuffer)(ULONG target, IWebGLFramebuffer* framebuffer);
    STDMETHOD(bindRenderbuffer)(ULONG target, IWebGLRenderbuffer* renderbuffer);
    STDMETHOD(bindTexture)(ULONG target, IWebGLTexture* texture);
    STDMETHOD(blendColor)(FLOAT red, FLOAT green, FLOAT blue, FLOAT alpha);
    STDMETHOD(blendEquation)(ULONG mode);
    STDMETHOD(blendEquationSeparate)(ULONG modeRGB, ULONG modeAlpha);
    STDMETHOD(blendFunc)(ULONG sfactor, ULONG dfactor);
    STDMETHOD(blendFuncSeparate)(ULONG srcRGB, ULONG dstRGB, 
                           ULONG srcAlpha, ULONG dstAlpha);

	STDMETHOD(bufferData)(ULONG target, VARIANT arg1, VARIANT arg2);
	STDMETHOD(bufferSubData)(ULONG target, LONG offset, IDispatch* data);

    STDMETHOD(checkFramebufferStatus)(ULONG target, ULONG* retVal);
    STDMETHOD(clear)(ULONG mask);
    STDMETHOD(clearColor)(FLOAT red, FLOAT green, FLOAT blue, FLOAT alpha);
    STDMETHOD(clearDepth)(FLOAT depth);
    STDMETHOD(clearStencil)(LONG s);
    STDMETHOD(colorMask)(BOOL red, BOOL green, BOOL blue, BOOL alpha);
    STDMETHOD(compileShader)(IWebGLShader* shader);

	STDMETHOD(compressedTexImage2D)(ULONG target, LONG level, ULONG internalformat,
                              LONG width, LONG height, LONG border,
                              IArrayBufferView* data);
	STDMETHOD(compressedTexSubImage2D)(ULONG target, LONG level,
                                 LONG xoffset, LONG yoffset,
                                 LONG width, LONG height, ULONG format,
                                 IArrayBufferView* data);

    STDMETHOD(copyTexImage2D)(ULONG target, LONG level, ULONG internalformat, 
                        LONG x, LONG y, LONG width, LONG height, 
                        LONG border);
    STDMETHOD(copyTexSubImage2D)(ULONG target, LONG level, LONG xoffset, LONG yoffset, 
                           LONG x, LONG y, LONG width, LONG height);

    STDMETHOD(createBuffer)(IWebGLBuffer** retVal);
    STDMETHOD(createFramebuffer)(IWebGLFramebuffer** retVal);
    STDMETHOD(createProgram)(IWebGLProgram** retVal);
    STDMETHOD(createRenderbuffer)(IWebGLRenderbuffer** retVal);
    STDMETHOD(createShader)(ULONG type, IWebGLShader** retVal);
    STDMETHOD(createTexture)(IWebGLTexture** retVal);

    STDMETHOD(cullFace)(ULONG face);

    STDMETHOD(deleteBuffer)(IWebGLBuffer* buffer);
    STDMETHOD(deleteFramebuffer)(IWebGLFramebuffer* framebuffer);
    STDMETHOD(deleteProgram)(IWebGLProgram* program);
    STDMETHOD(deleteRenderbuffer)(IWebGLRenderbuffer* renderbuffer);
    STDMETHOD(deleteShader)(IWebGLShader* shader);
    STDMETHOD(deleteTexture)(IWebGLTexture* texture);

    STDMETHOD(depthFunc)(ULONG func);
    STDMETHOD(depthMask)(BOOL flag);
    STDMETHOD(depthRange)(FLOAT zNear, FLOAT zFar);
    STDMETHOD(detachShader)(IWebGLProgram* program, IWebGLShader* shader);
    STDMETHOD(disable)(ULONG cap);
    STDMETHOD(disableVertexAttribArray)(ULONG index);
    STDMETHOD(drawArrays)(ULONG mode, LONG first, LONG count);
    STDMETHOD(drawElements)(ULONG mode, LONG count, ULONG type, LONG offset);

    STDMETHOD(enable)(ULONG cap);
    STDMETHOD(enableVertexAttribArray)(ULONG index);
    STDMETHOD(finish)();
    STDMETHOD(flush)();
    STDMETHOD(framebufferRenderbuffer)(ULONG target, ULONG attachment, 
                                 ULONG renderbuffertarget, 
                                 IWebGLRenderbuffer* renderbuffer);
    STDMETHOD(framebufferTexture2D)(ULONG target, ULONG attachment, ULONG textarget, 
                              IWebGLTexture* texture, LONG level);
    STDMETHOD(frontFace)(ULONG mode);

    STDMETHOD(generateMipmap)(ULONG target);

    STDMETHOD(getActiveAttrib)(IWebGLProgram* program, ULONG index, IWebGLActiveInfo** retVal);
    STDMETHOD(getActiveUniform)(IWebGLProgram* program, ULONG index, IWebGLActiveInfo** retVal);
    STDMETHOD(getAttachedShaders)(IWebGLProgram* program, IDispatch** retVal);

    STDMETHOD(getAttribLocation)(IWebGLProgram* program, BSTR name, LONG* retVal);

    STDMETHOD(getParameter)(ULONG pname, VARIANT* retVal);
    STDMETHOD(getBufferParameter)(ULONG target, ULONG pname, VARIANT* retVal);

    STDMETHOD(getError)(ULONG* retVal);

    STDMETHOD(getFramebufferAttachmentParameter)(ULONG target, ULONG attachment, 
                                          ULONG pname, VARIANT* retVal);
    STDMETHOD(getProgramParameter)(IWebGLProgram* program, ULONG pname, VARIANT* retVal);
    STDMETHOD(getProgramInfoLog)(IWebGLProgram* program, BSTR* retVal);
    STDMETHOD(getRenderbufferParameter)(ULONG target, ULONG pname, VARIANT* retVal);
    STDMETHOD(getShaderParameter)(IWebGLShader* shader, ULONG pname, VARIANT* retVal);
	STDMETHOD(getShaderPrecisionFormat)(ULONG shaderType, ULONG precisionType, IWebGLShaderPrecisionFormat** retVal);
    STDMETHOD(getShaderInfoLog)(IWebGLShader* shader, BSTR* retVal);

    STDMETHOD(getShaderSource)(IWebGLShader* shader, BSTR* retVal);

    STDMETHOD(getTexParameter)(ULONG target, ULONG pname, VARIANT* retVal);

    STDMETHOD(getUniform)(IWebGLProgram* program, IWebGLUniformLocation* location, VARIANT* retVal);

    STDMETHOD(getUniformLocation)(IWebGLProgram* program, BSTR name, IWebGLUniformLocation** retVal);

    STDMETHOD(getVertexAttrib)(ULONG index, ULONG pname, VARIANT* retVal);

    STDMETHOD(getVertexAttribOffset)(ULONG index, ULONG pname, LONG* retVal);

    STDMETHOD(hint)(ULONG target, ULONG mode);
    STDMETHOD(isEnabled)(ULONG cap, VARIANT* retVal);
    STDMETHOD(isBuffer)(IWebGLBuffer* buffer, VARIANT* retVal);
    STDMETHOD(isFramebuffer)(IWebGLFramebuffer* framebuffer, VARIANT* retVal);
	STDMETHOD(isProgram)(IWebGLProgram* program, VARIANT* retVal);
    STDMETHOD(isRenderbuffer)(IWebGLRenderbuffer* renderbuffer, VARIANT* retVal);
    STDMETHOD(isShader)(IWebGLShader* shader, VARIANT* retVal);
    STDMETHOD(isTexture)(IWebGLTexture* texture, VARIANT* retVal);
    STDMETHOD(lineWidth)(FLOAT width);
    STDMETHOD(linkProgram)(IWebGLProgram* program);
    STDMETHOD(pixelStorei)(ULONG pname, LONG param);
    STDMETHOD(polygonOffset)(FLOAT factor, FLOAT units);

    STDMETHOD(readPixels)(LONG x, LONG y, LONG width, LONG height, ULONG format, ULONG type, IArrayBufferView* pixels);

    STDMETHOD(renderbufferStorage)(ULONG target, ULONG internalformat, LONG width, LONG height);
    STDMETHOD(sampleCoverage)(FLOAT value, BOOL invert);
    STDMETHOD(scissor)(LONG x, LONG y, LONG width, LONG height);

    STDMETHOD(shaderSource)(IWebGLShader* shader, BSTR source);

    STDMETHOD(stencilFunc)(ULONG func, LONG ref, ULONG mask);
    STDMETHOD(stencilFuncSeparate)(ULONG face, ULONG func, LONG ref, ULONG mask);
    STDMETHOD(stencilMask)(ULONG mask);
    STDMETHOD(stencilMaskSeparate)(ULONG face, ULONG mask);
    STDMETHOD(stencilOp)(ULONG fail, ULONG zfail, ULONG zpass);
    STDMETHOD(stencilOpSeparate)(ULONG face, ULONG fail, ULONG zfail, ULONG zpass);

	STDMETHOD(texImage2D)(ULONG target, LONG level, ULONG internalformat, VARIANT arg0, VARIANT arg1, VARIANT arg2,
		VARIANT arg3, VARIANT arg4, VARIANT arg5);

    STDMETHOD(texParameterf)(ULONG target, ULONG pname, FLOAT param);
    STDMETHOD(texParameteri)(ULONG target, ULONG pname, LONG param);

	STDMETHOD(texSubImage2D)(ULONG target, LONG level, LONG xoffset, LONG yoffset, VARIANT arg0, VARIANT arg1, VARIANT arg2,
		VARIANT arg3, VARIANT arg4);

    STDMETHOD(uniform1f)(IWebGLUniformLocation* location, FLOAT x);
	STDMETHOD(uniform1fv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform1i)(IWebGLUniformLocation* location, LONG x);
	STDMETHOD(uniform1iv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform2f)(IWebGLUniformLocation* location, FLOAT x, FLOAT y);
	STDMETHOD(uniform2fv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform2i)(IWebGLUniformLocation* location, LONG x, LONG y);
	STDMETHOD(uniform2iv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform3f)(IWebGLUniformLocation* location, FLOAT x, FLOAT y, FLOAT z);
	STDMETHOD(uniform3fv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform3i)(IWebGLUniformLocation* location, LONG x, LONG y, LONG z);
	STDMETHOD(uniform3iv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform4f)(IWebGLUniformLocation* location, FLOAT x, FLOAT y, FLOAT z, FLOAT w);
	STDMETHOD(uniform4fv)(IWebGLUniformLocation* location, IDispatch* v);

    STDMETHOD(uniform4i)(IWebGLUniformLocation* location, LONG x, LONG y, LONG z, LONG w);
	STDMETHOD(uniform4iv)(IWebGLUniformLocation* location, IDispatch* v);

	STDMETHOD(uniformMatrix2fv)(IWebGLUniformLocation* location, BOOL transpose, IDispatch* value);
	STDMETHOD(uniformMatrix3fv)(IWebGLUniformLocation* location, BOOL transpose, IDispatch* value);
	STDMETHOD(uniformMatrix4fv)(IWebGLUniformLocation* location, BOOL transpose, IDispatch* value);

    STDMETHOD(useProgram)(IWebGLProgram* program);
    STDMETHOD(validateProgram)(IWebGLProgram* program);

    STDMETHOD(vertexAttrib1f)(ULONG indx, FLOAT x);
    STDMETHOD(vertexAttrib2f)(ULONG indx, FLOAT x, FLOAT y);
	STDMETHOD(vertexAttrib3f)(ULONG indx, FLOAT x, FLOAT y, FLOAT z);
	STDMETHOD(vertexAttrib4f)(ULONG indx, FLOAT x, FLOAT y, FLOAT z, FLOAT w);

	STDMETHOD(vertexAttrib1fv)(ULONG indx, IDispatch* v);
    STDMETHOD(vertexAttrib2fv)(ULONG indx, IDispatch* v);
    STDMETHOD(vertexAttrib3fv)(ULONG indx, IDispatch* v);
    STDMETHOD(vertexAttrib4fv)(ULONG indx, IDispatch* v);

    STDMETHOD(vertexAttribPointer)(ULONG indx, LONG size, ULONG type, BOOL normalized, LONG stride, LONG offset);

    STDMETHOD(__viewport)(LONG x, LONG y, LONG width, LONG height);

private:
	template <typename T, typename glFunc> friend HRESULT uniformV(
		IWebGLUniformLocation* location, IDispatch* v, T* data, glFunc func,
		ULONG count, CWebGLRenderingContext* ctx, const BSTR str);
	template <typename T, typename glFunc> friend HRESULT uniformMatrix(
		IWebGLUniformLocation* location, IDispatch* v, glFunc func,
		ULONG count, BOOL transpose, CWebGLRenderingContext* ctx, const BSTR str);
	template <typename glFunc> friend HRESULT vertexAttribV(
		ULONG indx, IDispatch* v, float* data, glFunc func, ULONG count,
		CWebGLRenderingContext* ctx);

	friend class CWebGLTexture;

	HRESULT InitDispEx();

	
	HRESULT CreateGLContext(BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, CComBSTR& errorMsg);
	HRESULT GetGLValues(CComBSTR& errorMsg);
	HRESULT CreatePrimaryFBO(BOOL alpha, BOOL depth, BOOL stencil, BOOL antialias, CComBSTR& errorMsg);
	HRESULT GetDepthStencilFormats(CComBSTR& errorMsg);
	HRESULT GetVendor();
	HRESULT SetupGLContext(CComBSTR& errorMsg);
	HRESULT ValidateGLContext(CComBSTR& errorMsg);

	void CreateProxyTextures();
	void DeleteProxyTextures();
	void BindProxyTextures();
	void UnbindProxyTextures();

	void CreateFakeVertexAttribBuffers();
	void DeleteFakeVertexAttribBuffers();
	void RebuildVertexAttrib0FakeBuffer(ULONG vertexCount);
	void RebuildVertexAttrib0ZeroBuffer(ULONG vertexCount);
	void DoFakeVertexAttrib0(ULONG vertexCount);
	void UndoFakeVertexAttrib0();
	CComPtr<IDispatch> GetCurrentVertexAttrib(ULONG index);

	HRESULT TryToCreateExtension(const BSTR name, CComPtr<IDispatch>& obj);
	BOOL IsExtensionEnabled(const BSTR name) const;

	HRESULT bufferDataImpl(ULONG target, LONG size, const BYTE* data, ULONG usage);
	HRESULT bufferSubDataImpl(ULONG target, LONG offset, LONG size, const BYTE* data);
	HRESULT texImage2DImpl(ULONG target, LONG level, ULONG internalformat, LONG width, LONG height,
		LONG border, ULONG format, ULONG type, const BYTE* pixels, ULONG byteLength);
	HRESULT texImage2DFromTypedArray(ULONG target, LONG level, ULONG internalformat,
		LONG width, LONG height, LONG border, ULONG format, ULONG type, CComPtr<IDispatch> pixels);
	HRESULT texImage2DFromJSObject(ULONG target, LONG level, ULONG internalformat,
		ULONG format, ULONG type, CComPtr<IDispatch> pixels);
	HRESULT texSubImage2DImpl(ULONG target, LONG level, LONG xoffset, LONG yoffset, 
		LONG width, LONG height, ULONG format, ULONG type, const BYTE* pixels, ULONG byteLength);
	HRESULT texSubImage2DFromTypedArray(ULONG target, LONG level, LONG xoffset, LONG yoffset,
		LONG width, LONG height, ULONG format, ULONG type, CComPtr<IDispatch> pixels);
	HRESULT texSubImage2DFromJSObject(ULONG target, LONG level, LONG xoffset, LONG yoffset,
		ULONG format, ULONG type, CComPtr<IDispatch> pixels);

	void GenerateInvalidGLenumError(ULONG value, const BSTR info);
	BOOL ValidateCapabilityEnum(ULONG cap, const BSTR info);
	BOOL ValidateBlendEquationEnum(ULONG value, const BSTR info);
	BOOL ValidateBlendFuncDstEnum(ULONG factor, const BSTR info);
	BOOL ValidateBlendFuncSrcEnum(ULONG factor, const BSTR info);
	BOOL ValidateBlendFuncEnumsCompatibility(ULONG sfactor, ULONG dfactor, const BSTR info);
	BOOL ValidateDrawModeEnum(ULONG mode, const BSTR info);
	BOOL ValidateFaceEnum(ULONG face, const BSTR info);
	BOOL ValidateComparisonEnum(ULONG target, const BSTR info);
	BOOL ValidateStencilOpEnum(ULONG action, const BSTR info);
	BOOL ValidateAttachmentEnum(ULONG attachment, const BSTR info);
	BOOL ValidateCullMode(ULONG mode, const BSTR info);
	BOOL ValidateAttribIndex(ULONG index, const BSTR info);
	BOOL ValidateAttribType(ULONG value, const BSTR info);
	BOOL ValidateBuffers(const BSTR info, ULONG& maxElementCount);
	BOOL ValidateBufferTarget(ULONG target, const BSTR info);
	BOOL ValidateBufferUsage(ULONG usage, const BSTR info);
	BOOL ValidateTextureFormat(ULONG format, const BSTR info);
	BOOL ValidateCompressedTextureFormat( ULONG format, const BSTR info);
	BOOL ValidateTextureType(ULONG type, const BSTR info);
	BOOL ValidateTextureFormatAndType(ULONG format, ULONG type, const BSTR info);
	BOOL ValidateTextureTarget(ULONG target, const BSTR info);
	BOOL ValidateTextureOpTarget(ULONG target, const BSTR info);
	BOOL ValidateTextureParameter(ULONG pname, const BSTR info);
	BOOL ValidateRenderbufferFormat(ULONG format, const BSTR info);
	BOOL ValidateBoundFramebufferStatus(const BSTR info);

	IPluginObject* pluginObj_;
	CAutoPtr<JSObjectImpl> dispEx_;

	enum Vendor
	{
		VendorIntel,
		VendorNVIDIA,
		VendorATI,
		VendorQualcomm,
		VendorOther
	};

	EGLContext eglCtx_;
	EGLDisplay eglDisplay_;
	EGLConfig eglConfig_;
	EGLSurface eglSurface_;
	CWebGLPrimaryFBO primaryFBO_;

	BOOL isAlpha_;
	BOOL isDepth_;
	BOOL isStencil_;
	BOOL isAntialias_;
	BOOL isPremultiplied_;
	BOOL isPreserveDrawBuffer_;
	BOOL isInitialResize_;

	Vendor vendor_;
	CAtlArray<ULONG> syntheticErrors_;
	WebGLContextAttributesPtr contextAttr_;

	ULONG proxyTexture2D_;
	ULONG proxyTextureCube_;

	ULONG depthStencilFormat_;
	ULONG depthFormat_;
	ULONG stencilFormat_;

	LONG stencilRef_;
	LONG stencilValueMask_;
	LONG stencilWriteMask_;

	LONG pixelStorePackAlignment_;
	LONG pixelStoreUnpackAlignment_;

	ULONG pixelStoreFlipY_;
	ULONG pixelStorePremultiplyAlpha_;
	ULONG pixelStoreColorspaceConversion_;

	LONG maxVertexAttribs_;
	LONG maxTextureUnits_;
	LONG maxTextureSize_;
	LONG maxRenderBufferSize_;
	LONG maxCubeMapTextureSize_;
	LONG maxTextureImageUnits_;
	LONG maxVertexTextureImageUnits_;
	LONG maxVaryingVectors_;
	LONG maxFragmentUniformVectors_;
	LONG maxVertexUniformVectors_;

	float vertexAttrib0Value_[4];
	float vertexAttrib0FakeBuferValue_[4];
	ULONG vertexAttrib0FakeBuffer_;
	ULONG vertexAttrib0FakeBufferSize_;
	ULONG vertexAttrib0ZeroBuffer_;
	ULONG vertexAttrib0ZeroBufferSize_;

	struct WebGLVertexAttrib
	{
		WebGLBufferPtr buffer;
		ULONG stride;
		ULONG size;
		ULONG byteOffset;
		ULONG type;
		BOOL enabled;
		BOOL normalized;

		WebGLVertexAttrib();
	}; 

	CAtlArray<WebGLVertexAttrib> attribBuffers_;

	CAtlArray<WebGLTexturePtr, CWebGLPtrElementTraits<WebGLTextureType> > uniformTextures_;

	ULONG activeTexture_;
	CAtlArray<WebGLTexturePtr, CWebGLPtrElementTraits<WebGLTextureType> > bound2DTextures_;
	CAtlArray<WebGLTexturePtr, CWebGLPtrElementTraits<WebGLTextureType> > boundCubeMapTextures_;

	WebGLBufferPtr boundArrayBuffer_;
	WebGLBufferPtr boundElementArrayBuffer_;
	WebGLProgramPtr currentProgram_;

	WebGLFramebufferPtr boundFramebuffer_;
	WebGLRenderbufferPtr boundRenderbuffer_; 
	ImageConverter pixelReader_;

	CAtlMap<ULONG, WebGLShaderPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLShaderType> >  mapShaders_;
	CAtlMap<ULONG, WebGLProgramPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLProgramType> > mapPrograms_;
	CAtlMap<ULONG, WebGLBufferPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLBufferType> > mapBuffers_;
	CAtlMap<ULONG, WebGLTexturePtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLTextureType> > mapTextures_;
	CAtlMap<ULONG, WebGLFramebufferPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLFramebufferType> > mapFramebuffers_;
	CAtlMap<ULONG, WebGLRenderbufferPtr, CElementTraits<ULONG>, CWebGLPtrElementTraits<WebGLRenderbufferType> > mapRenderbuffers_;

	CAtlArray<ULONG> compressedTexFormats_;

	EnumValidator validatorHint_;
	EnumValidator validatorTextureType_;
	CAtlMap<CComBSTR, CComPtr<IDispatch> > extensions_;

	ULONG generation_;
};

typedef CComObject<CWebGLRenderingContext> WebGLRenderingContextType;
typedef CComPtr<WebGLRenderingContextType> WebGLRenderingContextPtr;
typedef CComPtr<IWebGLRenderingContext> IWebGLRenderingContextPtr;

HRESULT CreateWebGLRenderingContext( const VARIANT& attributes, IPluginObject* plugin,
	CComBSTR& errorMsg, WebGLRenderingContextPtr& retVal );

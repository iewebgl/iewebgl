// WebGLTexture.h : Declaration of the CWebGLTexture

#pragma once
#include "../resource.h"
#include "../IEWebGL_i.h"

#include "WebGLObjectPointer.h"

using namespace ATL;

class CWebGLRenderingContext;
class CWebGLTexture;
struct TexImageContext;

typedef CComObject<CWebGLTexture> WebGLTextureType;
typedef WebGLObjectRefPtr<WebGLTextureType> WebGLTexturePtr;

struct TexImageContext
{
	WebGLTexturePtr texture;
	ULONG target;
	LONG level;
	ULONG internalFormat;
	LONG xoffset;
	LONG yoffset;
	ULONG width;
	ULONG height;
	LONG border;
	ULONG format;
	ULONG type;
	BOOL needFlipY;
	ULONG unpackAlignment;
	BOOL isSubImage;
};

class ATL_NO_VTABLE CWebGLTexture :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLTexture, &IID_IWebGLTexture, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public WebGLObjectBase
{
	typedef IDispatchImpl<IWebGLTexture, &IID_IWebGLTexture, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> DispBase;
protected:

	CWebGLTexture();
	friend HRESULT CreateWebGLTexture(CWebGLRenderingContext* ctx, ULONG name, WebGLTexturePtr& retVal);

public:
	~CWebGLTexture();

	struct MipLevelDesc
	{
		MipLevelDesc() : isDefined(FALSE), width(0), height(0), internalFormat(0), type(0) {}
		bool operator == (const MipLevelDesc& other) const;
		bool operator != (const MipLevelDesc& other) const;

		BOOL isDefined;
		ULONG width;
		ULONG height;
		ULONG internalFormat;
		ULONG type;
	};

	typedef IWebGLTexture MainInterface;

	//////////////////////////////////////////////////////////////////////////
	// IJSObject
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(toString)(BSTR* retVal);

BEGIN_COM_MAP(CWebGLTexture)
	COM_INTERFACE_ENTRY(IWebGLTexture)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
END_COM_MAP()

	void Bind(ULONG target);
	BOOL HasEverBeenBound() const { return hasEverBeenBound_; }

	void Image(ULONG target, LONG level, ULONG internalFormat, ULONG type, ULONG width, ULONG height);
	const MipLevelDesc& GetMipLevelDesc(ULONG level, ULONG face) const;
	ULONG GetMipLevelCount() const { return (ULONG)mipLevelDescs_.GetCount(); }
	BOOL GenerateMipMaps();
	BOOL IsComplete() const { return isComplete_; }
	BOOL IsCubeFacesCompatible() const;

	ULONG GetParameter(ULONG pname) const;
	void SetParameter(ULONG pname, ULONG value);

	ULONG GetWidth() const { return GetMipLevelCount() ? GetMipLevelDesc(0, 0).width : 0; }
	ULONG GetHeight() const { return GetMipLevelCount() ? GetMipLevelDesc(0, 0).height : 0; }
	ULONG GetInternalFormat() const { return GetMipLevelCount() ? GetMipLevelDesc(0, 0).internalFormat : 0; }

	void UploadData(const TexImageContext& ctx, const BYTE* data, ULONG dataSize);

private:
	BOOL hasEverBeenBound_;
	BOOL mipMapGenerated_;
	BOOL isComplete_;
	ULONG target_;
	ULONG facesCount_;
	ULONG mipLevelCount_;
	CAtlArray<MipLevelDesc> mipLevelDescs_;
	CAtlMap<ULONG, ULONG> parameters_;

	BOOL CheckComplete() const;
	void ResizeMipLevelDescs(ULONG mipLevelCount);
	void SetMipLevelDesc(ULONG level, ULONG face, const MipLevelDesc& desc);
};

HRESULT CreateWebGLTexture(CWebGLRenderingContext* ctx, ULONG name, WebGLTexturePtr& retVal);

// WebGLPlugin.h : Declaration of the CWebGLPlugin
#pragma once
#include "resource.h"       // main symbols
#include <atlctl.h>
#include "IEWebGL_i.h"

#include "IPluginObj.h"
#include "DrawUtils.h"
#include "WebGL/WebGLRenderingContext.h"

#include <dispex.h>
#include <utility>
#include <memory>
#include <dispex.h>

#include <d3d9.h>

#if defined(_WIN32_WCE) && !defined(_CE_DCOM) && !defined(_CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA)
#error "Single-threaded COM objects are not properly supported on Windows CE platform, such as\
 the Windows Mobile platforms that do not include full DCOM support. Define\
 _CE_ALLOW_SINGLE_THREADED_OBJECTS_IN_MTA to force ATL to support creating single-thread COM\
 object's and allow use of it's single-threaded COM object implementations. The threading model\
 in your rgs file was set to 'Free' as that is the only threading model supported in non DCOM Windows CE platforms."
#endif

using namespace ATL;


// CWebGLPlugin
class ATL_NO_VTABLE CWebGLPlugin :
	public CComObjectRootEx<CComSingleThreadModel>,
	public IDispatchImpl<IWebGLPlugin, &IID_IWebGLPlugin, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0>,
	public IOleControlImpl<CWebGLPlugin>,
	public IOleObjectImpl<CWebGLPlugin>,
	public IOleInPlaceActiveObjectImpl<CWebGLPlugin>,
	public IViewObjectExImpl<CWebGLPlugin>,
	public IViewObjectPresentNotify,
	public IOleInPlaceObjectWindowlessImpl<CWebGLPlugin>,
	public IPluginObject,
	public IObjectWithSiteImpl<CWebGLPlugin>,
	public IQuickActivateImpl<CWebGLPlugin>,
	public IObjectSafetyImpl<CWebGLPlugin, INTERFACESAFE_FOR_UNTRUSTED_CALLER | INTERFACESAFE_FOR_UNTRUSTED_DATA>,
	public CComCoClass<CWebGLPlugin, &CLSID_WebGLPlugin>,
	public CComControl<CWebGLPlugin>
{
	typedef IDispatchImpl<IWebGLPlugin, &IID_IWebGLPlugin, &LIBID_IEWebGLLib, /*wMajor =*/ 1, /*wMinor =*/ 0> DispImpl;
public:
	CWebGLPlugin();
	~CWebGLPlugin();

	DECLARE_PROTECT_FINAL_CONSTRUCT()
	HRESULT FinalConstruct() { return S_OK; }
	void FinalRelease();

DECLARE_OLEMISC_STATUS(OLEMISC_RECOMPOSEONRESIZE |
	OLEMISC_CANTLINKINSIDE |
	OLEMISC_INSIDEOUT |
	OLEMISC_ACTIVATEWHENVISIBLE |
	OLEMISC_SETCLIENTSITEFIRST
)

DECLARE_REGISTRY_RESOURCEID(IDR_WEBGLPLUGIN)

BEGIN_COM_MAP(CWebGLPlugin)
	COM_INTERFACE_ENTRY(IWebGLPlugin)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatch), dispEx_)
	COM_INTERFACE_ENTRY_AGGREGATE(__uuidof(IDispatchEx), dispEx_)
	COM_INTERFACE_ENTRY(IViewObjectEx)
	COM_INTERFACE_ENTRY(IViewObject2)
	COM_INTERFACE_ENTRY(IViewObject)
	COM_INTERFACE_ENTRY(IViewObjectPresentNotify)
	COM_INTERFACE_ENTRY(IOleInPlaceObjectWindowless)
	COM_INTERFACE_ENTRY(IOleInPlaceObject)
	COM_INTERFACE_ENTRY2(IOleWindow, IOleInPlaceObjectWindowless)
	COM_INTERFACE_ENTRY(IOleInPlaceActiveObject)
	COM_INTERFACE_ENTRY(IOleControl)
	COM_INTERFACE_ENTRY(IOleObject)
	COM_INTERFACE_ENTRY(IQuickActivate)
	COM_INTERFACE_ENTRY(IObjectWithSite)
	COM_INTERFACE_ENTRY_IID(IID_IObjectSafety, IObjectSafety)
END_COM_MAP()

BEGIN_PROP_MAP(CWebGLPlugin)
END_PROP_MAP()


BEGIN_MSG_MAP(CWebGLPlugin)
	MESSAGE_HANDLER(WM_CREATE, OnCreate)
	CHAIN_MSG_MAP(CComControl<CWebGLPlugin>)
END_MSG_MAP()
// Handler prototypes:
//  LRESULT MessageHandler(UINT uMsg, WPARAM wParam, LPARAM lParam, BOOL& bHandled);
//  LRESULT CommandHandler(WORD wNotifyCode, WORD wID, HWND hWndCtl, BOOL& bHandled);
//  LRESULT NotifyHandler(int idCtrl, LPNMHDR pnmh, BOOL& bHandled);

// IViewObjectEx
	DECLARE_VIEW_STATUS(VIEWSTATUS_DVASPECTTRANSPARENT)

// IWebGLPlugin
public:
	//////////////////////////////////////////////////////////////////////////
	HRESULT OnDrawAdvanced(ATL_DRAWINFO& di);
	STDMETHOD(SetObjectRects)(LPCRECT prcPos,LPCRECT prcClip);
	STDMETHOD(SetClientSite)( IOleClientSite* pClientSite );

	LRESULT OnCreate(UINT /*uMsg*/, WPARAM /*wParam*/, LPARAM /*lParam*/, BOOL& /*bHandled*/);

	//////////////////////////////////////////////////////////////////////////
	// context factory
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(get_width)(LONG * retVal);
	STDMETHOD(put_width)(VARIANT val);
	STDMETHOD(get_height)(LONG * retVal);
	STDMETHOD(put_height)(VARIANT val);
	STDMETHOD(toDataURL)(VARIANT mimeType, VARIANT quality, BSTR * retVal);
	STDMETHOD(getContext)(BSTR contextName, VARIANT contextAttributes, IWebGLRenderingContext** retVal);

	STDMETHOD(getNativeCanvas)(IDispatch** retVal);
	STDMETHOD(updateNativeCanvas)();

	//////////////////////////////////////////////////////////////////////////
	// IPluginObject
	//////////////////////////////////////////////////////////////////////////
	virtual HWND GetHWND()
	{
		return m_bWndLess ? nullptr : m_hWnd;
	}
	STDMETHOD(Invalidate)();
	STDMETHOD(Log)(BSTR message, ULONG level);
	STDMETHOD(DispatchEvent)(BSTR eventType, BSTR details);
	STDMETHOD(GetScriptContext)(CComPtr<IDispatchEx>& retVal);
	STDMETHOD(GetCanvas)(CComPtr<IHTMLCanvasElement>& retVal);
	STDMETHOD(CreateJSObject)(CComPtr<IDispatchEx>& retVal);
	STDMETHOD(GetHTMLObjectData)(CComPtr<IDispatch> htmlObject, CAtlArray<BYTE>& pixelData, ULONG format, ULONG& width, ULONG& height);
	STDMETHOD(AsyncInitTexture)(CComPtr<IDispatch> htmlObject, const TexImageContext& tex, CAtlArray<BYTE>& pixelData, BOOL& isAsync, ULONG& width, ULONG& height);

	

	//////////////////////////////////////////////////////////////////////////
	// IViewObjectPresentNotify
	//////////////////////////////////////////////////////////////////////////
	STDMETHOD(OnPreRender)(void);

private:
	typedef CBindStatusCallback<CWebGLPlugin, BINDF_ASYNCHRONOUS | BINDF_ASYNCSTORAGE |
		BINDF_NO_UI | BINDF_SILENTOPERATION | BINDF_FROMURLMON |
		BINDF_GETNEWESTVERSION | BINDF_PRAGMA_NO_CACHE | BINDF_PREFERDEFAULTHANDLER> Downloader;

	HRESULT CheckContextLost();
	BOOL deviceLostHandled_;

	HRESULT OnContextLost();
	HRESULT OnGDIContextReset();
	HRESULT OnDXContextReset();

	BOOL IsSameDomain( CComPtr<IDispatchEx> htmlWindow, CComBSTR url );
	HRESULT GetHostNameFromURL( CComBSTR url, CComBSTR& outHostName );
	HRESULT GetHTMLWindowHostName( CComPtr<IDispatchEx> htmlWindow, CComBSTR& outHostName );
	HRESULT GetHTMLWindowProtocol( CComPtr<IDispatchEx> htmlWindow, CComBSTR& outProtocol );

	struct GDIContext
	{
		HDC dc;
		HBITMAP dib;
		void* sectionBits;
	};

	struct DXContext
	{
		CComPtr<IViewObjectPresentSite> presentSite;
		CComPtr<IViewObjectPresentNotifySite> presentNotifySite;
		CComPtr<ISurfacePresenter> surfacePresenter;
		CComPtr<IDirect3DDevice9> d3dDevice;
	};

	BOOL CreateGDIContext();
	BOOL ResizeGDIContext(ULONG width, ULONG height);
	HRESULT PrepareGDISysMemSurf(CComPtr<IDirect3DDevice9> device, CComPtr<IDirect3DSurface9> srcSurf);
	BOOL CopyGDIFrame();
	BOOL DrawGDIContext(ATL_DRAWINFO& di);
	BOOL DestroyGDIContext();

	HRESULT CreateDXContext();
	HRESULT ResizeDXContext(ULONG width, ULONG height);
	HRESULT CopyDXFrame();
	HRESULT DrawDXContext();
	HRESULT DestroyDXContext();

	HRESULT AdjustDrawCtxSize();

	HRESULT InitDispEx();
	HRESULT CreateCanvas(BSTR canvasId, CComPtr<IHTMLCanvasElement>& retVal);
	HRESULT GetInnerCanvas(CComPtr<IHTMLCanvasElement>& retVal);
	HRESULT GetImageCanvas(CComPtr<IHTMLCanvasElement>& retVal);
	HRESULT DecodeDataURL( CComBSTR &imgURL, CAtlArray<BYTE>& pixelData, const TexImageContext& ctx, ULONG &width, ULONG &height, BOOL &isAsync );
		
	CComPtr<IDocumentEvent> GetDocEvent();
	CComPtr<IEventTarget> GetEventTarget();
	CComPtr<IHTMLObjectElement> GetHTMLObjectElement();
	CComPtr<IDispatchEx> GetHTMLWindow();

	ImageConverter imgConv_;

	CAutoPtr<JSObjectImpl> dispEx_;
	CComPtr<IHTMLCanvasElement> innerCanvas_;
	CComPtr<IHTMLCanvasElement> imageCanvas_;

	DXContext dxCtx_;
	GDIContext gdiCtx_;

	ULONG ctxWidth_;
	ULONG ctxHeight_;

	bool localContentAllowed_;
	bool invalidated_;
	RECT drawRect_;
	BOOL showBanner_;
	float bannerTop_;
	WebGLRenderingContextPtr glContext_;
};

OBJECT_ENTRY_AUTO(__uuidof(WebGLPlugin), CWebGLPlugin)
typedef CComObject<CWebGLPlugin> WebGLPluginType;
typedef CComPtr<WebGLPluginType> WebGLPluginPtr;

//////////////////////////////////////////////////////////////////////////

template <typename T, int Flags>
class CBindStatusCallbackWithHeaders :
	public CBindStatusCallback<T, Flags>,
	public IServiceProviderImpl<CBindStatusCallbackWithHeaders<T, Flags> >,
	public IHttpNegotiate
{
	typedef CBindStatusCallbackWithHeaders<T, Flags> ThisClassType;
	CAtlString origin_;
	CAtlString allowedOrigin_;

public:
	BEGIN_COM_MAP(ThisClassType)
		COM_INTERFACE_ENTRY(IBindStatusCallback)
		COM_INTERFACE_ENTRY(IServiceProvider)
		COM_INTERFACE_ENTRY(IHttpNegotiate)
	END_COM_MAP()

	BEGIN_SERVICE_MAP(ThisClassType)
		SERVICE_ENTRY(IID_IHttpNegotiate)
	END_SERVICE_MAP()

	void SetCORSOrigin(const CAtlString& origin) { origin_ = origin; }
	const CAtlString& GetCORSAllowedOrigin() const { return allowedOrigin_; }

	/***/
	STDMETHOD(BeginningTransaction)(LPCWSTR szURL, LPCWSTR szHeaders, DWORD dwReserved, LPWSTR *pszAdditionalHeaders)
	{
		if (origin_.GetLength() > 0)
		{
			if (!pszAdditionalHeaders)
				return E_INVALIDARG;

			CAtlStringW addHeaders;
			addHeaders = L"Origin: " + origin_ + L"\r\n";
			auto memSize = (addHeaders.GetLength()+1)*sizeof(addHeaders[0]);
			auto comMem = CoTaskMemAlloc( memSize );
			if (!comMem)
			{
				return E_OUTOFMEMORY;
			}

			memcpy(comMem, addHeaders.GetBuffer(), memSize );
			*pszAdditionalHeaders = (LPWSTR)comMem;
		}

		return S_OK;
	}
	STDMETHOD(OnResponse)(DWORD dwResponseCode, LPCWSTR szResponseHeaders, LPCWSTR szRequestHeaders, LPWSTR *pszAdditionalRequestHeaders)
	{
		CAtlString headers(szResponseHeaders);
		wchar_t headerTag[] = L"Access-Control-Allow-Origin: ";
		int headerTagLength = sizeof(headerTag)/sizeof(headerTag[0]) - 1;

		auto headerStart = headers.Find(headerTag);
		if (headerStart >= 0)
		{
			auto headerEnd = headers.Find(L"\r\n", headerStart);
			if (headerEnd == -1)
				headerEnd = headers.GetLength();

			headerStart += headerTagLength;
			allowedOrigin_ = headers.Mid(headerStart, headerEnd-headerStart);
			allowedOrigin_.Trim();
		}
		return S_OK;
	}
};

class TextureDownloader : public CComObjectRootEx<CComSingleThreadModel>, public IUnknown
{
	typedef CBindStatusCallback<TextureDownloader, BINDF_ASYNCHRONOUS | BINDF_ASYNCSTORAGE |
		BINDF_NO_UI | BINDF_SILENTOPERATION | BINDF_FROMURLMON | BINDF_FWD_BACK | BINDF_PREFERDEFAULTHANDLER> DownloaderBase;

	typedef CBindStatusCallbackWithHeaders<TextureDownloader, BINDF_ASYNCHRONOUS | BINDF_ASYNCSTORAGE |
		BINDF_NO_UI | BINDF_SILENTOPERATION | BINDF_FROMURLMON | BINDF_FWD_BACK | BINDF_PREFERDEFAULTHANDLER> Downloader;

protected:
	TextureDownloader();
public:

	BEGIN_COM_MAP(TextureDownloader)
	END_COM_MAP()

	HRESULT Init( const TexImageContext& ctx);
	HRESULT Init( const TexImageContext& ctx, BSTR url, IOleClientSite* site);
	void SetDataStorage(CAtlArray<BYTE>* storage) { pixelData_ = storage; }
	BOOL IsInProgress() { return isInProgress_; }
	ULONG GetWidth() { return width_; }
	ULONG GetHeight() { return height_; }
	HRESULT AppendData(BYTE* pBytes, DWORD dwSize);
	void SetRequestOrigin(const CAtlString& origin) { requestOrigin_ = origin; }
	
private:

	TexImageContext ctx_;
	CAtlArray<BYTE> bytes_;
	CAtlArray<BYTE>* pixelData_;
	CAtlString requestOrigin_;
	CAtlString allowedOrigin_;
	ULONG width_;
	ULONG height_;
	BOOL isInProgress_;

	void OnDataAvailable(DownloaderBase* pbsc, BYTE* pBytes, DWORD dwSize);
	HRESULT Decode();
};

typedef CComObject<TextureDownloader> TextureDownloaderType;
typedef CComPtr<TextureDownloaderType> TextureDownloaderPtr;
// dllmain.h : Declaration of module class.

class CIEWebGLModule : public ATL::CAtlDllModuleT< CIEWebGLModule >
{
public :
	DECLARE_LIBID(LIBID_IEWebGLLib)
	DECLARE_REGISTRY_APPID_RESOURCEID(IDR_IEWEBGL, "{72E1BD71-29E1-4371-A8B6-AF64A9D04E74}")
};

extern class CIEWebGLModule _AtlModule;

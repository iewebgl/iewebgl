// dllmain.cpp : Implementation of DllMain.

#include "stdafx.h"
#include "resource.h"
#include "IEWebGL_i.h"
#include "dllmain.h"
#include "xdlldata.h"

#include "TlsData.h"

#include <GLSLANG/ShaderLang.h>

CIEWebGLModule _AtlModule;

extern BOOL WINAPI DllMainEGL(HINSTANCE instance, DWORD reason, LPVOID reserved);
extern BOOL WINAPI DllMainGLES(HINSTANCE instance, DWORD reason, LPVOID reserved);

// DLL Entry Point
extern "C" BOOL WINAPI DllMain(HINSTANCE hInstance, DWORD dwReason, LPVOID lpReserved)
{
	int tmp = _CrtSetDbgFlag(_CRTDBG_REPORT_FLAG);
	tmp |= _CRTDBG_LEAK_CHECK_DF;
	_CrtSetDbgFlag(tmp);
	//_CrtSetBreakAlloc(21);


#ifdef _MERGE_PROXYSTUB
	if (!PrxDllMain(hInstance, dwReason, lpReserved))
		return FALSE;
#endif

	if ( !DllMainEGL(hInstance, dwReason, lpReserved) )
		return FALSE;

	if ( !DllMainGLES(hInstance, dwReason, lpReserved) )
		return FALSE;
	
	if ( DLL_PROCESS_ATTACH == dwReason )
	{
		g_TlsIdx = TlsAlloc();
		if (TLS_OUT_OF_INDEXES == g_TlsIdx)
			return FALSE;

		if ( ShInitialize() == 0 )
			return FALSE;

		/* need to initialize TLS data here, because THREAD_ATTACH will not be called for this thread,*/
		if ( !DllMain(hInstance, DLL_THREAD_ATTACH, lpReserved) )
			return FALSE;
	}
	else if ( DLL_PROCESS_DETACH == dwReason )
	{
		/* deinitialize TLS data here */
		if ( !DllMain(hInstance, DLL_THREAD_DETACH, lpReserved) )
			return FALSE;

		ClearTLSData(); // clear TLS data from terminated threads, for which system does not call DllMain with THREAD_DETACH
		TlsFree(g_TlsIdx);
		g_TlsIdx = ~0u;

		if ( ShFinalize() == 0 )
			return FALSE;
	}
	else if ( DLL_THREAD_ATTACH == dwReason )
	{
		AppendTLSData();
	}
	else if ( DLL_THREAD_DETACH == dwReason )
	{
		DeleteTLSData();
	}

	return _AtlModule.DllMain(dwReason, lpReserved); 
}

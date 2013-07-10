#include "stdafx.h"
#include "TlsData.h"

DWORD g_TlsIdx = ~0u;
ATL::CAtlArray<TlsData*> g_TlsDataArray;
ATL::CComAutoCriticalSection g_TlsDataArrayCS;


TlsData::TlsData() :
clientSite(nullptr),
nativeArrayBuffer(nullptr),
ieWebGLArrayBuffer(nullptr),
uint8Array(nullptr),
int8Array(nullptr),
uint16Array(nullptr),
int16Array(nullptr),
uint32Array(nullptr),
int32Array(nullptr),
float32Array(nullptr),
float64Array(nullptr)
{

}

TlsData::~TlsData()
{

}

void AppendTLSData()
{
	if ( TlsGetValue(g_TlsIdx) != nullptr )
		return;

	TlsData * tlsData = new TlsData();
	TlsSetValue(g_TlsIdx, tlsData);

	{
		ATL::CComCritSecLock<ATL::CComAutoCriticalSection> lock(g_TlsDataArrayCS);
		g_TlsDataArray.Add(tlsData);
	}
}

void DeleteTLSData()
{
	TlsData * tlsData = (TlsData *)TlsGetValue(g_TlsIdx);
	if (tlsData)
		delete tlsData;
	TlsSetValue(g_TlsIdx, nullptr);

	{
		ATL::CComCritSecLock<ATL::CComAutoCriticalSection> lock(g_TlsDataArrayCS);

		size_t i = 0;
		while (i < g_TlsDataArray.GetCount())
		{
			if ( g_TlsDataArray[i] == tlsData )
			{
				g_TlsDataArray.RemoveAt(i);
				break;
			}
			++i;
		}
	}
}

void ClearTLSData()
{
	ATL::CComCritSecLock<ATL::CComAutoCriticalSection> lock(g_TlsDataArrayCS);

	for (size_t i = 0; i < g_TlsDataArray.GetCount(); ++i)
	{
		delete g_TlsDataArray[i];
	}
	g_TlsDataArray.RemoveAll();
}
#pragma once

extern DWORD g_TlsIdx;
const size_t NativeArrayBufferSize = 16*1024*1024;

struct IDispatch;
struct IOleClientSite;
struct IArrayBuffer;

struct TlsData
{
	TlsData();
	~TlsData();

	IOleClientSite* clientSite;
	IDispatch* nativeArrayBuffer;
	IArrayBuffer* ieWebGLArrayBuffer;
	IDispatch* uint8Array;
	IDispatch* int8Array;
	IDispatch* uint16Array;
	IDispatch* int16Array;
	IDispatch* uint32Array;
	IDispatch* int32Array;
	IDispatch* float32Array;
	IDispatch* float64Array;
};

void AppendTLSData();
void DeleteTLSData();
void ClearTLSData();
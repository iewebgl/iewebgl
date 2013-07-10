#pragma once
#include <comdef.h>
#include <windows.h>
#include <d3d9.h>
#include <d3dx9.h>

#include <atlcomcli.h>


class ImageConverter
{
	ATL::CComPtr<IDirect3DVertexBuffer9> vb_;
	ATL::CComPtr<IDirect3DVertexDeclaration9> vDecl_;
	ATL::CComPtr<IDirect3DSurface9> nonMultisampledRTSurface_;
	ATL::CComPtr<IDirect3DSurface9> offscreenSurface_;
	ATL::CComPtr<IDirect3DTexture9> flipTex_;

	ATL::CComPtr<ID3DXEffect> effect_;
	BOOL hwPremultiply_;

public:
	ImageConverter();

	HRESULT Init();
	HRESULT Resize(ULONG width, ULONG height);
	void Destroy();
	HRESULT GPUPremultiply(IDirect3DSurface9* surf);
	HRESULT GPUBlit(IDirect3DSurface9* dest, IDirect3DSurface9* src, BOOL flipY);
	HRESULT ReadBackPixels(IDirect3DSurface9* surf, BYTE* outData, ULONG outDataByteSize, BOOL premultiply, BOOL flipY = FALSE, BOOL bgra = FALSE);
};
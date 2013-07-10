#pragma once
#include "WebGLRCConstants.h"

namespace MultiplyOp
{
	enum Op
	{
		None,
		Premultiply,
		Unmultiply,
		Count
	};
};

MultiplyOp::Op GetMultiplyOp(BOOL srcPremultiplied, BOOL dstPremultiplied);

namespace TexelFormat
{
	enum Format
	{
		None,
		A8,
		R8,
		RA88,
		RGB565,
		RGB888,
		BGR888,
		RGBA4444,
		RGBA5551,
		RGBA8888,
		BGRA8888,
		BGRX8888,
		A32F,
		R32F,
		RA32F,
		RGB32F,
		RGBA32F,
		D16,
		S8,
		D24S8,
		Count
	};
};

TexelFormat::Format GetTexelFormat(ULONG format, ULONG type);
TexelFormat::Format GetTexelFormat(ULONG renderbufferFormat);
BOOL HasAlphaChannel(ULONG glFormat);

ULONG GetRedChannelBits(TexelFormat::Format format);
ULONG GetGreenChannelBits(TexelFormat::Format format);
ULONG GetBlueChannelBits(TexelFormat::Format format);
ULONG GetAlphaChannelBits(TexelFormat::Format format);
ULONG GetDepthBits(TexelFormat::Format format);
ULONG GetStencilBits(TexelFormat::Format format);

ULONG GetTexelByteSize(TexelFormat::Format format);
ULONG GetAlignedRowByteSize(ULONG width, TexelFormat::Format format, ULONG alignment);
ULONG GetAlignedImageByteSize(ULONG width, ULONG height, TexelFormat::Format format, ULONG alignment);



BOOL ConvertImage(ULONG width, ULONG height, MultiplyOp::Op multipliedOp, ULONG unpackAlignment, BOOL flipY,
	TexelFormat::Format srcFormat, const BYTE* srcData, TexelFormat::Format dstFormat, BYTE* dstData);

BOOL ConvertImageExt( ULONG width, ULONG height, MultiplyOp::Op multipliedOp, ULONG srcStride, ULONG unpackAlignment, BOOL flipY,
	TexelFormat::Format srcFormat, const BYTE* srcData, TexelFormat::Format dstFormat, BYTE* dstData);

void FlipYImage(ULONG width, ULONG height, TexelFormat::Format format, ULONG unpackAlignment, BYTE* data);

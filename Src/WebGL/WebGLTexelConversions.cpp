#include "stdafx.h"
#include "WebGLTexelConversions.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"

typedef void (*Unpacker)(const BYTE* srcData, BYTE* dstData);
typedef void (*Packer)(const BYTE* srcData, BYTE* dstData);

MultiplyOp::Op GetMultiplyOp( BOOL srcPremultiplied, BOOL dstPremultiplied )
{
	if (!srcPremultiplied && dstPremultiplied)
		return MultiplyOp::Premultiply;
	if (srcPremultiplied && !dstPremultiplied)
		return MultiplyOp::Unmultiply;
	return MultiplyOp::None;
}

TexelFormat::Format GetTexelFormat( ULONG format, ULONG type )
{
	switch(type)
	{
	case GL_FLOAT:
		switch (format)
		{
		case GL_ALPHA: return TexelFormat::A32F;
		case GL_LUMINANCE: return TexelFormat::R32F;
		case GL_LUMINANCE_ALPHA: return TexelFormat::RA32F;
		case GL_RGB: return TexelFormat::RGB32F;
		case GL_RGBA: return TexelFormat::RGBA32F;
		default: return TexelFormat::None;
		}
	case GL_UNSIGNED_BYTE:
		switch (format)
		{
		case GL_ALPHA: return TexelFormat::A8;
		case GL_LUMINANCE: return TexelFormat::R8;
		case GL_LUMINANCE_ALPHA: return TexelFormat::RA88;
		case GL_RGB: return TexelFormat::RGB888;
		case GL_RGBA: return TexelFormat::RGBA8888;
		default: return TexelFormat::None;
		}
	case GL_UNSIGNED_SHORT_5_6_5: return (format == GL_RGB) ? TexelFormat::RGB565 : TexelFormat::None;
	case GL_UNSIGNED_SHORT_4_4_4_4: return (format == GL_RGBA) ? TexelFormat::RGBA4444 : TexelFormat::None;
	case GL_UNSIGNED_SHORT_5_5_5_1: return (format == GL_RGBA) ? TexelFormat::RGBA5551 : TexelFormat::None;
	}
	return TexelFormat::None;
}

TexelFormat::Format GetTexelFormat( ULONG renderbufferFormat )
{
	switch (renderbufferFormat)
	{
	case GL_RGBA4: return TexelFormat::RGBA4444;
	case GL_RGB5_A1: return TexelFormat::RGBA5551;
	case GL_RGB565: return TexelFormat::RGB565;
	case GL_DEPTH_COMPONENT16 : return TexelFormat::D16;
	case GL_STENCIL_INDEX8 : return TexelFormat::S8;
	case GL_DEPTH_STENCIL : return TexelFormat::D24S8;
	}
	return TexelFormat::None;
}

ULONG GetRedChannelBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::R8:
	case TexelFormat::RA88:
	case TexelFormat::RGB888:
	case TexelFormat::BGR888:
	case TexelFormat::RGBA8888:
	case TexelFormat::BGRA8888:
	case TexelFormat::BGRX8888:
		return 8;
	case TexelFormat::RGBA4444:
		return 4;
	case TexelFormat::RGBA5551:
		return 5;
	case TexelFormat::RGB565:
		return 5;
	case TexelFormat::R32F:
	case TexelFormat::RA32F:
	case TexelFormat::RGB32F:
	case TexelFormat::RGBA32F:
		return 32;
	}
	return 0;
}

ULONG GetGreenChannelBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::RGB888:
	case TexelFormat::BGR888:
	case TexelFormat::RGBA8888:
	case TexelFormat::BGRA8888:
	case TexelFormat::BGRX8888:
		return 8;
	case TexelFormat::RGBA4444:
		return 4;
	case TexelFormat::RGBA5551:
		return 5;
	case TexelFormat::RGB565:
		return 6;
	case TexelFormat::RGB32F:
	case TexelFormat::RGBA32F:
		return 32;
	}
	return 0;
}

ULONG GetBlueChannelBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::RGB888:
	case TexelFormat::BGR888:
	case TexelFormat::RGBA8888:
	case TexelFormat::BGRA8888:
	case TexelFormat::BGRX8888:
		return 8;
	case TexelFormat::RGBA4444:
		return 4;
	case TexelFormat::RGBA5551:
		return 5;
	case TexelFormat::RGB565:
		return 5;
	case TexelFormat::RGB32F:
	case TexelFormat::RGBA32F:
		return 32;
	}
	return 0;
}

ULONG GetAlphaChannelBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::A8:
	case TexelFormat::RA88:
	case TexelFormat::RGBA8888:
	case TexelFormat::BGRA8888:
	case TexelFormat::BGRX8888:
		return 8;
	case TexelFormat::RGBA4444:
		return 4;
	case TexelFormat::RGBA5551:
		return 1;
	case TexelFormat::A32F:
	case TexelFormat::RA32F:
	case TexelFormat::RGBA32F:
		return 32;
	}
	return 0;
}

ULONG GetDepthBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::D16:
		return 16;
	case TexelFormat::D24S8:
		return 24;
	}
	return 0;
}

ULONG GetStencilBits( TexelFormat::Format format )
{
	switch (format)
	{
	case TexelFormat::S8:
		return 8;
	case TexelFormat::D24S8: 
		return 8;
	}
	return 0;
}

ULONG GetTexelByteSize( TexelFormat::Format format )
{
	switch(format)
	{
	case TexelFormat::S8:
	case TexelFormat::A8:
	case TexelFormat::R8:
		return 1;
	case TexelFormat::D16:
	case TexelFormat::RA88:
	case TexelFormat::RGB565:
	case TexelFormat::RGBA4444:
	case TexelFormat::RGBA5551:
		return 2;
	case TexelFormat::RGB888:
	case TexelFormat::BGR888:
		return 3;
	case TexelFormat::D24S8:
	case TexelFormat::RGBA8888:
	case TexelFormat::BGRA8888:
	case TexelFormat::BGRX8888:
	case TexelFormat::A32F:
	case TexelFormat::R32F:
		return 4;
	case TexelFormat::RA32F:
		return 8;
	case TexelFormat::RGB32F:
		return 12;
	case TexelFormat::RGBA32F:
		return 16;
	};
	return 0;
}

ULONG GetAlignedRowByteSize( ULONG width, TexelFormat::Format format, ULONG alignment )
{
	ULONG plainRowSize = width * GetTexelByteSize(format);
	return ((plainRowSize + alignment - 1) / alignment) * alignment;
}

ULONG GetAlignedImageByteSize( ULONG width, ULONG height, TexelFormat::Format format, ULONG alignment )
{
	ULONG plainRowSize = width * GetTexelByteSize(format);
	ULONG alignedRowSize = GetAlignedRowByteSize(width, format, alignment);
	return (height - 1) * alignedRowSize + plainRowSize;
}

typedef void (*TexelConvertFuncPtr)(const BYTE*, BYTE*);

//////////////////////////////////////////////////////////////////////////
// Unpackers
//////////////////////////////////////////////////////////////////////////

static void UnpackA8ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = 0x0;
	dst[1] = 0x0;
	dst[2] = 0x0;
	dst[3] = src[0];
}

static void UnpackR8ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[0];
	dst[2] = src[0];
	dst[3] = 0xFF;
}

static void UnpackRA88ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[0];
	dst[2] = src[0];
	dst[3] = src[1];
}

static void UnpackRGB565ToRGBA8888(const BYTE* src, BYTE* dst)
{
	USHORT packedValue = reinterpret_cast<const USHORT*>(src)[0];
	BYTE r = packedValue >> 11;
	BYTE g = (packedValue >> 5) & 0x3F;
	BYTE b = packedValue & 0x1F;
	dst[0] = (r << 3) | (r & 0x7);
	dst[1] = (g << 2) | (g & 0x3);
	dst[2] = (b << 3) | (b & 0x7);
	dst[3] = 0xFF;
}

static void UnpackRGB888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
	dst[3] = 0xFF;
}

static void UnpackBGR888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
	dst[3] = 0xFF;
}

static void UnpackRGBA4444ToRGBA8888(const BYTE* src, BYTE* dst)
{
	USHORT packedValue = reinterpret_cast<const USHORT*>(src)[0];
	BYTE r = packedValue >> 12;
	BYTE g = (packedValue >> 8) & 0x0F;
	BYTE b = (packedValue >> 4) & 0x0F;
	BYTE a = packedValue & 0x0F;
	dst[0] = r << 4 | r;
	dst[1] = g << 4 | g;
	dst[2] = b << 4 | b;
	dst[3] = a << 4 | a;
}

static void UnpackRGBA5551ToRGBA8888(const BYTE* src, BYTE* dst)
{
	USHORT packedValue = reinterpret_cast<const USHORT*>(src)[0];
	BYTE r = packedValue >> 11;
	BYTE g = (packedValue >> 6) & 0x1F;
	BYTE b = (packedValue >> 1) & 0x1F;
	dst[0] = (r << 3) | (r & 0x7);
	dst[1] = (g << 3) | (g & 0x7);
	dst[2] = (b << 3) | (b & 0x7);
	dst[3] = (packedValue & 0x1) ? 0xFF : 0x0;
}

static void UnpackRGBA8888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
	dst[3] = src[3];
}

static void UnpackBGRA8888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
	dst[3] = src[3];
}

static void UnpackBGRX8888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
	dst[3] = 0xFF;
}

static void UnpackA32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	const FLOAT* fSrc = (const FLOAT*)src;
	FLOAT* fDst = (FLOAT*)dst;
	fDst[0] = 0.0f;
	fDst[1] = 0.0f;
	fDst[2] = 0.0f;
	fDst[3] = fSrc[0];
}

static void UnpackR32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	const FLOAT* fSrc = (const FLOAT*)src;
	FLOAT* fDst = (FLOAT*)dst;
	fDst[0] = fSrc[0];
	fDst[1] = fSrc[0];
	fDst[2] = fSrc[0];
	fDst[3] = 1.0f;
}

static void UnpackRA32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	const FLOAT* fSrc = (const FLOAT*)src;
	FLOAT* fDst = (FLOAT*)dst;
	fDst[0] = fSrc[0];
	fDst[1] = fSrc[0];
	fDst[2] = fSrc[0];
	fDst[3] = fSrc[1];
}

static void UnpackRGB32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	const FLOAT* fSrc = (const FLOAT*)src;
	FLOAT* fDst = (FLOAT*)dst;
	fDst[0] = fSrc[0];
	fDst[1] = fSrc[1];
	fDst[2] = fSrc[2];
	fDst[3] = 1.0f;
}

static void UnpackRGBA32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	const FLOAT* fSrc = (const FLOAT*)src;
	FLOAT* fDst = (FLOAT*)dst;
	fDst[0] = fSrc[0];
	fDst[1] = fSrc[1];
	fDst[2] = fSrc[2];
	fDst[3] = fSrc[3];
}

static Unpacker GetUnpacker( TexelFormat::Format format )
{
	static const Unpacker Unpackers[] =
	{
		NULL,						// NONE
		&UnpackA8ToRGBA8888,		// A8
		&UnpackR8ToRGBA8888,		// R8
		&UnpackRA88ToRGBA8888,		// RA88
		&UnpackRGB565ToRGBA8888,	// RGB565
		&UnpackRGB888ToRGBA8888,	// RGB888
		&UnpackBGR888ToRGBA8888,	// BGR888
		&UnpackRGBA4444ToRGBA8888,	// RGBA4444
		&UnpackRGBA5551ToRGBA8888,	// RGBA5551
		&UnpackRGBA8888ToRGBA8888,	// RGBA8888
		&UnpackBGRA8888ToRGBA8888,	// BGRA8888
		&UnpackBGRX8888ToRGBA8888,	// BGRX8888
		&UnpackA32FToRGBA32F,		// A32F
		&UnpackR32FToRGBA32F,		// R32F
		&UnpackRA32FToRGBA32F,		// RA32F
		&UnpackRGB32FToRGBA32F,		// RGB32F
		&UnpackRGBA32FToRGBA32F		// RGBA32F
	};
	return Unpackers[format];
}

//////////////////////////////////////////////////////////////////////////
// UByte Packers
//////////////////////////////////////////////////////////////////////////

static void PackRGBA8888ToA8(const BYTE* src, BYTE* dst)
{
	dst[0] = src[3];
}

static void PackRGBA8888ToR8(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
}

static void PackRGBA8888ToR8Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	dst[0] = srcR;
}

static void PackRGBA8888ToR8Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	dst[0] = srcR;
}

static void PackRGBA8888ToRGB565(const BYTE* src, BYTE* dst)
{
	*dst = (((src[0] & 0xF8) << 8) | ((src[1] & 0xFC) << 3) | ((src[2] & 0xF8) >> 3));
}

static void PackRGBA8888ToRGB565Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xFC) << 3) | ((srcB & 0xF8) >> 3));
}

static void PackRGBA8888ToRGB565Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xFC) << 3) | ((srcB & 0xF8) >> 3));
}

static void PackRGBA8888ToRA88(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[3];
}

static void PackRGBA8888ToRA88Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = src[3];
}

static void PackRGBA8888ToRA88Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = src[3];
}

static void PackRGBA8888ToRGB888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
}

static void PackRGBA8888ToRGB888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
}

static void PackRGBA8888ToRGB888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
}

static void PackRGBA8888ToBGR888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
}

static void PackRGBA8888ToBGR888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
}

static void PackRGBA8888ToBGR888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
}

void PackRGBA8888ToRGBA4444(const BYTE* src, BYTE* dst)
{
	*dst = (((src[0] & 0xF0) << 8) | ((src[1] & 0xF0) << 4) | (src[2] & 0xF0) | (src[3] >> 4));
}

void PackRGBA8888ToRGBA4444Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF0) << 8) | ((srcG & 0xF0) << 4) | (srcB & 0xF0) | (src[3] >> 4));
}

void PackRGBA8888ToRGBA4444Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF0) << 8) | ((srcG & 0xF0) << 4) | (srcB & 0xF0) | (src[3] >> 4));
}

void PackRGBA8888ToRGBA5551(const BYTE* src, BYTE* dst)
{
	*dst = (((src[0] & 0xF8) << 8) | ((src[1] & 0xF8) << 3) | ((src[2] & 0xF8) >> 2) | (src[3] >> 7));
}

void PackRGBA8888ToRGBA5551Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xF8) << 3) | ((srcB & 0xF8) >> 2) | (src[3] >> 7));
}

void PackRGBA8888ToRGBA5551Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xF8) << 3) | ((srcB & 0xF8) >> 2) | (src[3] >> 7));
}

static void PackRGBA8888ToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2] = src[2];
	dst[3] = src[3];
}

static void PackRGBA8888ToRGBA8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
	dst[3] = src[3];
}

static void PackRGBA8888ToRGBA8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
	dst[3] = src[3];
}

static void PackRGBA8888ToBGRA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
	dst[3] = src[3];
}

static void PackRGBA8888ToBGRA8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = src[3];
}

static void PackRGBA8888ToBGRA8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = src[3];
}

static void PackRGBA8888ToBGRX8888(const BYTE* src, BYTE* dst)
{
	dst[0] = src[2];
	dst[1] = src[1];
	dst[2] = src[0];
	dst[3] = 0xFF;
}

static void PackRGBA8888ToBGRX8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = 0xFF;
}

static void PackRGBA8888ToBGRX8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = 0xFF;
}

static void PackRGBA8888ToA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = src[3] / 255.0f;
}

static void PackRGBA8888ToR32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = src[0] / 255.0f;
}

static void PackRGBA8888ToR32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
}

static void PackRGBA8888ToR32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
}


static void PackRGBA8888ToRA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = src[0] / 255.0f;
	((FLOAT*)dst)[1] = src[3] / 255.0f;
}

static void PackRGBA8888ToRA32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = src[3] / 255.0f;
}

static void PackRGBA8888ToRA32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = src[3] / 255.0f;
}

static void PackRGBA8888ToRGB32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = src[0] / 255.0f;
	((FLOAT*)dst)[1] = src[1] / 255.0f;
	((FLOAT*)dst)[2] = src[2] / 255.0f;
}

static void PackRGBA8888ToRGB32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = srcG / 255.0f;
	((FLOAT*)dst)[2] = srcB / 255.0f;
}

static void PackRGBA8888ToRGB32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = srcG / 255.0f;
	((FLOAT*)dst)[2] = srcB / 255.0f;
}

static void PackRGBA8888ToRGBA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = src[0] / 255.0f;
	((FLOAT*)dst)[1] = src[1] / 255.0f;
	((FLOAT*)dst)[2] = src[2] / 255.0f;
	((FLOAT*)dst)[3] = src[3] / 255.0f;
}

static void PackRGBA8888ToRGBA32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] / 255.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = srcG / 255.0f;
	((FLOAT*)dst)[2] = srcB / 255.0f;
	((FLOAT*)dst)[3] = src[3] / 255.0f;
}

static void PackRGBA8888ToRGBA32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 255.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor);
	BYTE srcG = static_cast<BYTE>(static_cast<float>(src[1]) * scaleFactor);
	BYTE srcB = static_cast<BYTE>(static_cast<float>(src[2]) * scaleFactor);
	((FLOAT*)dst)[0] = srcR / 255.0f;
	((FLOAT*)dst)[1] = srcG / 255.0f;
	((FLOAT*)dst)[2] = srcB / 255.0f;
	((FLOAT*)dst)[3] = src[3] / 255.0f;
}

//////////////////////////////////////////////////////////////////////////
// Float Packers
//////////////////////////////////////////////////////////////////////////

static void PackRGBA32FToA8(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToR8(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
}

static void PackRGBA32FToR8Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	dst[0] = srcR;
}

static void PackRGBA32FToR8Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	dst[0] = srcR;
}

static void PackRGBA32FToRGB565(const BYTE* src, BYTE* dst)
{
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xFC) << 3) | ((srcB & 0xF8) >> 3));
}

static void PackRGBA32FToRGB565Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xFC) << 3) | ((srcB & 0xF8) >> 3));
}

static void PackRGBA32FToRGB565Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xFC) << 3) | ((srcB & 0xF8) >> 3));
}

static void PackRGBA32FToRA88(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToRA88Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	dst[0] = srcR;
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToRA88Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(static_cast<float>(src[0]) * scaleFactor * 255.0f);
	dst[0] = srcR;
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToRGB888(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	dst[2] = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
}

static void PackRGBA32FToRGB888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
}

static void PackRGBA32FToRGB888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
}

static void PackRGBA32FToBGR888(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	dst[2] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
}

static void PackRGBA32FToBGR888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
}

static void PackRGBA32FToBGR888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
}

void PackRGBA32FToRGBA4444(const BYTE* src, BYTE* dst)
{
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF0) << 8) | ((srcG & 0xF0) << 4) | (srcB & 0xF0) | (srcA >> 4));
}

void PackRGBA32FToRGBA4444Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF0) << 8) | ((srcG & 0xF0) << 4) | (srcB & 0xF0) | (srcA >> 4));
}

void PackRGBA32FToRGBA4444Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF0) << 8) | ((srcG & 0xF0) << 4) | (srcB & 0xF0) | (srcA >> 4));
}

void PackRGBA32FToRGBA5551(const BYTE* src, BYTE* dst)
{
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xF8) << 3) | ((srcB & 0xF8) >> 2) | (srcA >> 7));
}

void PackRGBA32FToRGBA5551Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xF8) << 3) | ((srcB & 0xF8) >> 2) | (srcA >> 7));
}

void PackRGBA32FToRGBA5551Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	*dst = (((srcR & 0xF8) << 8) | ((srcG & 0xF8) << 3) | ((srcB & 0xF8) >> 2) | (srcA >> 7));
}

static void PackRGBA32FToRGBA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	dst[2] = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	dst[3] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToRGBA8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
	dst[3] = srcA;
}

static void PackRGBA32FToRGBA8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	dst[0] = srcR;
	dst[1] = srcG;
	dst[2] = srcB;
	dst[3] = srcA;
}

static void PackRGBA32FToBGRA8888(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	dst[2] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	dst[3] = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
}

static void PackRGBA32FToBGRA8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = srcA;

}

static void PackRGBA32FToBGRA8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	BYTE srcA = static_cast<BYTE>(((FLOAT*)src)[3] * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = srcA;
}

static void PackRGBA32FToBGRX8888(const BYTE* src, BYTE* dst)
{
	dst[0] = static_cast<BYTE>(((FLOAT*)src)[2] * 255.0f);
	dst[1] = static_cast<BYTE>(((FLOAT*)src)[1] * 255.0f);
	dst[2] = static_cast<BYTE>(((FLOAT*)src)[0] * 255.0f);
	dst[3] = 0xFF;
}

static void PackRGBA32FToBGRX8888Premultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = 0xFF;
}

static void PackRGBA32FToBGRX8888Unmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	BYTE srcR = static_cast<BYTE>(((FLOAT*)src)[0] * scaleFactor * 255.0f);
	BYTE srcG = static_cast<BYTE>(((FLOAT*)src)[1] * scaleFactor * 255.0f);
	BYTE srcB = static_cast<BYTE>(((FLOAT*)src)[2] * scaleFactor * 255.0f);
	dst[0] = srcB;
	dst[1] = srcG;
	dst[2] = srcR;
	dst[3] = 0xFF;
}

static void PackRGBA32FToA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToR32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0];
}

static void PackRGBA32FToR32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
}

static void PackRGBA32FToR32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
}


static void PackRGBA32FToRA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0];
	((FLOAT*)dst)[1] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToRA32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToRA32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToRGB32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0];
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1];
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2];
}

static void PackRGBA32FToRGB32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1] * scaleFactor;
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2] * scaleFactor;
}

static void PackRGBA32FToRGB32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1] * scaleFactor;
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2] * scaleFactor;
}

static void PackRGBA32FToRGBA32F(const BYTE* src, BYTE* dst)
{
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0];
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1];
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2];
	((FLOAT*)dst)[3] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToRGBA32FPremultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3];
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1] * scaleFactor;
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2] * scaleFactor;
	((FLOAT*)dst)[3] = ((FLOAT*)src)[3];
}

static void PackRGBA32FToRGBA32FUnmultiply(const BYTE* src, BYTE* dst)
{
	float scaleFactor = src[3] ? 1.0f / src[3] : 1.0f;
	((FLOAT*)dst)[0] = ((FLOAT*)src)[0] * scaleFactor;
	((FLOAT*)dst)[1] = ((FLOAT*)src)[1] * scaleFactor;
	((FLOAT*)dst)[2] = ((FLOAT*)src)[2] * scaleFactor;
	((FLOAT*)dst)[3] = ((FLOAT*)src)[3];
}

inline BOOL IsFormatFloat( TexelFormat::Format format )
{
	switch(format)
	{
	case TexelFormat::A32F:
	case TexelFormat::R32F:
	case TexelFormat::RA32F:
	case TexelFormat::RGB32F:
	case TexelFormat::RGBA32F:
		return TRUE;
	}
	return FALSE;
}

static Packer GetPacker( MultiplyOp::Op multipliedOp, TexelFormat::Format srcFormat, TexelFormat::Format dstFormat )
{
	static const Packer UBytePackers[][MultiplyOp::Count] =
	{
		//   None					// Premultiply						// Unmultiply
		{ NULL,						NULL,								NULL },								 // NONE
		{ &PackRGBA8888ToA8,		&PackRGBA8888ToA8,					&PackRGBA8888ToA8 },				 // A8
		{ &PackRGBA8888ToR8,		&PackRGBA8888ToR8Premultiply,		&PackRGBA8888ToR8Unmultiply },		 // R8
		{ &PackRGBA8888ToRA88,		&PackRGBA8888ToRA88Premultiply,		&PackRGBA8888ToRA88Unmultiply },	 // RA88
		{ &PackRGBA8888ToRGB565,	&PackRGBA8888ToRGB565Premultiply,	&PackRGBA8888ToRGB565Unmultiply },	 // RGB565
		{ &PackRGBA8888ToRGB888,	&PackRGBA8888ToRGB888Premultiply,	&PackRGBA8888ToRGB888Unmultiply },	 // RGB888
		{ &PackRGBA8888ToBGR888,	&PackRGBA8888ToBGR888Premultiply,	&PackRGBA8888ToBGR888Unmultiply },	 // BGR888
		{ &PackRGBA8888ToRGBA4444,	&PackRGBA8888ToRGBA4444Premultiply,	&PackRGBA8888ToRGBA4444Unmultiply }, // RGBA4444
		{ &PackRGBA8888ToRGBA5551,	&PackRGBA8888ToRGBA5551Premultiply,	&PackRGBA8888ToRGBA5551Unmultiply},  // RGBA5551
		{ &PackRGBA8888ToRGBA8888,	&PackRGBA8888ToRGBA8888Premultiply,	&PackRGBA8888ToRGBA8888Unmultiply }, // RGBA8888
		{ &PackRGBA8888ToBGRA8888,	&PackRGBA8888ToBGRA8888Premultiply,	&PackRGBA8888ToBGRA8888Unmultiply }, // BGRA8888
		{ &PackRGBA8888ToBGRX8888,	&PackRGBA8888ToBGRX8888Premultiply,	&PackRGBA8888ToBGRX8888Unmultiply }, // BGRX8888
		{ &PackRGBA8888ToA32F,		&PackRGBA8888ToA32F,				&PackRGBA8888ToA32F },				 // A32F
		{ &PackRGBA8888ToR32F,		&PackRGBA8888ToR32FPremultiply,		&PackRGBA8888ToR32FUnmultiply },	 // R32F
		{ &PackRGBA8888ToRA32F,		&PackRGBA8888ToRA32FPremultiply,	&PackRGBA8888ToRA32FUnmultiply },	 // RA32F
		{ &PackRGBA8888ToRGB32F,	&PackRGBA8888ToRGB32FPremultiply,	&PackRGBA8888ToRGB32FUnmultiply },	 // RGB32F
		{ &PackRGBA8888ToRGBA32F,	&PackRGBA8888ToRGBA32FPremultiply,	&PackRGBA8888ToRGBA32FUnmultiply }   // RGBA32F
	};

	static const Packer FloatPackers[][MultiplyOp::Count] =
	{
		//   None					// Premultiply						// Unmultiply
		{ &PackRGBA32FToA8,			&PackRGBA32FToA8,					&PackRGBA32FToA8 },					 // A8
		{ &PackRGBA32FToR8,			&PackRGBA32FToR8Premultiply,		&PackRGBA32FToR8Unmultiply },		 // R8
		{ &PackRGBA32FToRA88,		&PackRGBA32FToRA88Premultiply,		&PackRGBA32FToRA88Unmultiply },		 // RA88
		{ &PackRGBA32FToRGB565,		&PackRGBA32FToRGB565Premultiply,	&PackRGBA32FToRGB565Unmultiply },	 // RGB565
		{ &PackRGBA32FToRGB888,		&PackRGBA32FToRGB888Premultiply,	&PackRGBA32FToRGB888Unmultiply },	 // RGB888
		{ &PackRGBA32FToBGR888,		&PackRGBA32FToBGR888Premultiply,	&PackRGBA32FToBGR888Unmultiply },	 // BGR888
		{ &PackRGBA32FToRGBA4444,	&PackRGBA32FToRGBA4444Premultiply,	&PackRGBA32FToRGBA4444Unmultiply },  // RGBA4444
		{ &PackRGBA32FToRGBA5551,	&PackRGBA32FToRGBA5551Premultiply,	&PackRGBA32FToRGBA5551Unmultiply},   // RGBA5551
		{ &PackRGBA32FToRGBA8888,	&PackRGBA32FToRGBA8888Premultiply,	&PackRGBA32FToRGBA8888Unmultiply },  // RGBA8888
		{ &PackRGBA32FToBGRA8888,	&PackRGBA32FToBGRA8888Premultiply,	&PackRGBA32FToBGRA8888Unmultiply },  // BGRA8888
		{ &PackRGBA32FToBGRX8888,	&PackRGBA32FToBGRX8888Premultiply,	&PackRGBA32FToBGRX8888Unmultiply },  // BGRX8888
		{ &PackRGBA32FToA32F,		&PackRGBA32FToA32F,					&PackRGBA32FToA32F },				 // A32F
		{ &PackRGBA32FToR32F,		&PackRGBA32FToR32FPremultiply,		&PackRGBA32FToR32FUnmultiply },		 // R32F
		{ &PackRGBA32FToRA32F,		&PackRGBA32FToRA32FPremultiply,		&PackRGBA32FToRA32FUnmultiply },	 // RA32F
		{ &PackRGBA32FToRGB32F,		&PackRGBA32FToRGB32FPremultiply,	&PackRGBA32FToRGB32FUnmultiply },	 // RGB32F
		{ &PackRGBA32FToRGBA32F,	&PackRGBA32FToRGBA32FPremultiply,	&PackRGBA32FToRGBA32FUnmultiply }    // RGBA32F
	};

	return IsFormatFloat(srcFormat) ? FloatPackers[dstFormat][multipliedOp] : UBytePackers[dstFormat][multipliedOp];
}

//////////////////////////////////////////////////////////////////////////

inline void DefaultTexelConverter( Unpacker unpacker, Packer packer, const BYTE* srcData, BYTE* dstData )
{
	BYTE buffer[16] = { 0 };
	(*unpacker)(srcData, buffer);
	(*packer)(buffer, dstData);
}

BOOL ConvertImage( ULONG width, ULONG height, MultiplyOp::Op multipliedOp, ULONG unpackAlignment, BOOL flipY,
	TexelFormat::Format srcFormat, const BYTE* srcData, TexelFormat::Format dstFormat, BYTE* dstData)
{
	return ConvertImageExt(width, height, multipliedOp, 0, unpackAlignment, flipY,
		srcFormat, srcData, dstFormat, dstData);
}

BOOL ConvertImageExt( ULONG width, ULONG height, MultiplyOp::Op multipliedOp, ULONG sourceStride, ULONG unpackAlignment, BOOL flipY,
	TexelFormat::Format srcFormat, const BYTE* srcData, TexelFormat::Format dstFormat, BYTE* dstData)
{
	assert(srcData != dstData);

	if (srcData == dstData)
		return FALSE;

	Unpacker unpacker = GetUnpacker(srcFormat);
	Packer packer = GetPacker(multipliedOp, srcFormat, dstFormat);

	if(!unpacker || !packer)
		return FALSE;

	ULONG srcTexelSize = GetTexelByteSize(srcFormat);
	ULONG dstTexelSize = GetTexelByteSize(dstFormat);

	ULONG srcStride = sourceStride ? sourceStride : GetAlignedRowByteSize(width, srcFormat, unpackAlignment);
	ULONG dstStride = GetAlignedRowByteSize(width, dstFormat, unpackAlignment);

	for(ULONG iSrcRow = 0; iSrcRow < height; ++iSrcRow)
	{
		ULONG iDstRow = flipY ? (height - 1 - iSrcRow) : iSrcRow;
		BYTE* dstRowPtr = dstData + iDstRow * dstStride;

		const BYTE* srcRowPtr = srcData + iSrcRow * srcStride;
		const BYTE* srcRowEndPtr = srcRowPtr + width * srcTexelSize;

		while(srcRowPtr != srcRowEndPtr)
		{
			DefaultTexelConverter(unpacker, packer, srcRowPtr, dstRowPtr);
			srcRowPtr += srcTexelSize;
			dstRowPtr += dstTexelSize;
		}
	}

	return TRUE;
}

void FlipYImage( ULONG width, ULONG height, TexelFormat::Format format,
	ULONG unpackAlignment, BYTE* data )
{
	ULONG texelSize = GetTexelByteSize(format);
	ULONG stride = GetAlignedRowByteSize(width, format, unpackAlignment);

	BYTE * tempRow = (BYTE*)_alloca(stride);

	for(ULONG iSrcRow = 0; iSrcRow < height / 2; ++iSrcRow)
	{
		ULONG iDstRow = height - 1 - iSrcRow;
		BYTE* dstRowPtr = data + iDstRow * stride;
		BYTE* srcRowPtr = data + iSrcRow * stride;

		memcpy(tempRow, dstRowPtr, stride);
		memcpy(dstRowPtr, srcRowPtr, stride);
		memcpy(srcRowPtr, tempRow, stride);
	}
}

BOOL HasAlphaChannel( ULONG glFormat )
{
	return
		glFormat == GL_ALPHA ||
		glFormat == GL_LUMINANCE_ALPHA ||
		glFormat == GL_RGBA4 ||
		glFormat == GL_RGB5_A1 ||
		glFormat == GL_RGBA;
}

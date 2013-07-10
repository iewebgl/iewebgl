#pragma once

#include <GLES2/gl2.h>
#include <GLES2/gl2ext.h>

#define GL_DEPTH_STENCIL_ATTACHMENT				0x821A
#define GL_DEPTH_STENCIL						0x84F9
#define GL_DEPTH24_STENCIL8						GL_DEPTH24_STENCIL8_OES
#define GL_TEXTURE_WRAP_R						GL_TEXTURE_WRAP_R_OES
#define GL_RGB8									GL_RGB8_OES
#define GL_RGBA8								GL_RGBA8_OES

#define GL_COMPRESSED_RGBA_S3TC_DXT3_EXT		0x83F2
#define GL_COMPRESSED_RGBA_S3TC_DXT5_EXT		0x83F3

#define GL_CUBEMAP_FACE_COUNT					6
#define GL_ANTIALIAS_SAMPLE_COUNT				4

#define GL_RGB565								0x8D62
#define GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS	0x8CD9
#define GL_UNPACK_FLIP_Y_WEBGL					0x9240
#define GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL		0x9241
#define GL_CONTEXT_LOST_WEBGL					0x9242
#define GL_UNPACK_COLORSPACE_CONVERSION_WEBGL	0x9243
#define GL_BROWSER_DEFAULT_WEBGL				0x9244

namespace StretchOp {
enum Type
{
	None,
	BGRA_PremultiplyAlpha,
	FlipY_BGRA,
	FlipY_BGRA_PremultiplyAlpha,
	Count
};
};

template <typename Interface>
class WebGLContextConstants : public Interface
{
	STDMETHOD(get_DEPTH_BUFFER_BIT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_BUFFER_BIT; return S_OK; }
	STDMETHOD(get_STENCIL_BUFFER_BIT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BUFFER_BIT; return S_OK; }
	STDMETHOD(get_COLOR_BUFFER_BIT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COLOR_BUFFER_BIT; return S_OK; }
	STDMETHOD(get_POINTS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_POINTS; return S_OK; }
	STDMETHOD(get_LINES)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINES; return S_OK; }
	STDMETHOD(get_LINE_LOOP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINE_LOOP; return S_OK; }
	STDMETHOD(get_LINE_STRIP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINE_STRIP; return S_OK; }
	STDMETHOD(get_TRIANGLES)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TRIANGLES; return S_OK; }
	STDMETHOD(get_TRIANGLE_STRIP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TRIANGLE_STRIP; return S_OK; }
	STDMETHOD(get_TRIANGLE_FAN)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TRIANGLE_FAN; return S_OK; }
	STDMETHOD(get_ZERO)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ZERO; return S_OK; }
	STDMETHOD(get_ONE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE; return S_OK; }
	STDMETHOD(get_SRC_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SRC_COLOR; return S_OK; }
	STDMETHOD(get_ONE_MINUS_SRC_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_SRC_COLOR; return S_OK; }
	STDMETHOD(get_SRC_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SRC_ALPHA; return S_OK; }
	STDMETHOD(get_ONE_MINUS_SRC_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_SRC_ALPHA; return S_OK; }
	STDMETHOD(get_DST_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DST_ALPHA; return S_OK; }
	STDMETHOD(get_ONE_MINUS_DST_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_DST_ALPHA; return S_OK; }
	STDMETHOD(get_DST_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DST_COLOR; return S_OK; }
	STDMETHOD(get_ONE_MINUS_DST_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_DST_COLOR; return S_OK; }
	STDMETHOD(get_SRC_ALPHA_SATURATE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SRC_ALPHA_SATURATE; return S_OK; }
	STDMETHOD(get_FUNC_ADD)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FUNC_ADD; return S_OK; }
	STDMETHOD(get_BLEND_EQUATION)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_EQUATION; return S_OK; }
	STDMETHOD(get_BLEND_EQUATION_RGB)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_EQUATION_RGB; return S_OK; }
	STDMETHOD(get_BLEND_EQUATION_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_EQUATION_ALPHA; return S_OK; }
	STDMETHOD(get_FUNC_SUBTRACT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FUNC_SUBTRACT; return S_OK; }
	STDMETHOD(get_FUNC_REVERSE_SUBTRACT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FUNC_REVERSE_SUBTRACT; return S_OK; }
	STDMETHOD(get_BLEND_DST_RGB)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_DST_RGB; return S_OK; }
	STDMETHOD(get_BLEND_SRC_RGB)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_SRC_RGB; return S_OK; }
	STDMETHOD(get_BLEND_DST_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_DST_ALPHA; return S_OK; }
	STDMETHOD(get_BLEND_SRC_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_SRC_ALPHA; return S_OK; }
	STDMETHOD(get_CONSTANT_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CONSTANT_COLOR; return S_OK; }
	STDMETHOD(get_ONE_MINUS_CONSTANT_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_CONSTANT_COLOR; return S_OK; }
	STDMETHOD(get_CONSTANT_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CONSTANT_ALPHA; return S_OK; }
	STDMETHOD(get_ONE_MINUS_CONSTANT_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ONE_MINUS_CONSTANT_ALPHA; return S_OK; }
	STDMETHOD(get_BLEND_COLOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND_COLOR; return S_OK; }
	STDMETHOD(get_ARRAY_BUFFER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ARRAY_BUFFER; return S_OK; }
	STDMETHOD(get_ELEMENT_ARRAY_BUFFER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ELEMENT_ARRAY_BUFFER; return S_OK; }
	STDMETHOD(get_ARRAY_BUFFER_BINDING)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ARRAY_BUFFER_BINDING; return S_OK; }
	STDMETHOD(get_ELEMENT_ARRAY_BUFFER_BINDING)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ELEMENT_ARRAY_BUFFER_BINDING; return S_OK; }
	STDMETHOD(get_STREAM_DRAW)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STREAM_DRAW; return S_OK; }
	STDMETHOD(get_STATIC_DRAW)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STATIC_DRAW; return S_OK; }
	STDMETHOD(get_DYNAMIC_DRAW)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DYNAMIC_DRAW; return S_OK; }
	STDMETHOD(get_BUFFER_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BUFFER_SIZE; return S_OK; }
	STDMETHOD(get_BUFFER_USAGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BUFFER_USAGE; return S_OK; }
	STDMETHOD(get_CURRENT_VERTEX_ATTRIB)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CURRENT_VERTEX_ATTRIB; return S_OK; }
	STDMETHOD(get_FRONT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRONT; return S_OK; }
	STDMETHOD(get_BACK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BACK; return S_OK; }
	STDMETHOD(get_FRONT_AND_BACK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRONT_AND_BACK; return S_OK; }
	STDMETHOD(get_CULL_FACE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CULL_FACE; return S_OK; }
	STDMETHOD(get_BLEND)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLEND; return S_OK; }
	STDMETHOD(get_DITHER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DITHER; return S_OK; }
	STDMETHOD(get_STENCIL_TEST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_TEST; return S_OK; }
	STDMETHOD(get_DEPTH_TEST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_TEST; return S_OK; }
	STDMETHOD(get_SCISSOR_TEST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SCISSOR_TEST; return S_OK; }
	STDMETHOD(get_POLYGON_OFFSET_FILL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_POLYGON_OFFSET_FILL; return S_OK; }
	STDMETHOD(get_SAMPLE_ALPHA_TO_COVERAGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLE_ALPHA_TO_COVERAGE; return S_OK; }
	STDMETHOD(get_SAMPLE_COVERAGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLE_COVERAGE; return S_OK; }
	STDMETHOD(get_NO_ERROR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NO_ERROR; return S_OK; }
	STDMETHOD(get_INVALID_ENUM)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INVALID_ENUM; return S_OK; }
	STDMETHOD(get_INVALID_VALUE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INVALID_VALUE; return S_OK; }
	STDMETHOD(get_INVALID_OPERATION)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INVALID_OPERATION; return S_OK; }
	STDMETHOD(get_OUT_OF_MEMORY)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_OUT_OF_MEMORY; return S_OK; }
	STDMETHOD(get_CW)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CW; return S_OK; }
	STDMETHOD(get_CCW)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CCW; return S_OK; }
	STDMETHOD(get_LINE_WIDTH)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINE_WIDTH; return S_OK; }
	STDMETHOD(get_ALIASED_POINT_SIZE_RANGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ALIASED_POINT_SIZE_RANGE; return S_OK; }
	STDMETHOD(get_ALIASED_LINE_WIDTH_RANGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ALIASED_LINE_WIDTH_RANGE; return S_OK; }
	STDMETHOD(get_CULL_FACE_MODE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CULL_FACE_MODE; return S_OK; }
	STDMETHOD(get_FRONT_FACE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRONT_FACE; return S_OK; }
	STDMETHOD(get_DEPTH_RANGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_RANGE; return S_OK; }
	STDMETHOD(get_DEPTH_WRITEMASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_WRITEMASK; return S_OK; }
	STDMETHOD(get_DEPTH_CLEAR_VALUE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_CLEAR_VALUE; return S_OK; }
	STDMETHOD(get_DEPTH_FUNC)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_FUNC; return S_OK; }
	STDMETHOD(get_STENCIL_CLEAR_VALUE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_CLEAR_VALUE; return S_OK; }
	STDMETHOD(get_STENCIL_FUNC)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_FUNC; return S_OK; }
	STDMETHOD(get_STENCIL_FAIL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_FAIL; return S_OK; }
	STDMETHOD(get_STENCIL_PASS_DEPTH_FAIL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_PASS_DEPTH_FAIL; return S_OK; }
	STDMETHOD(get_STENCIL_PASS_DEPTH_PASS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_PASS_DEPTH_PASS; return S_OK; }
	STDMETHOD(get_STENCIL_REF)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_REF; return S_OK; }
	STDMETHOD(get_STENCIL_VALUE_MASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_VALUE_MASK; return S_OK; }
	STDMETHOD(get_STENCIL_WRITEMASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_WRITEMASK; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_FUNC)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_FUNC; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_FAIL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_FAIL; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_PASS_DEPTH_FAIL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_PASS_DEPTH_FAIL; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_PASS_DEPTH_PASS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_PASS_DEPTH_PASS; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_REF)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_REF; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_VALUE_MASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_VALUE_MASK; return S_OK; }
	STDMETHOD(get_STENCIL_BACK_WRITEMASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BACK_WRITEMASK; return S_OK; }
	STDMETHOD(get_VIEWPORT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VIEWPORT; return S_OK; }
	STDMETHOD(get_SCISSOR_BOX)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SCISSOR_BOX; return S_OK; }
	STDMETHOD(get_COLOR_CLEAR_VALUE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COLOR_CLEAR_VALUE; return S_OK; }
	STDMETHOD(get_COLOR_WRITEMASK)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COLOR_WRITEMASK; return S_OK; }
	STDMETHOD(get_UNPACK_ALIGNMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNPACK_ALIGNMENT; return S_OK; }
	STDMETHOD(get_PACK_ALIGNMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_PACK_ALIGNMENT; return S_OK; }
	STDMETHOD(get_MAX_TEXTURE_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_TEXTURE_SIZE; return S_OK; }
	STDMETHOD(get_MAX_VIEWPORT_DIMS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_VIEWPORT_DIMS; return S_OK; }
	STDMETHOD(get_SUBPIXEL_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SUBPIXEL_BITS; return S_OK; }
	STDMETHOD(get_RED_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RED_BITS; return S_OK; }
	STDMETHOD(get_GREEN_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_GREEN_BITS; return S_OK; }
	STDMETHOD(get_BLUE_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BLUE_BITS; return S_OK; }
	STDMETHOD(get_ALPHA_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ALPHA_BITS; return S_OK; }
	STDMETHOD(get_DEPTH_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_BITS; return S_OK; }
	STDMETHOD(get_STENCIL_BITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_BITS; return S_OK; }
	STDMETHOD(get_POLYGON_OFFSET_UNITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_POLYGON_OFFSET_UNITS; return S_OK; }
	STDMETHOD(get_POLYGON_OFFSET_FACTOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_POLYGON_OFFSET_FACTOR; return S_OK; }
	STDMETHOD(get_TEXTURE_BINDING_2D)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_BINDING_2D; return S_OK; }
	STDMETHOD(get_SAMPLE_BUFFERS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLE_BUFFERS; return S_OK; }
	STDMETHOD(get_SAMPLES)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLES; return S_OK; }
	STDMETHOD(get_SAMPLE_COVERAGE_VALUE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLE_COVERAGE_VALUE; return S_OK; }
	STDMETHOD(get_SAMPLE_COVERAGE_INVERT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLE_COVERAGE_INVERT; return S_OK; }
	STDMETHOD(get_COMPRESSED_TEXTURE_FORMATS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COMPRESSED_TEXTURE_FORMATS; return S_OK; }
	STDMETHOD(get_DONT_CARE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DONT_CARE; return S_OK; }
	STDMETHOD(get_FASTEST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FASTEST; return S_OK; }
	STDMETHOD(get_NICEST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NICEST; return S_OK; }
	STDMETHOD(get_GENERATE_MIPMAP_HINT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_GENERATE_MIPMAP_HINT; return S_OK; }
	STDMETHOD(get_BYTE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BYTE; return S_OK; }
	STDMETHOD(get_UNSIGNED_BYTE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_BYTE; return S_OK; }
	STDMETHOD(get_SHORT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SHORT; return S_OK; }
	STDMETHOD(get_UNSIGNED_SHORT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_SHORT; return S_OK; }
	STDMETHOD(get_INT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INT; return S_OK; }
	STDMETHOD(get_UNSIGNED_INT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_INT; return S_OK; }
	STDMETHOD(get_FLOAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT; return S_OK; }
	STDMETHOD(get_DEPTH_COMPONENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_COMPONENT; return S_OK; }
	STDMETHOD(get_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ALPHA; return S_OK; }
	STDMETHOD(get_RGB)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RGB; return S_OK; }
	STDMETHOD(get_RGBA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RGBA; return S_OK; }
	STDMETHOD(get_LUMINANCE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LUMINANCE; return S_OK; }
	STDMETHOD(get_LUMINANCE_ALPHA)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LUMINANCE_ALPHA; return S_OK; }
	STDMETHOD(get_UNSIGNED_SHORT_4_4_4_4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_SHORT_4_4_4_4; return S_OK; }
	STDMETHOD(get_UNSIGNED_SHORT_5_5_5_1)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_SHORT_5_5_5_1; return S_OK; }
	STDMETHOD(get_UNSIGNED_SHORT_5_6_5)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNSIGNED_SHORT_5_6_5; return S_OK; }
	STDMETHOD(get_FRAGMENT_SHADER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAGMENT_SHADER; return S_OK; }
	STDMETHOD(get_VERTEX_SHADER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_SHADER; return S_OK; }
	STDMETHOD(get_MAX_VERTEX_ATTRIBS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_VERTEX_ATTRIBS; return S_OK; }
	STDMETHOD(get_MAX_VERTEX_UNIFORM_VECTORS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_VERTEX_UNIFORM_VECTORS; return S_OK; }
	STDMETHOD(get_MAX_VARYING_VECTORS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_VARYING_VECTORS; return S_OK; }
	STDMETHOD(get_MAX_COMBINED_TEXTURE_IMAGE_UNITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS; return S_OK; }
	STDMETHOD(get_MAX_VERTEX_TEXTURE_IMAGE_UNITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS; return S_OK; }
	STDMETHOD(get_MAX_TEXTURE_IMAGE_UNITS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_TEXTURE_IMAGE_UNITS; return S_OK; }
	STDMETHOD(get_MAX_FRAGMENT_UNIFORM_VECTORS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_FRAGMENT_UNIFORM_VECTORS; return S_OK; }
	STDMETHOD(get_SHADER_TYPE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SHADER_TYPE; return S_OK; }
	STDMETHOD(get_DELETE_STATUS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DELETE_STATUS; return S_OK; }
	STDMETHOD(get_LINK_STATUS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINK_STATUS; return S_OK; }
	STDMETHOD(get_VALIDATE_STATUS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VALIDATE_STATUS; return S_OK; }
	STDMETHOD(get_ATTACHED_SHADERS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ATTACHED_SHADERS; return S_OK; }
	STDMETHOD(get_ACTIVE_UNIFORMS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ACTIVE_UNIFORMS; return S_OK; }
	STDMETHOD(get_ACTIVE_ATTRIBUTES)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ACTIVE_ATTRIBUTES; return S_OK; }
	STDMETHOD(get_SHADING_LANGUAGE_VERSION)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SHADING_LANGUAGE_VERSION; return S_OK; }
	STDMETHOD(get_CURRENT_PROGRAM)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CURRENT_PROGRAM; return S_OK; }
	STDMETHOD(get_NEVER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NEVER; return S_OK; }
	STDMETHOD(get_LESS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LESS; return S_OK; }
	STDMETHOD(get_EQUAL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_EQUAL; return S_OK; }
	STDMETHOD(get_LEQUAL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LEQUAL; return S_OK; }
	STDMETHOD(get_GREATER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_GREATER; return S_OK; }
	STDMETHOD(get_NOTEQUAL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NOTEQUAL; return S_OK; }
	STDMETHOD(get_GEQUAL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_GEQUAL; return S_OK; }
	STDMETHOD(get_ALWAYS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ALWAYS; return S_OK; }
	STDMETHOD(get_KEEP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_KEEP; return S_OK; }
	STDMETHOD(get_REPLACE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_REPLACE; return S_OK; }
	STDMETHOD(get_INCR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INCR; return S_OK; }
	STDMETHOD(get_DECR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DECR; return S_OK; }
	STDMETHOD(get_INVERT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INVERT; return S_OK; }
	STDMETHOD(get_INCR_WRAP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INCR_WRAP; return S_OK; }
	STDMETHOD(get_DECR_WRAP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DECR_WRAP; return S_OK; }
	STDMETHOD(get_VENDOR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VENDOR; return S_OK; }
	STDMETHOD(get_RENDERER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERER; return S_OK; }
	STDMETHOD(get_VERSION)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERSION; return S_OK; }
	STDMETHOD(get_NEAREST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NEAREST; return S_OK; }
	STDMETHOD(get_LINEAR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINEAR; return S_OK; }
	STDMETHOD(get_NEAREST_MIPMAP_NEAREST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NEAREST_MIPMAP_NEAREST; return S_OK; }
	STDMETHOD(get_LINEAR_MIPMAP_NEAREST)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINEAR_MIPMAP_NEAREST; return S_OK; }
	STDMETHOD(get_NEAREST_MIPMAP_LINEAR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NEAREST_MIPMAP_LINEAR; return S_OK; }
	STDMETHOD(get_LINEAR_MIPMAP_LINEAR)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LINEAR_MIPMAP_LINEAR; return S_OK; }
	STDMETHOD(get_TEXTURE_MAG_FILTER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_MAG_FILTER; return S_OK; }
	STDMETHOD(get_TEXTURE_MIN_FILTER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_MIN_FILTER; return S_OK; }
	STDMETHOD(get_TEXTURE_WRAP_S)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_WRAP_S; return S_OK; }
	STDMETHOD(get_TEXTURE_WRAP_T)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_WRAP_T; return S_OK; }
	STDMETHOD(get_TEXTURE_2D)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_2D; return S_OK; }
	STDMETHOD(get_TEXTURE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP; return S_OK; }
	STDMETHOD(get_TEXTURE_BINDING_CUBE_MAP)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_BINDING_CUBE_MAP; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_POSITIVE_X)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_POSITIVE_X; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_NEGATIVE_X)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_NEGATIVE_X; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_POSITIVE_Y)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_POSITIVE_Y; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_NEGATIVE_Y)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_NEGATIVE_Y; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_POSITIVE_Z)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_POSITIVE_Z; return S_OK; }
	STDMETHOD(get_TEXTURE_CUBE_MAP_NEGATIVE_Z)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE_CUBE_MAP_NEGATIVE_Z; return S_OK; }
	STDMETHOD(get_MAX_CUBE_MAP_TEXTURE_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_CUBE_MAP_TEXTURE_SIZE; return S_OK; }
	STDMETHOD(get_TEXTURE0)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE0; return S_OK; }
	STDMETHOD(get_TEXTURE1)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE1; return S_OK; }
	STDMETHOD(get_TEXTURE2)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE2; return S_OK; }
	STDMETHOD(get_TEXTURE3)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE3; return S_OK; }
	STDMETHOD(get_TEXTURE4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE4; return S_OK; }
	STDMETHOD(get_TEXTURE5)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE5; return S_OK; }
	STDMETHOD(get_TEXTURE6)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE6; return S_OK; }
	STDMETHOD(get_TEXTURE7)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE7; return S_OK; }
	STDMETHOD(get_TEXTURE8)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE8; return S_OK; }
	STDMETHOD(get_TEXTURE9)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE9; return S_OK; }
	STDMETHOD(get_TEXTURE10)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE10; return S_OK; }
	STDMETHOD(get_TEXTURE11)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE11; return S_OK; }
	STDMETHOD(get_TEXTURE12)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE12; return S_OK; }
	STDMETHOD(get_TEXTURE13)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE13; return S_OK; }
	STDMETHOD(get_TEXTURE14)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE14; return S_OK; }
	STDMETHOD(get_TEXTURE15)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE15; return S_OK; }
	STDMETHOD(get_TEXTURE16)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE16; return S_OK; }
	STDMETHOD(get_TEXTURE17)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE17; return S_OK; }
	STDMETHOD(get_TEXTURE18)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE18; return S_OK; }
	STDMETHOD(get_TEXTURE19)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE19; return S_OK; }
	STDMETHOD(get_TEXTURE20)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE20; return S_OK; }
	STDMETHOD(get_TEXTURE21)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE21; return S_OK; }
	STDMETHOD(get_TEXTURE22)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE22; return S_OK; }
	STDMETHOD(get_TEXTURE23)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE23; return S_OK; }
	STDMETHOD(get_TEXTURE24)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE24; return S_OK; }
	STDMETHOD(get_TEXTURE25)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE25; return S_OK; }
	STDMETHOD(get_TEXTURE26)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE26; return S_OK; }
	STDMETHOD(get_TEXTURE27)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE27; return S_OK; }
	STDMETHOD(get_TEXTURE28)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE28; return S_OK; }
	STDMETHOD(get_TEXTURE29)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE29; return S_OK; }
	STDMETHOD(get_TEXTURE30)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE30; return S_OK; }
	STDMETHOD(get_TEXTURE31)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_TEXTURE31; return S_OK; }
	STDMETHOD(get_ACTIVE_TEXTURE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_ACTIVE_TEXTURE; return S_OK; }
	STDMETHOD(get_REPEAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_REPEAT; return S_OK; }
	STDMETHOD(get_CLAMP_TO_EDGE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CLAMP_TO_EDGE; return S_OK; }
	STDMETHOD(get_MIRRORED_REPEAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MIRRORED_REPEAT; return S_OK; }
	STDMETHOD(get_FLOAT_VEC2)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_VEC2; return S_OK; }
	STDMETHOD(get_FLOAT_VEC3)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_VEC3; return S_OK; }
	STDMETHOD(get_FLOAT_VEC4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_VEC4; return S_OK; }
	STDMETHOD(get_INT_VEC2)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INT_VEC2; return S_OK; }
	STDMETHOD(get_INT_VEC3)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INT_VEC3; return S_OK; }
	STDMETHOD(get_INT_VEC4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INT_VEC4; return S_OK; }
	STDMETHOD(get_BOOL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BOOL; return S_OK; }
	STDMETHOD(get_BOOL_VEC2)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BOOL_VEC2; return S_OK; }
	STDMETHOD(get_BOOL_VEC3)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BOOL_VEC3; return S_OK; }
	STDMETHOD(get_BOOL_VEC4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BOOL_VEC4; return S_OK; }
	STDMETHOD(get_FLOAT_MAT2)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_MAT2; return S_OK; }
	STDMETHOD(get_FLOAT_MAT3)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_MAT3; return S_OK; }
	STDMETHOD(get_FLOAT_MAT4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FLOAT_MAT4; return S_OK; }
	STDMETHOD(get_SAMPLER_2D)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLER_2D; return S_OK; }
	STDMETHOD(get_SAMPLER_CUBE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_SAMPLER_CUBE; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_ENABLED)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_ENABLED; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_SIZE; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_STRIDE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_STRIDE; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_TYPE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_TYPE; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_NORMALIZED)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_NORMALIZED; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_POINTER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_POINTER; return S_OK; }
	STDMETHOD(get_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_VERTEX_ATTRIB_ARRAY_BUFFER_BINDING; return S_OK; }
	STDMETHOD(get_COMPILE_STATUS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COMPILE_STATUS; return S_OK; }
	STDMETHOD(get_LOW_FLOAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LOW_FLOAT; return S_OK; }
	STDMETHOD(get_MEDIUM_FLOAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MEDIUM_FLOAT; return S_OK; }
	STDMETHOD(get_HIGH_FLOAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_HIGH_FLOAT; return S_OK; }
	STDMETHOD(get_LOW_INT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_LOW_INT; return S_OK; }
	STDMETHOD(get_MEDIUM_INT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MEDIUM_INT; return S_OK; }
	STDMETHOD(get_HIGH_INT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_HIGH_INT; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER; return S_OK; }
	STDMETHOD(get_RENDERBUFFER)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER; return S_OK; }
	STDMETHOD(get_RGBA4)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RGBA4; return S_OK; }
	STDMETHOD(get_RGB5_A1)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RGB5_A1; return S_OK; }
	STDMETHOD(get_RGB565)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RGB565; return S_OK; }
	STDMETHOD(get_DEPTH_COMPONENT16)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_COMPONENT16; return S_OK; }
	STDMETHOD(get_STENCIL_INDEX)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_INDEX; return S_OK; }
	STDMETHOD(get_STENCIL_INDEX8)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_INDEX8; return S_OK; }
	STDMETHOD(get_DEPTH_STENCIL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_STENCIL; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_WIDTH)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_WIDTH; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_HEIGHT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_HEIGHT; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_INTERNAL_FORMAT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_INTERNAL_FORMAT; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_RED_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_RED_SIZE; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_GREEN_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_GREEN_SIZE; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_BLUE_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_BLUE_SIZE; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_ALPHA_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_ALPHA_SIZE; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_DEPTH_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_DEPTH_SIZE; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_STENCIL_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_STENCIL_SIZE; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_ATTACHMENT_OBJECT_NAME; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE; return S_OK; }
	STDMETHOD(get_COLOR_ATTACHMENT0)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_COLOR_ATTACHMENT0; return S_OK; }
	STDMETHOD(get_DEPTH_ATTACHMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_ATTACHMENT; return S_OK; }
	STDMETHOD(get_STENCIL_ATTACHMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_STENCIL_ATTACHMENT; return S_OK; }
	STDMETHOD(get_DEPTH_STENCIL_ATTACHMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_DEPTH_STENCIL_ATTACHMENT; return S_OK; }
	STDMETHOD(get_NONE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_NONE; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_COMPLETE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_COMPLETE; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_INCOMPLETE_ATTACHMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_INCOMPLETE_DIMENSIONS)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_UNSUPPORTED)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_UNSUPPORTED; return S_OK; }
	STDMETHOD(get_FRAMEBUFFER_BINDING)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_FRAMEBUFFER_BINDING; return S_OK; }
	STDMETHOD(get_RENDERBUFFER_BINDING)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_RENDERBUFFER_BINDING; return S_OK; }
	STDMETHOD(get_MAX_RENDERBUFFER_SIZE)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_MAX_RENDERBUFFER_SIZE; return S_OK; }
	STDMETHOD(get_INVALID_FRAMEBUFFER_OPERATION)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_INVALID_FRAMEBUFFER_OPERATION; return S_OK; }
	STDMETHOD(get_UNPACK_FLIP_Y_WEBGL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNPACK_FLIP_Y_WEBGL; return S_OK; }
	STDMETHOD(get_UNPACK_PREMULTIPLY_ALPHA_WEBGL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL; return S_OK; }
	STDMETHOD(get_CONTEXT_LOST_WEBGL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_CONTEXT_LOST_WEBGL; return S_OK; }
	STDMETHOD(get_UNPACK_COLORSPACE_CONVERSION_WEBGL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_UNPACK_COLORSPACE_CONVERSION_WEBGL; return S_OK; }
	STDMETHOD(get_BROWSER_DEFAULT_WEBGL)(ULONG * retVal) { if (!retVal) return E_INVALIDARG; *retVal = GL_BROWSER_DEFAULT_WEBGL; return S_OK; }
};
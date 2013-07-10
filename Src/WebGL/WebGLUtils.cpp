#include "stdafx.h"
#include "WebGLUtils.h"
#include "WebGLRenderingContext.h"

BOOL IsPowerOfTwo( ULONG width, ULONG height )
{
	return !((width & (width - 1)) || (height & (height - 1)));
}

BOOL BaseTypeAndSizeFromUniformType( ULONG type, ULONG *baseType, ULONG *unitSize )
{
	switch (type)
	{
	case GL_INT:
	case GL_INT_VEC2:
	case GL_INT_VEC3:
	case GL_INT_VEC4:
	case GL_SAMPLER_2D:
	case GL_SAMPLER_CUBE:
		*baseType = GL_INT;
		break;
	case GL_FLOAT:
	case GL_FLOAT_VEC2:
	case GL_FLOAT_VEC3:
	case GL_FLOAT_VEC4:
	case GL_FLOAT_MAT2:
	case GL_FLOAT_MAT3:
	case GL_FLOAT_MAT4:
		*baseType = GL_FLOAT;
		break;
	case GL_BOOL:
	case GL_BOOL_VEC2:
	case GL_BOOL_VEC3:
	case GL_BOOL_VEC4:
		*baseType = GL_BOOL; // pretend these are int
		break;
	default:
		return FALSE;
	}

	switch (type)
	{
	case GL_INT:
	case GL_FLOAT:
	case GL_BOOL:
	case GL_SAMPLER_2D:
	case GL_SAMPLER_CUBE:
		*unitSize = 1;
		break;
	case GL_INT_VEC2:
	case GL_FLOAT_VEC2:
	case GL_BOOL_VEC2:
		*unitSize = 2;
		break;
	case GL_INT_VEC3:
	case GL_FLOAT_VEC3:
	case GL_BOOL_VEC3:
		*unitSize = 3;
		break;
	case GL_INT_VEC4:
	case GL_FLOAT_VEC4:
	case GL_BOOL_VEC4:
		*unitSize = 4;
		break;
	case GL_FLOAT_MAT2:
		*unitSize = 4;
		break;
	case GL_FLOAT_MAT3:
		*unitSize = 9;
		break;
	case GL_FLOAT_MAT4:
		*unitSize = 16;
		break;
	default:
		return FALSE;
	}

	return TRUE;
}

ULONG GetCubeMapFace( ULONG target )
{
	return ((target == GL_TEXTURE_2D) ? 0 : target - GL_TEXTURE_CUBE_MAP_POSITIVE_X);
}

ULONG GetComponentSize( ULONG type )
{
	switch (type)
	{
	case GL_BYTE: return sizeof(GLbyte);
	case GL_UNSIGNED_BYTE: return sizeof(GLubyte);
	case GL_SHORT: return sizeof(GLshort);
	case GL_UNSIGNED_SHORT: return sizeof(GLushort);
	case GL_FLOAT: return sizeof(GLfloat);
	}
	return 0;
}

void MakeClear( ULONG viewport[4], BOOL useColor, BOOL useDepth, BOOL useStencil )
{
	GLint boundViewPort[4] = { 0 };
	glGetIntegerv(GL_VIEWPORT, boundViewPort);
	GLboolean boundColorWriteMask[4] = { 0 };
	glGetBooleanv(GL_COLOR_WRITEMASK, boundColorWriteMask);
	GLboolean boundDepthWriteMask = 0;	
	glGetBooleanv(GL_DEPTH_WRITEMASK, &boundDepthWriteMask);
	GLint boundStencilWriteMask = 0;
	glGetIntegerv(GL_STENCIL_WRITEMASK, &boundStencilWriteMask);
	GLfloat boundClearColor[4] = { 0.0f };
	glGetFloatv(GL_COLOR_CLEAR_VALUE, boundClearColor);
	GLfloat boundClearDepth = 0.0f;
	glGetFloatv(GL_DEPTH_CLEAR_VALUE, &boundClearDepth);
	GLint boundClearStencil = 0;
	glGetIntegerv(GL_STENCIL_CLEAR_VALUE, &boundClearStencil);

	glViewport(viewport[0], viewport[1], viewport[2], viewport[3]);

	GLbitfield clearMask = 0;
	if(useColor)
	{
		clearMask |= GL_COLOR_BUFFER_BIT;
		glColorMask(1, 1, 1, 1);
		glClearColor(0.0f, 0.0f, 0.0f, 0.0f);
	}
	if(useDepth)
	{
		clearMask |= GL_DEPTH_BUFFER_BIT;
		glDepthMask(1);
		glClearDepthf(1.0f);
	}
	if(useStencil)
	{
		clearMask |= GL_STENCIL_BUFFER_BIT;
		glStencilMask(0xffffffff);
		glClearStencil(0);
	}

	glClear(clearMask);

	glViewport(boundViewPort[0], boundViewPort[1], boundViewPort[2], boundViewPort[3]);
	glColorMask(boundColorWriteMask[0], boundColorWriteMask[1], boundColorWriteMask[2], boundColorWriteMask[3]);
	glDepthMask(boundDepthWriteMask);
	glStencilMask(boundStencilWriteMask);
	glClearColor(boundClearColor[0], boundClearColor[1], boundClearColor[2], boundClearColor[3]);
	glClearDepthf(boundClearDepth);
	glClearStencil(boundClearStencil);
}

void RenderbufferStorageEx( BOOL useAntialias, ULONG internalformat, ULONG width, ULONG height )
{
	if (useAntialias)
	{
		glRenderbufferStorageMultisampleANGLE(GL_RENDERBUFFER, GL_ANTIALIAS_SAMPLE_COUNT, internalformat, width, height);
	}
	else
	{
		glRenderbufferStorage(GL_RENDERBUFFER, internalformat, width, height);
	}
}

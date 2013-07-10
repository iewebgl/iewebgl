#pragma once
#include "WebGLRCConstants.h"

ULONG GetCubeMapFace(ULONG target);

BOOL IsPowerOfTwo(ULONG width, ULONG height);

ULONG GetComponentSize(ULONG type);

BOOL BaseTypeAndSizeFromUniformType(ULONG type, ULONG* baseType, ULONG* unitSize); 

void MakeClear(ULONG viewport[4], BOOL useColor, BOOL useDepth, BOOL useStencil);

void RenderbufferStorageEx( BOOL useAntialias, ULONG internalformat, ULONG width, ULONG height );
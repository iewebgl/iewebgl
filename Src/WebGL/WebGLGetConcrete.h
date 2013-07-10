#pragma once
#include "WebGLRCConstants.h"
#include <type_traits>

template <typename Concrete>
BOOL GetConcrete(typename Concrete::MainInterface* abstract, Concrete*& concrete, BOOL& isNull)
{
	typedef Concrete::MainInterface Interface;
	static_assert(std::is_base_of<Interface, Concrete>::value, "Concrete is not derived from Interface");

	concrete = nullptr;
	if (!abstract)
	{
		isNull = TRUE;
		return FALSE;
	}

	isNull = FALSE;

	Interface* interfacePtr = abstract;

	Concrete* cPtr = (Concrete*)0x1000;
	Interface* iPtr = cPtr; // automatic cast correctly calculates interface offset, if any
	ptrdiff_t offset = (size_t)iPtr - (size_t)cPtr;
	concrete = (Concrete*)(((BYTE*)interfacePtr) - offset);
	return TRUE;
}

template <typename Concrete>
HRESULT GetConcrete(typename Concrete::MainInterface* abstract, Concrete*& concrete, const BSTR info,
	CWebGLRenderingContext& ctx, BOOL* canBeNull = NULL, BOOL* canBeDeleted = NULL)
{
	if(canBeNull) *canBeNull = FALSE;
	if(canBeDeleted) *canBeDeleted = FALSE;

	BOOL isNull = FALSE;
	if(!GetConcrete<Concrete>(abstract, concrete, isNull))
	{
		if(!isNull)
			return E_INVALIDARG;
		if(!canBeNull)
		{
			ctx.GenerateError(GL_INVALID_VALUE, L"%s: null object passed as argument", info);
			return S_FALSE;
		}
		*canBeNull = TRUE;
		return S_OK;
	}
	if(!concrete->IsCompatible(&ctx))
	{
		ctx.GenerateError(GL_INVALID_OPERATION, L"%s: object from different WebGL context passed as argument", info);
		return S_FALSE;
	}
	BOOL isDeleted = concrete->IsDeleted();
	if(isDeleted)
	{
		if(!canBeDeleted)
		{
			ctx.GenerateError(GL_INVALID_VALUE, L"%s: deleted object passed as argument", info);
			return S_FALSE;
		}
		*canBeDeleted = TRUE;
	}
	return S_OK;
}

#define WEBGL_RET(expr) \
{ \
	HRESULT hr = (expr); \
	if(FAILED(hr)) { return hr; } \
	else if(hr == S_FALSE) { return S_OK; } \
	assert(hr == S_OK); \
};

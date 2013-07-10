// stdafx.h : include file for standard system include files,
// or project specific include files that are used frequently,
// but are changed infrequently

#pragma once

#ifndef STRICT
#define STRICT
#endif

#include "targetver.h"

#define _ATL_APARTMENT_THREADED

#define _ATL_NO_AUTOMATIC_NAMESPACE

#define _ATL_CSTRING_EXPLICIT_CONSTRUCTORS	// some CString constructors will be explicit


#define ATL_NO_ASSERT_ON_DESTROY_NONEXISTENT_WINDOW

#include "resource.h"

#include <atlbase.h>
#include <atlcom.h>
#include <atlctl.h>
#include <atlcoll.h>

#include <comdef.h>

#define V_RET(x) { HRESULT hResult = (x); if(FAILED(hResult)) { return hResult; } };

template <typename T> const T& Min(const T& a, const T& b) { return a < b ? a : b; }
template <typename T> const T& Max(const T& a, const T& b) { return a > b ? a : b; }
template <typename T> T& Clamp(T& value, const T& minValue, const T& maxValue) { value = Min<T>(Max<T>(value, minValue), maxValue); return value; }

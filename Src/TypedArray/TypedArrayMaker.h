#pragma once

#include "Uint8Array.h"
#include "Int8Array.h"
#include "Uint16Array.h"
#include "Int16Array.h"
#include "Uint32Array.h"
#include "Int32Array.h"
#include "Float32Array.h"
#include "Float64Array.h"
#include "DataArrayView.h"

#include <utility>

typedef CComPtr<ITypedArrayBufferView> ITypedArrayBufferViewPtr;
typedef CComPtr<IArrayBufferView> IArrayBufferViewPtr;

struct UndefinedArrayType {};
template <typename T> struct Type2Type { typedef UndefinedArrayType Type; };
template <> struct Type2Type<unsigned char> { typedef Uint8ArrayType Type; };
template <> struct Type2Type<char> { typedef Int8ArrayType Type; };
template <> struct Type2Type<unsigned short> { typedef Uint16ArrayType Type; };
template <> struct Type2Type<signed short> { typedef Int16ArrayType Type; };
template <> struct Type2Type<unsigned int> { typedef Uint32ArrayType Type; };
template <> struct Type2Type<signed int> { typedef Int32ArrayType Type; };
template <> struct Type2Type<float> { typedef Float32ArrayType Type; };
template <> struct Type2Type<double> { typedef Float64ArrayType Type; };
template <> struct Type2Type<void> { typedef DataArrayViewType Type; };

//////////////////////////////////////////////////////////////////////////

template <typename ArrayType>
HRESULT CreateTypedArrayView(const VARIANT& arg0, const VARIANT& arg1, const VARIANT& arg2, IArrayBufferViewPtr& retVal)
{
	ArrayType * impl = nullptr;
	V_RET(ArrayType::CreateInstance(&impl));
	CComPtr<ArrayType> view(impl);
	
	V_RET(view->Init(arg0, arg1, arg2));

	retVal.Attach(view.Detach());

	return S_OK;
}

template <typename T>
HRESULT TypedArrayMaker(DISPPARAMS& params, CComVariant& result)
{
	const ULONG Count = 3;

	if (params.cArgs > Count || params.cArgs < 1)
		return E_INVALIDARG;

	CComVariant var[Count];
	for( LONG i = (LONG)params.cArgs-1, n = 0; i >= 0 && n < Count; --i, ++n)
	{
		var[n] = params.rgvarg[i];
	}

	IArrayBufferViewPtr buf;
	V_RET(CreateTypedArrayView<Type2Type<T>::Type >(var[0], var[1], var[2], buf));

	result = buf;
	return S_OK;
}

template <typename T>
HRESULT TypedArrayConstProperties(CAtlArray<std::pair<const CComBSTR, const CComVariant> >& props)
{
	props.Add(std::make_pair(CComBSTR(L"BYTES_PER_ELEMENT"), CComVariant(sizeof(T))));

	return S_OK;
}

HRESULT NoTypeProperties(CAtlArray<std::pair<const CComBSTR, const CComVariant> >& props);
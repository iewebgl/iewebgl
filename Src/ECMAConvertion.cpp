#include "stdafx.h"
#include "ECMAConvertion.h"
#include "TypedArray/TypedArrayMaker.h"

#include "TlsData.h"

#include <cfloat>

using namespace ATL;

const unsigned __int32 FltNaN = 0x7FC00000; // float NaN represention
const unsigned __int64 DblNaN = 0x7FF8000000000000; // double NaN representation
const unsigned __int32 FltPosInf = 0x7F800000; // +INF
const unsigned __int32 FltNegInf = 0xFF800000; // -INF
const unsigned __int64 DblPosInf = 0x7FF0000000000000; // +INF
const unsigned __int64 DblNegInf = 0xFFF0000000000000; // -INF


template <size_t T> struct VT2Type { /* unsupported VARIANT type hook */ }; 
template <> struct VT2Type<VT_EMPTY> { typedef void Type; }; 
template <> struct VT2Type<VT_NULL> { typedef void Type; }; 
template <> struct VT2Type<VT_BOOL> { typedef BOOL Type; }; 
template <> struct VT2Type<VT_I1> { typedef char Type; }; 
template <> struct VT2Type<VT_UI1> { typedef unsigned char Type; }; 
template <> struct VT2Type<VT_I2> { typedef short Type; }; 
template <> struct VT2Type<VT_UI2> { typedef unsigned short Type; }; 
template <> struct VT2Type<VT_I4> { typedef int Type; }; 
template <> struct VT2Type<VT_UI4> { typedef unsigned int Type; }; 
template <> struct VT2Type<VT_R4> { typedef float Type; }; 
template <> struct VT2Type<VT_R8> { typedef double Type; }; 

template <size_t> struct Nan {};
template <> struct Nan<VT_R4> { static const unsigned __int32 Value = FltNaN; };
template <> struct Nan<VT_R8> { static const unsigned __int64 Value = DblNaN; };

template <size_t> struct Inf {};
template <> struct Inf<VT_R4>
{
	static const unsigned __int32 Positive = FltPosInf;
	static const unsigned __int32 Negative = FltNegInf;
};
template <> struct Inf<VT_R8>
{
	static const unsigned __int64 Positive = DblPosInf;
	static const unsigned __int64 Negative = DblNegInf;
};


extern GUID IID_IEWebGLObjectMarker;

template <size_t D, size_t S>
HRESULT Num2Num(VARIANT& dest, const VARIANT& src)
{
	dest.vt = D;
	*(VT2Type<D>::Type*)&dest.ullVal = (VT2Type<D>::Type)*(const VT2Type<S>::Type*)&src.ullVal;
	return S_OK;
}

template <size_t D, size_t S>
HRESULT Flt2Num(VARIANT& dest, const VARIANT& src)
{
	dest.vt = D;
	if ( !_finite(*(VT2Type<S>::Type*)&src.ullVal) || _isnan(*(VT2Type<S>::Type*)&src.ullVal) )
		*(VT2Type<D>::Type*)&dest.ullVal = 0;
	else
		*(VT2Type<D>::Type*)&dest.ullVal = (VT2Type<D>::Type)(LONGLONG)*(VT2Type<S>::Type*)&src.ullVal;
	return S_OK;
}

template <size_t D>
HRESULT Bool2Num(VARIANT& dest, const VARIANT& src)
{
	dest.vt = D;
	*(VT2Type<D>::Type*)&dest.ullVal = (VT2Type<D>::Type)(src.boolVal != 0);
	return S_OK;
}

template <size_t D>
HRESULT Str2Int(VARIANT& dest, const VARIANT& src)
{
	BYTE dig[64] = {0};
	NUMPARSE numParse = {0};
	numParse.cDig = sizeof(dig);
	numParse.dwInFlags = NUMPRS_STD & ~NUMPRS_HEX_OCT;
	
	HRESULT hr = VarParseNumFromStr(src.bstrVal, LOCALE_NEUTRAL, numParse.dwInFlags, &numParse, dig);
	if (SUCCEEDED(hr))
	{
		hr = VarNumFromParseNum(&numParse, dig, VTBIT_I8, &dest);
		if (SUCCEEDED(hr))
		{
			dest.vt = D;
		}
		else if (DISP_E_OVERFLOW == hr)
		{
			dest.vt = D;
			*(VT2Type<D>::Type*)&dest.ullVal = 0;	
			return S_OK;
		}
	}
	else if (DISP_E_TYPEMISMATCH == hr)
	{
		VARIANT v;
		v.vt = VT_I4;
		if ( swscanf(src.bstrVal, L"%x", &v.lVal) == 1 && v.lVal > 0 )
		{
			return Num2Num<D, VT_I4>(dest, v);
		}
		else
		{
			dest.vt = D;
			*(VT2Type<D>::Type*)&dest.ullVal = 0;	
			return S_OK;
		}
	}
	else if (DISP_E_OVERFLOW == hr)
	{
		dest.vt = D;
		*(VT2Type<D>::Type*)&dest.ullVal = 0;	
		return S_OK;
	}
	
	return S_OK;
}

HRESULT Int2Str(VARIANT& dest, const VARIANT& src)
{
	return VariantChangeType(&dest, &src, 0, VT_BSTR);
}

template <size_t D>
HRESULT Str2Flt(VARIANT& dest, const VARIANT& src)
{
	double val;
	dest.vt = D;
	HRESULT hr = VarR8FromStr(src.bstrVal, LOCALE_INVARIANT, 0, &val);
	if (SUCCEEDED(hr))
	{
		*(VT2Type<D>::Type*)&dest.ullVal = (VT2Type<D>::Type)val;
	}
	else if (DISP_E_OVERFLOW == hr)
	{
		
		CComVariant Zero(0);
		CComVariant v(src);

		HRESULT cmpResult = VarCmp(&v, &Zero, LOCALE_INVARIANT);
		if (cmpResult == VARCMP_GT) { *(VT2Type<D>::Type*)&dest.ullVal = *(VT2Type<D>::Type*)&Inf<D>::Positive; return S_OK; }
		if (cmpResult == VARCMP_LT) { *(VT2Type<D>::Type*)&dest.ullVal = *(VT2Type<D>::Type*)&Inf<D>::Negative; return S_OK; }
		if (cmpResult == S_FALSE) { *(VT2Type<D>::Type*)&dest.ullVal = *(VT2Type<D>::Type*)&Nan<D>::Value; return S_OK; }

		return E_FAIL;
	}
	else if (DISP_E_TYPEMISMATCH == hr)
	{
		VARIANT v;
		v.vt = VT_I4;
		if ( swscanf(src.bstrVal, L"%x", &v.lVal) == 1 && v.lVal > 0 )
		{
			return Num2Num<D, VT_I4>(dest, v);
		}

		if (SysStringLen(src.bstrVal) == 0)
		{
			*(VT2Type<D>::Type*)&dest.ullVal = 0;
		}
		else
		{
			*(VT2Type<D>::Type*)&dest.ullVal = *(VT2Type<D>::Type*)&Nan<D>::Value;
		}
	}
	else
	{
		*(VT2Type<D>::Type*)&dest.ullVal = 0;
	}

	return S_OK;
}

HRESULT Flt2Str(VARIANT& dest, const VARIANT& src)
{
	return VariantChangeType(&dest, &src, 0, VT_BSTR);
}

HRESULT Str2Bool(VARIANT& dest, const VARIANT& src)
{
	UINT l = SysStringLen(src.bstrVal);
	dest.vt = VT_BOOL;
	dest.boolVal = l > 0;
	return S_OK;
}

HRESULT Bool2Str(VARIANT& dest, const VARIANT& src)
{
	dest.vt = VT_BSTR;
	dest.bstrVal = SysAllocString(src.boolVal ? L"true" : L"false");
	return S_OK;
}

template <size_t D>
HRESULT Null(VARIANT& dest, const VARIANT& src)
{
	dest.vt = D;
	dest.ullVal = 0;
	return S_OK;
}

template <>
HRESULT Null<VT_BSTR>(VARIANT& dest, const VARIANT& src)
{
	dest.vt = VT_BSTR;
	dest.bstrVal= SysAllocString(L"null");
	return S_OK;
}

template <size_t D>
HRESULT Undefined(VARIANT& dest, const VARIANT& src)
{
	dest.vt = D;
	dest.ullVal = 0;
	return S_OK;
}

template <> HRESULT Undefined<VT_R4>(VARIANT& dest, const VARIANT& src)
{
	dest.vt = VT_R4;
	dest.fltVal = *(float*)&FltNaN;
	return S_OK;
}

template <> HRESULT Undefined<VT_R8>(VARIANT& dest, const VARIANT& src)
{
	dest.vt = VT_R8;
	dest.dblVal = *(double*)&DblNaN;
	return S_OK;
}

template <> HRESULT Undefined<VT_BSTR>(VARIANT& dest, const VARIANT& src)
{
	dest.vt = VT_BSTR;
	dest.bstrVal= SysAllocString(L"undefined");
	return S_OK;
}

HRESULT Copy(VARIANT& dest, const VARIANT& src)
{
	return VariantCopy(&dest, &src);
}


CComPtr<IDispatchEx> GetHTMLWindow()
{
	if (g_TlsIdx == ~0u)
		return nullptr;

	CComPtr<IHTMLWindow2> htmlWindow;
	CComQIPtr<IOleControlSite> controlSite( ((TlsData*)TlsGetValue(g_TlsIdx))->clientSite );
	if ( !controlSite )
		return nullptr;

	CComPtr<IDispatch> dispControl;
	if (FAILED(controlSite->GetExtendedControl(&dispControl))) return nullptr;

	CComQIPtr<IHTMLElement> htmlElement(dispControl);
	CComPtr<IDispatch> doc;
	if (FAILED(htmlElement->get_document(&doc))) return nullptr;

	CComQIPtr<IHTMLDocument2> htmlDocument2(doc);
	if (!htmlDocument2)
		return nullptr;

	if (FAILED(htmlDocument2->get_parentWindow(&htmlWindow))) return nullptr;

	CComQIPtr<IDispatchEx> winEx(htmlWindow);
	return winEx;
}

CComPtr<IDispatch> CreateNativeUint8Array(CComPtr<IDispatch> arrayBuffer)
{
	CComPtr<IDispatchEx> winEx(GetHTMLWindow());
	CComPtr<IDispatch> win(winEx);

	if (!win)
		return nullptr;

	CComVariant arg(arrayBuffer);
	CComVariant result;
	DISPPARAMS params;
	params.cArgs = 1;
	params.cNamedArgs = 0;
	params.rgdispidNamedArgs = nullptr;
	params.rgvarg = (VARIANTARG*)&arg;

	DISPID dataViewConstructorID = ~0u;
	if (FAILED(win.GetIDOfName(L"Uint8Array", &dataViewConstructorID))) return nullptr;
	if (FAILED(winEx->InvokeEx(dataViewConstructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr))) return nullptr;

	CComPtr<IDispatch> dataView = result.pdispVal;
	return dataView;
}

CComPtr<IDispatch> CreateNativeDataView(CComPtr<IDispatch> arrayBuffer)
{
	CComPtr<IDispatchEx> winEx(GetHTMLWindow());
	CComPtr<IDispatch> win(winEx);
		
	if (!win)
		return nullptr;

	CComVariant arg(arrayBuffer);
	CComVariant result;
	DISPPARAMS params;
	params.cArgs = 1;
	params.cNamedArgs = 0;
	params.rgdispidNamedArgs = nullptr;
	params.rgvarg = (VARIANTARG*)&arg;

	DISPID dataViewConstructorID = ~0u;
	if (FAILED(win.GetIDOfName(L"DataView", &dataViewConstructorID))) return nullptr;
	if (FAILED(winEx->InvokeEx(dataViewConstructorID, LOCALE_USER_DEFAULT, DISPATCH_CONSTRUCT, &params, &result, nullptr, nullptr))) return nullptr;

	CComPtr<IDispatch> dataView = result.pdispVal;
	return dataView;
}

HRESULT CopyDataView(CComPtr<IDispatch> disp, VARIANT& dest)
{
	CComVariant byteLength;
	V_RET(disp.GetPropertyByName(L"byteLength", &byteLength));

	TlsData* data = ((TlsData*)TlsGetValue(g_TlsIdx));
	if (data->nativeArrayBuffer && byteLength.ulVal <= NativeArrayBufferSize)
	{
		CComVariant prop;
		V_RET(disp.GetPropertyByName(L"buffer", &prop));

		CComPtr<IDispatch> buf(prop.pdispVal);
		CComPtr<IDispatch> view = CreateNativeUint8Array(buf);

		CComVariant arg(view);
		V_RET(CComPtr<IDispatch>(data->uint8Array).Invoke1(L"set", &arg));

		CComVariant arrayBufferArg(data->ieWebGLArrayBuffer);
		CComVariant byteOffset(0);
		IArrayBufferViewPtr retView;
		V_RET(CreateTypedArrayView<Type2Type<void>::Type>(arrayBufferArg, byteOffset, byteLength, retView));

		dest.vt = VT_DISPATCH;
		dest.pdispVal = retView.Detach();
		return S_OK;
	}
	else
	{
		IArrayBufferViewPtr view;
		IArrayBufferPtr arrayBuffer;
		VARIANT empty = {0};

		V_RET(CreateArrayBuffer(byteLength.lVal, arrayBuffer));

		CComVariant arrayBufferArg(arrayBuffer);
		V_RET(CreateTypedArrayView<Type2Type<void>::Type>(arrayBufferArg, empty, empty, view));

		CComQIPtr<IDataArrayView> dataView(view);

		DISPID dispID32 = ~0u;
		DISPID dispID8 = ~0u;
		V_RET(disp.GetIDOfName(L"getUint32", &dispID32));
		V_RET(disp.GetIDOfName(L"getUint8", &dispID8));

		CComVariant offset(0);
		CComVariant val(0);

		for (int i = 0; i < byteLength.lVal/4; ++i)
		{
			offset.lVal = i*4;
			disp.Invoke1(dispID32, &offset, &val);
			dataView->setUint32(offset.lVal, val, empty);
		}
		for (int i = byteLength.lVal & (~3); i < byteLength.lVal; ++i)
		{
			offset.lVal = i;
			disp.Invoke1(dispID8, &offset, &val);
			dataView->setUint8(i, val);
		}

		dest.vt = VT_DISPATCH;
		dest.pdispVal = view.Detach();
		return S_OK;
	}
}

HRESULT CopyArrayBuffer(CComPtr<IDispatch> disp, VARIANT& dest)
{
	CComVariant byteLength;
	V_RET(disp.GetPropertyByName(L"byteLength", &byteLength));

	TlsData* data = ((TlsData*)TlsGetValue(g_TlsIdx));
	if (data->nativeArrayBuffer && byteLength.ulVal <= NativeArrayBufferSize ) // use fast path
	{
		CComPtr<IDispatch> view = CreateNativeUint8Array(disp);
		CComPtr<IDispatch> nativeView(data->uint8Array);
		CComVariant arg(view);
		V_RET(nativeView.Invoke1(L"set", &arg));

		BYTE * mem = nullptr;
		V_RET(data->ieWebGLArrayBuffer->get_mem(&mem));

		IArrayBufferPtr arrayBuffer;
		// can safely use non-owned memory here, because life time of ArrayBuffer
		// created inside this block will always be shorter than global array buffer, that owns memory
		V_RET(CreateArrayBuffer(mem, byteLength.ulVal, arrayBuffer));

		dest.vt = VT_DISPATCH;
		dest.pdispVal = arrayBuffer.Detach();

		return S_OK;
	}
	else // use slow universal path
	{
		CComPtr<IDispatch> dataView(CreateNativeDataView(disp));
		CComVariant temp;

		if (!dataView)
			return E_FAIL;

		V_RET(CopyDataView(dataView, temp));

		CComQIPtr<IArrayBufferView> iewebglDataView(temp.pdispVal);
		dest.vt = VT_DISPATCH;
		V_RET(iewebglDataView->get_buffer((IArrayBuffer**)&dest.pdispVal));

		return S_OK;
	}
}

template <typename T> inline T GetVariantValue(const VARIANT& v) { return 0; }
template <> inline char GetVariantValue(const VARIANT& v) { return v.cVal; }
template <> inline unsigned char GetVariantValue(const VARIANT& v) { return v.bVal; }
template <> inline signed short GetVariantValue(const VARIANT& v) { return v.iVal; }
template <> inline unsigned short GetVariantValue(const VARIANT& v) { return v.uiVal; }
template <> inline signed int GetVariantValue(const VARIANT& v) { return v.lVal; }
template <> inline unsigned int GetVariantValue(const VARIANT& v) { return v.ulVal; }
template <> inline float GetVariantValue(const VARIANT& v) { return (float)v.dblVal; }
template <> inline double GetVariantValue(const VARIANT& v) { return v.dblVal; }

template <typename T> IDispatch* GetView(TlsData*) { return nullptr; }
template <> IDispatch* GetView<char>(TlsData* data) { return data->int8Array; }
template <> IDispatch* GetView<unsigned char>(TlsData* data) { return data->uint8Array; }
template <> IDispatch* GetView<signed short>(TlsData* data) { return data->int16Array; }
template <> IDispatch* GetView<unsigned short>(TlsData* data) { return data->uint16Array; }
template <> IDispatch* GetView<signed int>(TlsData* data) { return data->int32Array; }
template <> IDispatch* GetView<unsigned int>(TlsData* data) { return data->uint32Array; }
template <> IDispatch* GetView<float>(TlsData* data) { return data->float32Array; }
template <> IDispatch* GetView<double>(TlsData* data) { return data->float64Array; }

template <typename T>
HRESULT CopyTypedArray(CComPtr<IDispatch> disp, VARIANT& dest)
{
	CComVariant length;
	V_RET(disp.GetPropertyByName(L"length", &length));

	TlsData* data = ((TlsData*)TlsGetValue(g_TlsIdx));
	CComPtr<IDispatch> nativeView = GetView<T>(data);
	if (nativeView && length.ulVal <= (NativeArrayBufferSize / sizeof(T)) ) // use fast path: copy to intermediate array using TypedArray.set(), and wrap byte range to IEwebGL TypedArray view
	{
		CComVariant arg(disp);
		CComVariant offset(0);
		V_RET(nativeView.Invoke2(L"set", &arg, &offset));

		IArrayBufferViewPtr view;
		VARIANT empty = {0};
		V_RET(CreateTypedArrayView<Type2Type<T>::Type>(CComVariant(data->ieWebGLArrayBuffer), CComVariant(0), length, view));

		dest.vt = VT_DISPATCH;
		dest.pdispVal = view.Detach();

		return S_OK;
	}
	else // copy element by element, slow universal path
	{
		IArrayBufferViewPtr view;
		VARIANT empty = {0};
		V_RET(CreateTypedArrayView<Type2Type<T>::Type>(length, empty, empty, view));
		T * mem = nullptr;
		V_RET(view->get_mem((byte**)&mem));

		CComVariant val;
		DISPPARAMS params = {nullptr, nullptr, 0, 0};
		DISPID id = 0;
		wchar_t buf[32];
		for (int i = 0; i < length.intVal; ++i)
		{
			_itow(i, buf, 10);
			disp.GetIDOfName(buf, &id);
			HRESULT hr = disp->Invoke(id, IID_NULL, LOCALE_USER_DEFAULT, DISPATCH_PROPERTYGET, &params, &val, nullptr, nullptr);
			mem[i] = GetVariantValue<T>(val);
		}
		dest.vt = VT_DISPATCH;
		dest.pdispVal = view.Detach();
		return S_OK;
	}
}

HRESULT DispCopy(VARIANT& dest, const VARIANT& src)
{
	if (src.vt == VT_DISPATCH && src.pdispVal != nullptr)
	{
		CComPtr<IUnknown> t;
		if ( FAILED(src.pdispVal->QueryInterface(IID_IEWebGLObjectMarker, (void**)&t)) ) // not an IEWebGL object
		{
			CComPtr<IDispatch> disp(src.pdispVal);
			CComVariant typeName;
			if ( SUCCEEDED(disp.Invoke0(L"toString", &typeName)) )
			{
				if (wcscmp(typeName.bstrVal, L"[object Float32Array]") == 0) return CopyTypedArray<float>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Uint16Array]") == 0) return CopyTypedArray<unsigned short>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object ArrayBuffer]") == 0) return CopyArrayBuffer(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Int16Array]") == 0) return CopyTypedArray<signed short>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Uint32Array]") == 0) return CopyTypedArray<unsigned int>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Int32Array]") == 0) return CopyTypedArray<signed int>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Uint8Array]") == 0) return CopyTypedArray<unsigned char>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Int8Array]") == 0) return CopyTypedArray<char>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object Float64Array]") == 0) return CopyTypedArray<double>(disp, dest);
				if (wcscmp(typeName.bstrVal, L"[object DataView]") == 0) return CopyDataView(disp, dest);
			}
		}
	}

	return VariantCopy(&dest, &src);
}

HRESULT Error(VARIANT& dest, const VARIANT& src)
{
	return DISP_E_TYPEMISMATCH;
}

typedef HRESULT (*ConvFunction)(VARIANT& dest, const VARIANT& src);
static const size_t ConvCount = 27;
static ConvFunction Converter[ConvCount*ConvCount];

class Conv
{
public:
	static ConvFunction GetConverter(ULONG from, ULONG to) { return ConvRef(from, to); }

	Conv()
	{
		for ( size_t i = 0; i < sizeof(Converter)/sizeof(Converter[0]); ++i)
			Converter[i] = Error;

		ConvRef(VT_I1, VT_I1) = Num2Num<VT_I1, VT_I1>;
		ConvRef(VT_I1, VT_UI1) = Num2Num<VT_I1, VT_UI1>;
		ConvRef(VT_I1, VT_I2) = Num2Num<VT_I1, VT_I2>;
		ConvRef(VT_I1, VT_UI2) = Num2Num<VT_I1, VT_UI2>;
		ConvRef(VT_I1, VT_I4) = Num2Num<VT_I1, VT_I4>;
		ConvRef(VT_I1, VT_UI4) = Num2Num<VT_I1, VT_UI4>;
		ConvRef(VT_I1, VT_R4) = Flt2Num<VT_I1, VT_R4>;
		ConvRef(VT_I1, VT_R8) = Flt2Num<VT_I1, VT_R8>;
		ConvRef(VT_I1, VT_BOOL) = Bool2Num<VT_I1>;
		ConvRef(VT_I1, VT_EMPTY) = Undefined<VT_I1>;
		ConvRef(VT_I1, VT_NULL) = Null<VT_I1>;
		ConvRef(VT_I1, VT_BSTR) = Str2Int<VT_I1>;

		ConvRef(VT_UI1, VT_I1) = Num2Num<VT_UI1, VT_I1>;
		ConvRef(VT_UI1, VT_UI1) = Num2Num<VT_UI1, VT_UI1>;
		ConvRef(VT_UI1, VT_I2) = Num2Num<VT_UI1, VT_I2>;
		ConvRef(VT_UI1, VT_UI2) = Num2Num<VT_UI1, VT_UI2>;
		ConvRef(VT_UI1, VT_I4) = Num2Num<VT_UI1, VT_I4>;
		ConvRef(VT_UI1, VT_UI4) = Num2Num<VT_UI1, VT_UI4>;
		ConvRef(VT_UI1, VT_R4) = Flt2Num<VT_UI1, VT_R4>;
		ConvRef(VT_UI1, VT_R8) = Flt2Num<VT_UI1, VT_R8>;
		ConvRef(VT_UI1, VT_BOOL) = Bool2Num<VT_UI1>;
		ConvRef(VT_UI1, VT_EMPTY) = Undefined<VT_UI1>;
		ConvRef(VT_UI1, VT_NULL) = Null<VT_UI1>;
		ConvRef(VT_UI1, VT_BSTR) = Str2Int<VT_UI1>;

		ConvRef(VT_I2, VT_I1) = Num2Num<VT_I2, VT_I1>;
		ConvRef(VT_I2, VT_UI1) = Num2Num<VT_I2, VT_UI1>;
		ConvRef(VT_I2, VT_I2) = Num2Num<VT_I2, VT_I2>;
		ConvRef(VT_I2, VT_UI2) = Num2Num<VT_I2, VT_UI2>;
		ConvRef(VT_I2, VT_I4) = Num2Num<VT_I2, VT_I4>;
		ConvRef(VT_I2, VT_UI4) = Num2Num<VT_I2, VT_UI4>;
		ConvRef(VT_I2, VT_R4) = Flt2Num<VT_I2, VT_R4>;
		ConvRef(VT_I2, VT_R8) = Flt2Num<VT_I2, VT_R8>;
		ConvRef(VT_I2, VT_BOOL) = Bool2Num<VT_I2>;
		ConvRef(VT_I2, VT_EMPTY) = Undefined<VT_I2>;
		ConvRef(VT_I2, VT_NULL) = Null<VT_I2>;
		ConvRef(VT_I2, VT_BSTR) = Str2Int<VT_I2>;

		ConvRef(VT_UI2, VT_I1) = Num2Num<VT_UI2, VT_I1>;
		ConvRef(VT_UI2, VT_UI1) = Num2Num<VT_UI2, VT_UI1>;
		ConvRef(VT_UI2, VT_I2) = Num2Num<VT_UI2, VT_I2>;
		ConvRef(VT_UI2, VT_UI2) = Num2Num<VT_UI2, VT_UI2>;
		ConvRef(VT_UI2, VT_I4) = Num2Num<VT_UI2, VT_I4>;
		ConvRef(VT_UI2, VT_UI4) = Num2Num<VT_UI2, VT_UI4>;
		ConvRef(VT_UI2, VT_R4) = Flt2Num<VT_UI2, VT_R4>;
		ConvRef(VT_UI2, VT_R8) = Flt2Num<VT_UI2, VT_R8>;
		ConvRef(VT_UI2, VT_BOOL) = Bool2Num<VT_UI2>;
		ConvRef(VT_UI2, VT_EMPTY) = Undefined<VT_UI2>;
		ConvRef(VT_UI2, VT_NULL) = Null<VT_UI2>;
		ConvRef(VT_UI2, VT_BSTR) = Str2Int<VT_UI2>;

		ConvRef(VT_I4, VT_I1) = Num2Num<VT_I4, VT_I1>;
		ConvRef(VT_I4, VT_UI1) = Num2Num<VT_I4, VT_UI1>;
		ConvRef(VT_I4, VT_I2) = Num2Num<VT_I4, VT_I2>;
		ConvRef(VT_I4, VT_UI2) = Num2Num<VT_I4, VT_UI2>;
		ConvRef(VT_I4, VT_I4) = Num2Num<VT_I4, VT_I4>;
		ConvRef(VT_I4, VT_UI4) = Num2Num<VT_I4, VT_UI4>;
		ConvRef(VT_I4, VT_R4) = Flt2Num<VT_I4, VT_R4>;
		ConvRef(VT_I4, VT_R8) = Flt2Num<VT_I4, VT_R8>;
		ConvRef(VT_I4, VT_BOOL) = Bool2Num<VT_I4>;
		ConvRef(VT_I4, VT_EMPTY) = Undefined<VT_I4>;
		ConvRef(VT_I4, VT_NULL) = Null<VT_I4>;
		ConvRef(VT_I4, VT_BSTR) = Str2Int<VT_I4>;

		ConvRef(VT_UI4, VT_I1) = Num2Num<VT_UI4, VT_I1>;
		ConvRef(VT_UI4, VT_UI1) = Num2Num<VT_UI4, VT_UI1>;
		ConvRef(VT_UI4, VT_I2) = Num2Num<VT_UI4, VT_I2>;
		ConvRef(VT_UI4, VT_UI2) = Num2Num<VT_UI4, VT_UI2>;
		ConvRef(VT_UI4, VT_I4) = Num2Num<VT_UI4, VT_I4>;
		ConvRef(VT_UI4, VT_UI4) = Num2Num<VT_UI4, VT_UI4>;
		ConvRef(VT_UI4, VT_R4) = Flt2Num<VT_UI4, VT_R4>;
		ConvRef(VT_UI4, VT_R8) = Flt2Num<VT_UI4, VT_R8>;
		ConvRef(VT_UI4, VT_BOOL) = Bool2Num<VT_UI4>;
		ConvRef(VT_UI4, VT_EMPTY) = Undefined<VT_UI4>;
		ConvRef(VT_UI4, VT_NULL) = Null<VT_UI4>;
		ConvRef(VT_UI4, VT_BSTR) = Str2Int<VT_UI4>;

		ConvRef(VT_R4, VT_I1) = Num2Num<VT_R4, VT_I1>;
		ConvRef(VT_R4, VT_UI1) = Num2Num<VT_R4, VT_UI1>;
		ConvRef(VT_R4, VT_I2) = Num2Num<VT_R4, VT_I2>;
		ConvRef(VT_R4, VT_UI2) = Num2Num<VT_R4, VT_UI2>;
		ConvRef(VT_R4, VT_I4) = Num2Num<VT_R4, VT_I4>;
		ConvRef(VT_R4, VT_UI4) = Num2Num<VT_R4, VT_UI4>;
		ConvRef(VT_R4, VT_R4) = Num2Num<VT_R4, VT_R4>;
		ConvRef(VT_R4, VT_R8) = Num2Num<VT_R4, VT_R8>;
		ConvRef(VT_R4, VT_BOOL) = Bool2Num<VT_R4>;
		ConvRef(VT_R4, VT_EMPTY) = Undefined<VT_R4>;
		ConvRef(VT_R4, VT_NULL) = Null<VT_R4>;
		ConvRef(VT_R4, VT_BSTR) = Str2Flt<VT_R4>;

		ConvRef(VT_R8, VT_I1) = Num2Num<VT_R8, VT_I1>;
		ConvRef(VT_R8, VT_UI1) = Num2Num<VT_R8, VT_UI1>;
		ConvRef(VT_R8, VT_I2) = Num2Num<VT_R8, VT_I2>;
		ConvRef(VT_R8, VT_UI2) = Num2Num<VT_R8, VT_UI2>;
		ConvRef(VT_R8, VT_I4) = Num2Num<VT_R8, VT_I4>;
		ConvRef(VT_R8, VT_UI4) = Num2Num<VT_R8, VT_UI4>;
		ConvRef(VT_R8, VT_R4) = Num2Num<VT_R8, VT_R4>;
		ConvRef(VT_R8, VT_R8) = Num2Num<VT_R8, VT_R8>;
		ConvRef(VT_R8, VT_BOOL) = Bool2Num<VT_R8>;
		ConvRef(VT_R8, VT_EMPTY) = Undefined<VT_R8>;
		ConvRef(VT_R8, VT_NULL) = Null<VT_R8>;
		ConvRef(VT_R8, VT_BSTR) = Str2Flt<VT_R8>;

		ConvRef(VT_BOOL, VT_I4) = Num2Num<VT_BOOL, VT_I4>;
		ConvRef(VT_BOOL, VT_R8) = Flt2Num<VT_BOOL, VT_R8>;
		ConvRef(VT_BOOL, VT_BOOL) = Num2Num<VT_BOOL, VT_BOOL>;
		ConvRef(VT_BOOL, VT_EMPTY) = Undefined<VT_BOOL>;
		ConvRef(VT_BOOL, VT_NULL) = Null<VT_BOOL>;
		ConvRef(VT_BOOL, VT_BSTR) = Str2Bool;

		ConvRef(VT_BSTR, VT_I4) = Flt2Str;
		ConvRef(VT_BSTR, VT_R8) = Int2Str;
		ConvRef(VT_BSTR, VT_BOOL) = Bool2Str;
		ConvRef(VT_BSTR, VT_EMPTY) = Undefined<VT_BSTR>;
		ConvRef(VT_BSTR, VT_NULL) = Null<VT_BSTR>;
		ConvRef(VT_BSTR, VT_BSTR) = Copy;

		ConvRef(VT_VARIANT, VT_I1) = Copy;
		ConvRef(VT_VARIANT, VT_UI1) = Copy;
		ConvRef(VT_VARIANT, VT_I2) = Copy;
		ConvRef(VT_VARIANT, VT_UI2) = Copy;
		ConvRef(VT_VARIANT, VT_I4) = Copy;
		ConvRef(VT_VARIANT, VT_UI4) = Copy;
		ConvRef(VT_VARIANT, VT_R4) = Copy;
		ConvRef(VT_VARIANT, VT_R8) = Copy;
		ConvRef(VT_VARIANT, VT_BOOL) = Copy;
		ConvRef(VT_VARIANT, VT_BSTR) = Copy;
		ConvRef(VT_VARIANT, VT_DISPATCH) = DispCopy;//Copy;
		ConvRef(VT_VARIANT, VT_PTR) = Copy;
		ConvRef(VT_VARIANT, VT_EMPTY) = Copy;
		ConvRef(VT_VARIANT, VT_NULL) = Copy;

		ConvRef(VT_DISPATCH, VT_DISPATCH) = DispCopy;//Copy;
		ConvRef(VT_DISPATCH, VT_EMPTY) = Undefined<VT_DISPATCH>;
		ConvRef(VT_DISPATCH, VT_NULL) = Null<VT_DISPATCH>;
		ConvRef(VT_DISPATCH, VT_PTR) = Copy;

		ConvRef(VT_PTR, VT_DISPATCH) = DispCopy;//Copy;
		ConvRef(VT_PTR, VT_EMPTY) = Undefined<VT_DISPATCH>;
		ConvRef(VT_PTR, VT_NULL) = Null<VT_DISPATCH>;
		ConvRef(VT_PTR, VT_PTR) = Copy;
	}

private:
	static ConvFunction& ConvRef(ULONG from, ULONG to) { return Converter[from*ConvCount + to]; }
} g_init;

HRESULT DataConvertion::ECMACvt( VARIANT& dest, const VARIANT& src, VARTYPE destVt)
{
	switch (destVt)
	{
	case VT_I1: case VT_I2: case VT_I4: case VT_UI1: case VT_UI2: case VT_UI4: case VT_R4: case VT_R8:
	case VT_BOOL: case VT_DISPATCH: case VT_PTR: case VT_BSTR: case VT_VARIANT: break;
	default: return DISP_E_BADVARTYPE;
	}

	switch (src.vt)
	{
	case VT_I1: case VT_I2: case VT_I4: case VT_UI1: case VT_UI2: case VT_UI4: case VT_R4: case VT_R8: 
	case VT_BOOL: case VT_DISPATCH: case VT_BSTR: case VT_VARIANT: case VT_EMPTY: case VT_NULL:	break;
	default: return DISP_E_BADVARTYPE;
	}


	VARIANT t = {0};
	V_RET(Conv::GetConverter(destVt, src.vt)(t, src));

	dest = t;
	return S_OK;
}

HRESULT DataConvertion::CopyBackArrayBufferView(const VARIANT& src, VARIANT& dest)
{
	if (src.vt == VT_DISPATCH && src.pdispVal &&
		dest.vt == VT_DISPATCH && dest.pdispVal &&
		src.pdispVal != dest.pdispVal)
	{
		IArrayBufferViewPtr view;
		if ( SUCCEEDED(src.pdispVal->QueryInterface(IID_IArrayBufferView, (void**)&view)) )
		{
			BOOL isModified = FALSE;
			view->get_modified(&isModified);
			if (isModified)
			{
				CComPtr<IDispatch> destView(dest.pdispVal);
				CComVariant buffer;
				V_RET(destView.GetPropertyByName(L"buffer", &buffer));
				CComPtr<IDispatch> destBuffer(buffer.pdispVal);

				CComVariant bufferLength;
				destBuffer.GetPropertyByName(L"byteLength", &bufferLength);

				CComPtr<IDispatch> dataView(CreateNativeDataView(destBuffer));
				if (!dataView)
					return E_FAIL;

				unsigned char * mem = nullptr;
				view->get_mem(&mem);

				ULONG viewLength = 0;
				view->get_byteLength(&viewLength);

				if (viewLength != bufferLength.ulVal)
					return E_FAIL;

				VARIANT offset;
				offset.vt = VT_UI4;

				VARIANT val;
				val.vt = VT_UI4;

				DISPID dispID32 = ~0u, dispID8 = ~0u;
				dataView.GetIDOfName(L"setUint32", &dispID32);
				dataView.GetIDOfName(L"setUint8", &dispID8);
				for (int i = 0, l = bufferLength.lVal / 4; i < l; ++i)
				{
					offset.ulVal = i*4;
					val.ulVal = *(unsigned __int32*)(mem + offset.ulVal);
					dataView.Invoke2(dispID32, &offset, &val);
				}

				val.vt = VT_UI1;
				for (int i = (bufferLength.lVal / 4) * 4, l = bufferLength.lVal; i < l; ++i)
				{
					offset.ulVal = i;
					val.cVal = mem[offset.ulVal];
					dataView.Invoke2(dispID8, &offset, &val);
				}
			}
		}
	}
	return S_OK;
}
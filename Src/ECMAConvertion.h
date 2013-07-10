#pragma once

namespace DataConvertion
{
	using namespace ATL;

	template <typename T> struct Type2VT {/* unsupported type hook */};
	template <> struct Type2VT<char> { enum { Value = VT_I1 }; };
	template <> struct Type2VT<signed char> { enum { Value = VT_I1 }; };
	template <> struct Type2VT<unsigned char> { enum { Value = VT_UI1 }; };
	template <> struct Type2VT<signed short> { enum { Value = VT_I2 }; };
	template <> struct Type2VT<unsigned short> { enum { Value = VT_UI2 }; };
	template <> struct Type2VT<signed int> { enum { Value = VT_I4 }; };
	template <> struct Type2VT<unsigned int> { enum { Value = VT_UI4 }; };
	template <> struct Type2VT<signed long> { enum { Value = VT_I4 }; };
	template <> struct Type2VT<unsigned long> { enum { Value = VT_UI4 }; };
	template <> struct Type2VT<float> { enum { Value = VT_R4 }; };
	template <> struct Type2VT<double> { enum { Value = VT_R8 }; };
	template <> struct Type2VT<bool> { enum { Value = VT_BOOL }; };
	template <> struct Type2VT<IDispatch*> { enum { Value = VT_DISPATCH }; };

	HRESULT ECMACvt(VARIANT& dest, const VARIANT& src, VARTYPE destVt);

	template <typename T> inline HRESULT ECMACvt(T& dest, const VARIANT& src)
	{
		VARIANT v = {0};
		V_RET(ECMACvt(v, src, Type2VT<T>::Value));
		dest = *(T*)&v.ullVal;
		return S_OK;
	}

	HRESULT CopyBackArrayBufferView(const VARIANT& src, VARIANT& dest);
}

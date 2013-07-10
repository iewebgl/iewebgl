#pragma once
#include "ArrayBuffer.h"

#include "../ECMAConvertion.h"
#include "../ScriptArray.h"

#include "../JSObjectImpl.h"

#include <memory>
#include <cassert>

typedef CComPtr<ITypedArrayBufferView> ITypedArrayBufferViewPtr;
typedef CComPtr<IArrayBufferView> IArrayBufferViewPtr;

//////////////////////////////////////////////////////////////////////////
class JSObjectImpl;

template <typename DataType, typename Interface>
class TypedArrayView : public Interface
{
	struct View
	{
		View(IArrayBufferPtr arrayBuffer, ULONG byteOffset, ULONG byteLength, ULONG length) :
			arrayBuffer_(arrayBuffer),	byteOffset_(byteOffset), byteLength_(byteLength), length_(length), mem_(nullptr)
		{
			arrayBuffer_->get_mem(&mem_);
			mem_ += byteOffset_;
		}

		IArrayBufferPtr arrayBuffer_;
		ULONG byteOffset_;
		ULONG byteLength_;
		ULONG length_;
		BYTE* mem_;
	};

	DISPID zeroIndexID_;
	std::unique_ptr<View> view_;
	BOOL isModified_;

protected:
	CAutoPtr<JSObjectImpl> dispEx_;
public:
	typedef TypedArrayView<DataType, Interface> ArrayViewType;
	typedef Interface DispBase;

	TypedArrayView() : isModified_(FALSE) { }
	virtual ~TypedArrayView() {}

	//////////////////////////////////////////////////////////////////////////
	// IArrayBufferView
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(get_buffer)(IArrayBuffer** retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		V_RET(view_->arrayBuffer_.CopyTo(retVal));
		return S_OK;
	}

	STDMETHOD(get_byteOffset)(ULONG* retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		*retVal = view_->byteOffset_;
		return S_OK;
	}

	STDMETHOD(get_byteLength)(ULONG* retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		*retVal = view_->byteLength_;
		return S_OK;
	}

	STDMETHOD(get_mem)(byte** mem)
	{
		if (!mem)
			return E_INVALIDARG;

		*mem = (byte*)view_->mem_;
		return S_OK;
	}

	STDMETHOD(get_modified)(BOOL* retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		*retVal = isModified_;
		return S_OK;
	}

	STDMETHOD(put_modified)(BOOL isModified)
	{
		isModified_ = isModified;
		return S_OK;
	}

	//////////////////////////////////////////////////////////////////////////
	// ITypedArrayView
	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(get_BYTES_PER_ELEMENT)(ULONG* retVal)
	{
		if ( !retVal )
			return E_INVALIDARG;

		*retVal = sizeof(DataType);
		return S_OK;
	}

	STDMETHOD(get_length)(ULONG* retVal)
	{
		if (!retVal)
			return E_INVALIDARG;

		*retVal = view_->length_;
		return S_OK;
	}

	STDMETHOD(set)(IDispatch* array, VARIANT offset)
	{
		if (!array)
			return E_INVALIDARG;

		ULONG off = 0;
		V_RET(DataConvertion::ECMACvt(off, offset));

		CComQIPtr<ITypedArrayBufferView> webGLTypedArrayView(array);

		if (webGLTypedArrayView)
		{
			IArrayBufferPtr buf;
			V_RET(webGLTypedArrayView->get_buffer(&buf));
			if (buf == view_->arrayBuffer_)
			{
				ULONG srcByteOffset = 0;
				ULONG srcByteLength = 0;
				V_RET(webGLTypedArrayView->get_byteOffset(&srcByteOffset));
				V_RET(webGLTypedArrayView->get_byteLength(&srcByteLength));

				bool intersect =
					( (view_->byteOffset_ + off) >= srcByteOffset && (view_->byteOffset_ + off) < (srcByteOffset + srcByteLength) ) ||
					( srcByteOffset >= (view_->byteOffset_ + off) && srcByteOffset < (view_->byteOffset_ + off) + view_->byteLength_ );

				if (!intersect)
				{
					if (GetMem())
						return E_FAIL;
					return SetRange(webGLTypedArrayView, GetMem(), off);
				}
				else
				{
					CAtlArray<DataType> tempBuf;
					tempBuf.SetCount(view_->length_);
				
					V_RET(SetRange(webGLTypedArrayView, tempBuf.GetData(), off));

					if (!GetMem())
						return E_FAIL;

					memcpy(GetMem(), tempBuf.GetData(), view_->byteLength_);
					return S_OK;
				}
			}
			else
			{
				if (!GetMem())
					return E_FAIL;
				return SetRange(webGLTypedArrayView, GetMem(), off);
			}
			
		}
		else
		{
			return SetRange(array, off, false);
		}

		return DISP_E_TYPEMISMATCH;
	}

	STDMETHOD(subarray)(LONG begin, VARIANT end, ITypedArrayBufferView** retVal)
	{
		if (!retVal)
		{
			return E_INVALIDARG;
		}

		const LONG sourceLength = (LONG)view_->length_;

		LONG offBegin = min(sourceLength, ((begin > 0) ? begin : ((begin + sourceLength) > 0 ? (begin + sourceLength) : 0)) );
		LONG offEnd = sourceLength;
		if (end.vt != VT_EMPTY && end.vt != VT_ERROR)
		{
			V_RET(VariantChangeType(&end, &end, 0, VT_I4));
			offEnd = end.lVal;
		}

		offEnd = min(sourceLength, ((offEnd > 0) ? offEnd : ((offEnd + sourceLength) >= 0 ? (offEnd + sourceLength) : 0)) );

		if (offEnd < offBegin)
		{
			offEnd = offBegin;
		}

		IArrayBufferViewPtr ptr;
		V_RET(CreateInstance(view_->arrayBuffer_, offBegin*sizeof(DataType), offEnd-offBegin, ptr));

		CComQIPtr<ITypedArrayBufferView> retPtr(ptr);
		V_RET(retPtr.CopyTo(retVal));
		return S_OK;
	}

	STDMETHOD(get_item)(ULONG index, VARIANT* retVal)
	{
		if (index >= view_->length_)
		{
			return DISP_E_BADINDEX;
		}

		if (!GetMem())
			return E_FAIL;

		CComVariant v(GetMem()[(size_t)index]);
		V_RET(v.Detach(retVal));
		return S_OK;
	}

	//////////////////////////////////////////////////////////////////////////

	HRESULT Init(const VARIANT& arg0, const VARIANT& arg1, const VARIANT& arg2)
	{
		if (arg0.vt == VT_DISPATCH)
		{
			if (!arg0.pdispVal)
				return E_INVALIDARG;

			CComQIPtr<IArrayBuffer> arrBuffer(arg0.pdispVal);
			if (arrBuffer)
			{
				IArrayBuffer * arrBuf = arrBuffer;
				return Init(arrBuf, arg1, arg2);
			}
			else
			{
				return Init(arg0.pdispVal);
			}
		}
		else if (arg0.vt == (VT_ARRAY | VT_UI1) && arg0.parray && arg0.parray->cDims == 1)
		{
			IArrayBufferPtr arrayBuffer;
			V_RET(CreateArrayBuffer(arg0.parray->rgsabound[0].cElements, arrayBuffer));

			BYTE * mem = nullptr;
			V_RET(arrayBuffer->get_mem(&mem));

			memcpy(mem, arg0.parray->pvData, arg0.parray->rgsabound[0].cElements);
			VARIANT empty = {0};
			return Init(arrayBuffer, empty, empty);
		}

		CComVariant v;
		if ( SUCCEEDED(VariantChangeType(&v, &arg0, 0, VT_UI4)) )
		{
			return Init(v.ulVal);
		}

		return DISP_E_TYPEMISMATCH;
	}

	HRESULT Init(ULONG l)
	{
		const ULONG length = l;
		const ULONG byteLength = length * sizeof(DataType);

		IArrayBufferPtr buf;
		V_RET(CreateArrayBuffer(byteLength, buf));

		view_.reset(new View(buf, 0, byteLength, length));
		if (!view_)
			return E_OUTOFMEMORY;

		V_RET(InitDispEx());
		return S_OK;
	}

private:
	virtual HRESULT CreateInstance(IArrayBufferPtr arrayBuffer, ULONG offset, ULONG length, IArrayBufferViewPtr& retVal) = 0;

	HRESULT Init(CComPtr<IDispatch> arg)
	{
		if (!arg)
		{
			return E_INVALIDARG;
		}

		CComQIPtr<ITypedArrayBufferView> webGLTypedArrayView(arg);
		CComQIPtr<IDataArrayView> webGLDataView(arg);

		if (webGLTypedArrayView)
		{
			V_RET(SetRange(webGLTypedArrayView, nullptr, 0));
			V_RET(InitDispEx());
			return S_OK;
		}
		else if (!webGLDataView)
		{
			V_RET(SetRange(arg, 0, true));
			V_RET(InitDispEx());
			return S_OK;
		}

		return DISP_E_TYPEMISMATCH;
	
	}
	
	HRESULT Init(IArrayBufferPtr array, const VARIANT& byteOffset, const VARIANT& length)
	{
		if (!array)
		{
			return E_INVALIDARG;
		}

		ULONG newByteLength = 0;
		V_RET(array->get_byteLength(&newByteLength));
		const ULONG BufferByteLength = newByteLength;

		ULONG newByteOffset = 0;
		if (byteOffset.vt != VT_EMPTY)
		{
			CComVariant v(byteOffset);
			V_RET(v.ChangeType(VT_UI4));
			newByteOffset = v.ulVal;
		}

		if (newByteOffset % sizeof(DataType) != 0 || newByteLength < newByteOffset)
		{
			return E_INVALIDARG;
		}

		newByteLength -= newByteOffset;

		if (length.vt != VT_EMPTY)
		{
			CComVariant v(length);
			V_RET(v.ChangeType(VT_UI4));
			newByteLength = v.ulVal * sizeof(DataType);
		}


		if ( newByteLength % sizeof(DataType) != 0 || newByteOffset + newByteLength > BufferByteLength)
		{
			return E_INVALIDARG;
		}

		view_.reset(new View(array, newByteOffset, newByteLength, newByteLength/sizeof(DataType)));
		if (!view_)
			return E_OUTOFMEMORY;

		V_RET(InitDispEx());

		return S_OK;
	}

	HRESULT SetRange(ITypedArrayBufferViewPtr source, DataType* mem, ULONG start)
	{
		if (!source)
		{
			return E_INVALIDARG;
		}

		const ULONG length = [&]()->ULONG{ ULONG l = 0; source->get_length(&l); return l; }();
		if (length == 0)
		{
			return E_INVALIDARG;
		}

		if (!mem)
		{
			const ULONG arrayByteLength = length * sizeof(DataType);
			IArrayBufferPtr buf;
			V_RET(CreateArrayBuffer(arrayByteLength, buf));

			view_.reset(new View(buf, 0, arrayByteLength, length));
			if (!view_)
				return E_OUTOFMEMORY;

			mem = GetMem();
			if (!mem)
				return E_FAIL;
		}
		else
		{
			if ( start + length > view_->length_ )
				return DISP_E_OVERFLOW;
		}
		
		for (ULONG i = 0; i < length; ++i )
		{
			CComVariant item;
			V_RET(source->get_item(i, &item));

			V_RET(DataConvertion::ECMACvt(mem[start + i], item));
		}
		return S_OK;
	}

	HRESULT SetRange(CComPtr<IDispatch> source, ULONG start, BOOL createView)
	{
		ScriptArray<DataType> sa;
		V_RET(sa.Attach(source));
				
		ULONG length = 0;
		V_RET(sa.GetLength(length));

		if (createView)
		{
			const ULONG arrayByteLength = length * sizeof(DataType);
			IArrayBufferPtr buf;
			V_RET(CreateArrayBuffer(arrayByteLength, buf));

			view_.reset(new View(buf, 0, arrayByteLength, length));
			if (!view_)
				return E_OUTOFMEMORY;
		}
		else
		{
			if ( start + length > view_->length_ )
				return DISP_E_EXCEPTION;
		}
		

		if (!GetMem())
			return E_FAIL;

		V_RET(sa.CopyToNative(GetMem()+start, length));
		return S_OK;
	}

	DataType* GetMem()
	{
		assert(view_->mem_);
		return (DataType*)view_->mem_;
	}

	HRESULT InitDispEx()
	{
		if (dispEx_)
			return S_OK;

		JSObjectImpl * dispEx = nullptr;
		V_RET(::InitDispEx(_tih, this, view_->length_, dispEx));
		dispEx_.Attach(dispEx);
		zeroIndexID_ = dispEx->GetStartID();
		return S_OK;
	}


	//////////////////////////////////////////////////////////////////////////

	STDMETHOD(Invoke)(
		_In_ DISPID dispidMember, 
		_In_ REFIID riid,
		_In_ LCID lcid, 
		_In_ WORD wFlags, 
		_In_ DISPPARAMS* pdispparams, 
		_Out_opt_ VARIANT* pvarResult,
		_Out_opt_ EXCEPINFO* pexcepinfo, 
		_Out_opt_ UINT* puArgErr)
	{
		if (dispidMember >= zeroIndexID_ && dispidMember < zeroIndexID_ + (LONG)view_->length_)
		{
			LONG index = dispidMember - zeroIndexID_;

			if (wFlags == DISPATCH_PROPERTYGET)
			{
				return get_item(index, pvarResult);
			}
			if (wFlags == DISPATCH_PROPERTYPUT)
			{
				if (!pdispparams || pdispparams->cArgs == 0)
				{
					return E_FAIL;
				}

				if (!GetMem())
					return E_FAIL;

				V_RET(DataConvertion::ECMACvt(GetMem()[index], pdispparams->rgvarg[0]));

				return S_OK;
			}
			return E_NOTIMPL;
		}
		else
		{
			return DispBase::Invoke(dispidMember, riid, lcid, wFlags, pdispparams, pvarResult, pexcepinfo, puArgErr);
		}
	}

};





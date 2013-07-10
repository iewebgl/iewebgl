#pragma once

#include <cassert>

class WebGLObjectBaseRefPtr
{
protected:
	friend class WebGLZeroingObject;

	WebGLObjectBaseRefPtr()
		: mRawPtr(0)
	{
	}

	WebGLObjectBaseRefPtr(IUnknown *rawPtr)
		: mRawPtr(rawPtr)
	{
	}

	void Zero() {
		if (mRawPtr) {
			// Note: RemoveRefOwner isn't called here, because
			// the entire owner array will be cleared.
			mRawPtr->Release();
			mRawPtr = 0;
		}
	}

protected:
	IUnknown *mRawPtr;
};

template <class T>
class WebGLObjectRefPtr
	: public WebGLObjectBaseRefPtr
{
public:
	typedef T element_type;

	WebGLObjectRefPtr()
	{ }

	WebGLObjectRefPtr(const WebGLObjectRefPtr<T>& aSmartPtr)
		: WebGLObjectBaseRefPtr(aSmartPtr.mRawPtr)
	{
		if (mRawPtr)
		{
			RawPtr()->AddRef();
			RawPtr()->AddRefOwner(this);
		}
	}

	WebGLObjectRefPtr(T *aRawPtr)
		: WebGLObjectBaseRefPtr(aRawPtr)
	{
		if (mRawPtr)
		{
			RawPtr()->AddRef();
			RawPtr()->AddRefOwner(this);
		}
	}

	~WebGLObjectRefPtr()
	{
		if (mRawPtr)
		{
			RawPtr()->RemoveRefOwner(this);
			RawPtr()->Release();
		}
	}

	WebGLObjectRefPtr<T>&
		operator=(const WebGLObjectRefPtr<T>& rhs)
	{
		assign_with_AddRef(static_cast<T*>(rhs.mRawPtr));
		return *this;
	}

	WebGLObjectRefPtr<T>&
		operator=(T* rhs)
	{
		assign_with_AddRef(rhs);
		return *this;
	}

	T* get() const
	{
		return static_cast<T*>(mRawPtr);
	}

	operator T*() const
	{
		return get();
	}

	operator ATL::CComPtr<T>() const
	{
		return ATL::CComPtr<T>(get());
	}

	T* operator->() const
	{
		assert(mRawPtr != 0 && "You can't dereference a NULL WebGLObjectRefPtr with operator->()!");
		return get();
	}

	T& operator*() const
	{
		assert(mRawPtr != 0 && "You can't dereference a NULL WebGLObjectRefPtr with operator*()!");
		return *get();
	}

private:
	T* RawPtr() { return static_cast<T*>(mRawPtr); }

	void assign_with_AddRef(T* rawPtr)
	{
		if (rawPtr)
		{
			rawPtr->AddRef();
			rawPtr->AddRefOwner(this);
		}
		assign_assuming_AddRef(rawPtr);
	}

	void assign_assuming_AddRef(T* newPtr)
	{
		T* oldPtr = RawPtr();
		mRawPtr = newPtr;
		if (oldPtr)
		{
			oldPtr->RemoveRefOwner(this);
			oldPtr->Release();
		}
	}
};

namespace ATL
{
	template <typename T>
	class CElementTraits<WebGLObjectRefPtr<T> >
	{
		// compilation error generator - you should use CWebGLPtrElementTraits with WebGL objects
	};
}


template< typename T>
class CWebGLPtrElementTraits :
	public ATL::CElementTraitsBase< WebGLObjectRefPtr<T> >
{
	typedef WebGLObjectRefPtr<T> El;
public:
	static void RelocateElements(El* pDest, El* pSrc, size_t nElements)
	{
		for (size_t i = 0; i < nElements; ++i)
		{
			new(&pDest[i]) El(pSrc[i]);
			pSrc[i].~WebGLObjectRefPtr<T>();
		}
	}
};

// this class is a mixin for the named type wrappers, and is used
// by WebGLObjectRefPtr to tell the object who holds references, so that
// we can zero them out appropriately when the object is deleted, because
// it will be unbound in the GL.
class WebGLZeroingObject
{
private:
	WebGLZeroingObject(const WebGLZeroingObject&);
	WebGLZeroingObject& operator=(const WebGLZeroingObject&);
public:
	WebGLZeroingObject()
	{ }
	~WebGLZeroingObject()
	{ }

	void AddRefOwner(WebGLObjectBaseRefPtr *owner)
	{
		mRefOwners.Add(owner);
	}

	void RemoveRefOwner(WebGLObjectBaseRefPtr *owner)
	{
		for (ULONG i = 0; i < mRefOwners.GetCount(); i++)
		{
			if (mRefOwners[i] == owner)
			{
				mRefOwners.RemoveAt(i);
				return;
			}
		}

		assert(!"should not happen");
	}

	void ZeroOwners()
	{
		WebGLObjectBaseRefPtr **owners = mRefOwners.GetData();

		for (ULONG i = 0; i < mRefOwners.GetCount(); i++)
		{
			owners[i]->Zero();
		}

		mRefOwners.RemoveAll();
	}

protected:
	ATL::CAtlArray<WebGLObjectBaseRefPtr *> mRefOwners;
};


class CWebGLRenderingContext;
class JSObjectImpl;

class WebGLObjectBase : public WebGLZeroingObject
{
protected:
	WebGLObjectBase(IUnknown * self);
	virtual ~WebGLObjectBase();

	HRESULT Init(CWebGLRenderingContext* ctx, ATL::CComTypeInfoHolder& tih, IDispatch* external, ULONG name);
	CWebGLRenderingContext* GetContext() { return ctx_; }
	void MarkAsDeleted();

	ATL::CAutoPtr<JSObjectImpl> dispEx_;
public:
	virtual void Delete();
	ULONG GetGLName() { return name_; }
	BOOL IsCompatible(CWebGLRenderingContext* ctx);
	BOOL IsDeleted();

private:
	ATL::CComPtr<CWebGLRenderingContext> ctx_;
	HRESULT InitDispEx(ATL::CComTypeInfoHolder& tih, IDispatch* external);

	IUnknown * self_;
	ULONG name_;
	ULONG ctxGeneration_;
	BOOL deleted_;
};

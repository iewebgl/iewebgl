// WebGLBuffer.cpp : Implementation of CWebGLBuffer

#include "stdafx.h"
#include "WebGLBuffer.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"


CWebGLBuffer::CWebGLBuffer() :
WebGLObjectBase(this),
hasEverBeenBound_(FALSE),
hasData_(FALSE),
maxUByteDataElement_(0),
maxUShortDataElement_(0),
target_(GL_NONE),
usage_(0),
dataSize_(0)
{
}

CWebGLBuffer::~CWebGLBuffer()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteBuffer(this);
	}
}

STDMETHODIMP CWebGLBuffer::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLBuffer]");
	return S_OK;
}

void CWebGLBuffer::Bind( ULONG target )
{
	target_ = target;
	hasEverBeenBound_ = TRUE;
}

template<typename T>
T GetMaxArrayElement(ULONG byteOffset, ULONG count, const BYTE* data)
{
	if(data == 0 || count == 0)
		return 0;

	if(byteOffset % sizeof(T) != 0)
		return 0;

	const T* start = reinterpret_cast<T*>(reinterpret_cast<size_t>(data) + byteOffset);
	const T* stop = start + count;
	T result = 0;

	for(const T* ptr = start; ptr != stop; ++ptr)
		if(*ptr > result)
			result = *ptr;

	return result;
}

void CWebGLBuffer::BufferData( ULONG target, ULONG usage, ULONG size, const BYTE* data )
{
	hasData_ = TRUE;
	maxUByteDataElement_ = (ULONG)GetMaxArrayElement<BYTE>(0, size, data);
	maxUShortDataElement_ = (ULONG)GetMaxArrayElement<USHORT>(0, size >> 1, data);
	usage_ = usage;
	dataSize_ = size;

	glBufferData(target, size, data, usage);
}

void CWebGLBuffer::BufferSubData( ULONG target, ULONG offset, ULONG size, const BYTE* data )
{
	maxUByteDataElement_ = Max(maxUByteDataElement_, (ULONG)GetMaxArrayElement<BYTE>(0, size, data));
	maxUShortDataElement_ = Max(maxUShortDataElement_, (ULONG)GetMaxArrayElement<USHORT>(0, size >> 1, data));

	glBufferSubData(target, offset, size, data);
}

ULONG CWebGLBuffer::GetMaxDataElement( ULONG type ) const
{
	switch (type)
	{
	case GL_UNSIGNED_BYTE: return maxUByteDataElement_;
	case GL_UNSIGNED_SHORT: return maxUShortDataElement_;
	}
	return 0;
}

ULONG CWebGLBuffer::GetParameter( ULONG pname ) const
{
	switch(pname)
	{
	case GL_BUFFER_SIZE: return dataSize_;
	case GL_BUFFER_USAGE: return usage_;
	}
	return 0;
}

//////////////////////////////////////////////////////////////////////////

HRESULT CreateWebGLBuffer( CWebGLRenderingContext* ctx, ULONG name, WebGLBufferPtr& retVal )
{
	WebGLBufferType* impl = nullptr;
	V_RET(WebGLBufferType::CreateInstance(&impl));
	WebGLBufferPtr holder(impl);

	V_RET(impl->Init(ctx, impl->_tih, impl, name));

	retVal = holder;
	return S_OK;
}

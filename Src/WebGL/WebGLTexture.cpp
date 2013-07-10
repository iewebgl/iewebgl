// WebGLTexture.cpp : Implementation of CWebGLTexture

#include "stdafx.h"
#include "WebGLTexture.h"
#include "WebGLRenderingContext.h"
#include "WebGLUtils.h"


bool CWebGLTexture::MipLevelDesc::operator == ( const CWebGLTexture::MipLevelDesc& other ) const
{
	return
		width == other.width &&
		height == other.height &&
		internalFormat == other.internalFormat &&
		type == other.type;
}

bool CWebGLTexture::MipLevelDesc::operator != ( const CWebGLTexture::MipLevelDesc& other ) const
{
	return !(*this == other);
}

CWebGLTexture::CWebGLTexture() :
WebGLObjectBase(this),
hasEverBeenBound_(FALSE),
mipMapGenerated_(FALSE),
isComplete_(FALSE),
target_(0),
facesCount_(0),
mipLevelCount_(0)
{
}

CWebGLTexture::~CWebGLTexture()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteTexture(this);
	}
}

STDMETHODIMP CWebGLTexture::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLTexture]");
	return S_OK;
}

void CWebGLTexture::ResizeMipLevelDescs( ULONG mipLevelCount )
{
	ULONG size = mipLevelCount * facesCount_;
	if(size > mipLevelDescs_.GetCount())
		mipLevelDescs_.InsertAt(mipLevelDescs_.GetCount(), MipLevelDesc(), size - mipLevelDescs_.GetCount());
}

void CWebGLTexture::SetMipLevelDesc( ULONG level, ULONG face, const MipLevelDesc& desc )
{
	/// need to store descs as: l0f0 l0f1 l0fN l1f0 l1f1 l1fN (l-level, f-face)
	mipLevelDescs_.SetAt(level * facesCount_ + face, desc);
}

inline LONG GetTexParameter( ULONG target, ULONG pname )
{
	GLint param = 0;
	glGetTexParameteriv(target, pname, &param);
	return param;
}

void CWebGLTexture::Bind( ULONG target )
{
	target_ = target;
	if(!hasEverBeenBound_)
	{
		facesCount_ = (target_ == GL_TEXTURE_2D) ? 1 : GL_CUBEMAP_FACE_COUNT;

		parameters_[GL_TEXTURE_MIN_FILTER] = GetTexParameter(target, GL_TEXTURE_MIN_FILTER);
		parameters_[GL_TEXTURE_MAG_FILTER] = GetTexParameter(target, GL_TEXTURE_MAG_FILTER);
		parameters_[GL_TEXTURE_WRAP_S] = GetTexParameter(target, GL_TEXTURE_WRAP_S);
		parameters_[GL_TEXTURE_WRAP_T] = GetTexParameter(target, GL_TEXTURE_WRAP_T);
	}

	hasEverBeenBound_ = TRUE;
}

void CWebGLTexture::Image( ULONG target, LONG level, ULONG internalFormat, ULONG type, ULONG width, ULONG height )
{
	if (target == 0 || ((target == GL_TEXTURE_2D) != (target_ == GL_TEXTURE_2D)))
		return;

	ResizeMipLevelDescs(level + 1);

	MipLevelDesc desc;
	desc.isDefined = TRUE;
	desc.width = width;
	desc.height = height;
	desc.internalFormat = internalFormat;
	desc.type = type;

	SetMipLevelDesc(level, GetCubeMapFace(target), desc);

	isComplete_ = CheckComplete();
}

const CWebGLTexture::MipLevelDesc& CWebGLTexture::GetMipLevelDesc( ULONG level, ULONG face ) const
{
	/// need to store descs as: l0f0 l0f1 l0fN l1f0 l1f1 l1fN
	return mipLevelDescs_.GetAt(level * facesCount_ + face);
}

BOOL CWebGLTexture::GenerateMipMaps()
{
	if(mipLevelDescs_.IsEmpty())
		return FALSE;

	MipLevelDesc desc = mipLevelDescs_.GetAt(0);
	if (!desc.isDefined || !IsPowerOfTwo(desc.width, desc.height))
	{
		GetContext()->GenerateError(GL_INVALID_OPERATION, L"generateMipmap: the width or height is not a power of two");
		return FALSE;
	}

	ULONG maxLevel = 0;
	for (ULONG i = Max<ULONG>(desc.width, desc.height); i > 1; i >>= 1)
		++maxLevel;

	ResizeMipLevelDescs(maxLevel + 1);

	for (ULONG level = 1; level <= maxLevel; ++level)
	{
		desc.width >>= 1;
		desc.height >>= 1;

		for (ULONG face = 0; face < facesCount_; ++face)
			SetMipLevelDesc(level, face, desc);
	}

	mipMapGenerated_ = TRUE;
	isComplete_ = CheckComplete();
	return TRUE;
}

BOOL CWebGLTexture::CheckComplete() const
{
	if(mipLevelDescs_.IsEmpty())
		return FALSE;

	if(!IsCubeFacesCompatible())
		return FALSE;

	ULONG minFilter = GetParameter(GL_TEXTURE_MIN_FILTER);
	if(minFilter != GL_NEAREST && minFilter != GL_LINEAR)
		return TRUE;

	for(ULONG face = 0; face < facesCount_; ++face)
	{
		MipLevelDesc desc = GetMipLevelDesc(0, face);
		for(ULONG level = 0; level < mipLevelCount_; ++level)
		{
			const MipLevelDesc& curDesc = GetMipLevelDesc(level, face);
			if(!curDesc.isDefined || curDesc != desc)
				return FALSE;

			desc.width = Max<ULONG>(1, desc.width >> 1);
			desc.height = Max<ULONG>(1, desc.height >> 1);

			if (curDesc.width == 1 && curDesc.height == 1)
				break;
		}
	}

	return TRUE;
}

BOOL CWebGLTexture::IsCubeFacesCompatible() const
{
	if(mipLevelDescs_.IsEmpty())
		return FALSE;

	const MipLevelDesc& refDesc = mipLevelDescs_.GetAt(0);
	for(ULONG face = 0; face < facesCount_; ++face)
	{
		const MipLevelDesc& desc = GetMipLevelDesc(0, face);

		if(desc.width <= 0 || desc.height <= 0)
			return FALSE;

		if(facesCount_ > 1 && desc.width != desc.height)
			return FALSE;

		if(desc != refDesc)
			return FALSE;
	}

	return TRUE;
}

ULONG CWebGLTexture::GetParameter( ULONG pname ) const
{
	return parameters_.Lookup(pname)->m_value;
}

void CWebGLTexture::SetParameter( ULONG pname, ULONG value )
{
	parameters_.SetAt(pname, value);
	isComplete_ = CheckComplete();
}

void CWebGLTexture::UploadData( const TexImageContext& ctx, const BYTE* data, ULONG dataSize )
{
	WebGLTexturePtr boundTexture = GetContext()->GetBoundTexture(ctx.target);
	GetContext()->bindTexture(ctx.target, this); // also makes context current

	GLint boundPackAlignment = 0;
	glGetIntegerv(GL_PACK_ALIGNMENT, &boundPackAlignment);
	glPixelStorei(GL_PACK_ALIGNMENT, 1);
	if (ctx.isSubImage)
	{
		GetContext()->texSubImage2DImpl(ctx.target, ctx.level, ctx.xoffset, ctx.yoffset, ctx.width, ctx.height, ctx.format, ctx.type, data, dataSize);
	}
	else
	{
		GetContext()->texImage2DImpl(ctx.target, ctx.level, ctx.internalFormat, ctx.width, ctx.height, ctx.border, ctx.format, ctx.type, data, dataSize);

		if (mipMapGenerated_)
		{
			glGenerateMipmap(ctx.target);
			mipMapGenerated_ = FALSE;
		}
	}
	glPixelStorei(GL_PACK_ALIGNMENT, boundPackAlignment);

	GetContext()->bindTexture(ctx.target, boundTexture);
}

//////////////////////////////////////////////////////////////////////////

HRESULT CreateWebGLTexture( CWebGLRenderingContext* ctx, ULONG name, WebGLTexturePtr& retVal )
{
	WebGLTextureType* impl = nullptr;
	V_RET(WebGLTextureType::CreateInstance(&impl));
	WebGLTexturePtr holder(impl);

	V_RET(impl->Init(ctx, impl->_tih, impl, name));

	retVal = holder;
	return S_OK;
}

// WebGLShader.cpp : Implementation of CWebGLShader

#include "stdafx.h"
#include "WebGLShader.h"
#include "WebGLRenderingContext.h"

#include <cassert>
// CWebGLShader

CWebGLShader::CWebGLShader() :
WebGLObjectBase(this),
needsTranslation_(FALSE),
translationSuccessful_(TRUE),
type_(0),
attachCount_(0)
{

}

CWebGLShader::~CWebGLShader()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteShader(this);
	}
}

STDMETHODIMP CWebGLShader::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLShader]");
	return S_OK;
}

void CWebGLShader::SetSource( const char * src )
{
	shaderSource_ = src;
	SetNeedsTranslation(TRUE);
	SetTranslationSuccess(FALSE);
	SetShaderInfoLog(nullptr);
}

const char * CWebGLShader::GetSource()
{
	return shaderSource_;
}

void CWebGLShader::SetShaderInfoLog(const char * log)
{
	shaderInfoLog_ = log;
}

const char * CWebGLShader::GetShaderInfoLog()
{
	return shaderInfoLog_;
}

void CWebGLShader::SetNeedsTranslation( BOOL needsTranslation )
{
	needsTranslation_ = needsTranslation;
}

BOOL CWebGLShader::GetNeedsTranslation()
{
	return needsTranslation_;
}

void CWebGLShader::SetTranslationSuccess( BOOL isSuccessful )
{
	translationSuccessful_ = isSuccessful;
}

BOOL CWebGLShader::GetTranslationSuccess()
{
	return translationSuccessful_;
}

HRESULT CWebGLShader::Init( CWebGLRenderingContext* ctx, ULONG type, ULONG name )
{
	if (!ctx)
		return E_INVALIDARG;

	Init(ctx, _tih, this, name);

	type_ = type;
	shaderSource_ = _bstr_t();
	shaderInfoLog_ = _bstr_t();
	needsTranslation_ = TRUE;
	translationSuccessful_ = FALSE;

	return S_OK;
}

void CWebGLShader::IncrementAttachCount()
{
	++attachCount_;
}

void CWebGLShader::DecrementAttachCount()
{
	--attachCount_;
	if ( attachCount_ == 0 && WebGLObjectBase::IsDeleted())
	{
		WebGLObjectBase::Delete();
	}
}

void CWebGLShader::Delete()
{
	if ( attachCount_ == 0)
	{
		WebGLObjectBase::Delete();
	}
	else
	{
		MarkAsDeleted();
	}
}

bool CWebGLShader::IsDeleted()
{
	return WebGLObjectBase::IsDeleted() && !attachCount_;
}

void CWebGLShader::ResetInfo()
{
	activeUniforms_.RemoveAll();
}

void CWebGLShader::AddActiveUniform(const char * name, int size, int type)
{
	ActiveUniformInfo info;
	info.name = name;
	info.size = size;
	info.type = type;
	activeUniforms_.Add(info);
}

bool CWebGLShader::IsArrayName(const char * name)
{
	assert(name);
	size_t nameLen = strlen(name);
	const char ArraySpec[] = "[0]";
	for (size_t i = 0; i < activeUniforms_.GetCount(); ++i)
	{
		if ( activeUniforms_[i].name.Find(name) == 0 && activeUniforms_[i].name.Find(ArraySpec) == nameLen)
			return true;
	}
	return false;
}

HRESULT CreateWebGLShader( CWebGLRenderingContext * ctx, ULONG type, ULONG name, WebGLShaderPtr& retVal )
{
	WebGLShaderType * impl = nullptr;
	V_RET(WebGLShaderType::CreateInstance(&impl));
	WebGLShaderPtr shader(impl);

	V_RET(shader->Init(ctx, type, name));

	retVal = shader;
	return S_OK;
}


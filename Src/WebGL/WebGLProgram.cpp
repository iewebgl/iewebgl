// WebGLProgram.cpp : Implementation of CWebGLProgram

#include "stdafx.h"
#include "WebGLProgram.h"
#include "WebGLRenderingContext.h"
#include <atlstr.h>

// CWebGLProgram

CWebGLProgram::CWebGLProgram() :
WebGLObjectBase(this),
progGeneration_(0)
{

}

CWebGLProgram::~CWebGLProgram()
{
	if (!IsDeleted() && GetContext())
	{
		GetContext()->deleteProgram(this);
	}
}

STDMETHODIMP CWebGLProgram::toString( BSTR* retVal )
{
	if (!retVal) return E_INVALIDARG;
	*retVal = SysAllocString(L"[object WebGLProgram]");
	return S_OK;
}


bool CWebGLProgram::ContainsShader(WebGLShaderPtr shader)
{
	if (!shader)
		return false;

	for (size_t i = 0; i < MaxShaderCount; ++i)
	{
		if (attachedShaders_[i] && (shader == attachedShaders_[i] || shader->ShaderType() == attachedShaders_[i]->ShaderType()) )
			return true;
	}
	return false;
}

void CWebGLProgram::SetDeletePending()
{
	deletePending_ = true;
}

bool CWebGLProgram::AttachShader( WebGLShaderPtr shader )
{
	if (!ContainsShader(shader))
	{
		size_t at = (size_t)-1;
		if ( shader->ShaderType() == GL_VERTEX_SHADER ) at = VShader;
		else if (shader->ShaderType() == GL_FRAGMENT_SHADER ) at = FShader;
		else { assert(!"unknown shader type"); return false; }

		attachedShaders_[at] = shader;
		shader->IncrementAttachCount();
		return true;
	}
	return false;
}

bool CWebGLProgram::DetachShader( WebGLShaderPtr shader )
{
	if (!shader)
		return false;

	if (ContainsShader(shader))
	{
		for (size_t i = 0; i < MaxShaderCount; ++i)
		{
			if (shader == attachedShaders_[i])
			{
				attachedShaders_[i]->DecrementAttachCount();
				attachedShaders_[i] = nullptr;
				return true;
			}
		}
	}
	return false;
}

const WebGLShaderPtr* CWebGLProgram::AttachedShaders()
{
	return attachedShaders_;
}

void CWebGLProgram::DetachShaders()
{
	for (size_t i = 0; i < MaxShaderCount; ++i)
	{
		if (attachedShaders_[i])
			attachedShaders_[i]->DecrementAttachCount();

		attachedShaders_[i] = nullptr;
	}
}

bool CWebGLProgram::LinkStatus()
{
	return linkStatus_;
}

bool CWebGLProgram::HasDeletePending()
{
	return deletePending_;
}

void CWebGLProgram::ClearDeletePending()
{
	deletePending_ = false;
}

bool CWebGLProgram::HasBothShaderTypesAttached()
{
	return HasAttachedShaderOfType(GL_VERTEX_SHADER) && HasAttachedShaderOfType(GL_FRAGMENT_SHADER);
}

void CWebGLProgram::SetLinkStatus( bool status )
{
	linkStatus_= status;
}

void CWebGLProgram::UpdateInfo()
{
	glGetProgramiv(GetGLName(), GL_ACTIVE_ATTRIBUTE_MAX_LENGTH, (GLint*)&attribMaxNameLength_);
	glGetProgramiv(GetGLName(), GL_ACTIVE_UNIFORM_MAX_LENGTH, (GLint*)&uniformMaxNameLength_);
	glGetProgramiv(GetGLName(), GL_ACTIVE_UNIFORMS, (GLint*)&uniformCount_);
	glGetProgramiv(GetGLName(), GL_ACTIVE_ATTRIBUTES, (GLint*)&attribCount_);

	GLint numVertexAttribs;
	glGetIntegerv(GL_MAX_VERTEX_ATTRIBS, &numVertexAttribs);
	attribsInUse_.RemoveAll();
	attribsInUse_.SetCount(numVertexAttribs);

	CAtlStringA nameBuf;
	nameBuf.Preallocate(attribMaxNameLength_);

	for (int i = 0; i < attribCount_; ++i)
	{
		GLint attrnamelen;
		GLint attrsize;
		GLenum attrtype;
		glGetActiveAttrib(GetGLName(), i, attribMaxNameLength_, &attrnamelen, &attrsize, &attrtype, nameBuf.GetBuffer());
		if (attrnamelen > 0)
		{
			GLint loc = glGetAttribLocation(GetGLName(), nameBuf.GetBuffer());
			attribsInUse_[loc] = true;
		}
	}

	nameBuf.Preallocate(uniformMaxNameLength_);
	for (int i = 0; i < uniformCount_; ++i)
	{
		GLsizei length = 0;
		GLint size = 0;
		GLenum type = 0;
		glGetActiveUniform(GetGLName(), i, uniformMaxNameLength_, &length, &size, &type, nameBuf.GetBuffer());
		if (IsArrayName(nameBuf.GetString()))
		{
			for (GLint j = 0; j < size; ++j)
			{
				CAtlStringA elName(nameBuf.GetString());
				if (elName[elName.GetLength()-1] == ']')
					elName.Delete(elName.GetLength()-3, 3);
				elName.Format("%s[%u]", elName.GetString(), j);
				
				int loc = glGetUniformLocation(GetGLName(), elName.GetString());
				if (loc != -1)
				{
					uniformInfos_.SetAt(loc, UniformLocationInfo(true, j, size) );
				}
			}
		}
		else
		{
			int loc = glGetUniformLocation(GetGLName(), nameBuf.GetString());
			if (loc != -1)
			{
				uniformInfos_.SetAt(loc, UniformLocationInfo(false, -1, 1) );
			}
		}
	}
}

BOOL CWebGLProgram::IsArrayName(const char * name)
{
	bool result = false;
	for (ULONG i = 0; i < MaxShaderCount && !result; ++i)
	{
		if ( attachedShaders_[i] )
		{
			result |= attachedShaders_[i]->IsArrayName(name);
		}
	}
	return result;
}

void CWebGLProgram::GetUniformInfo(LONG location, bool& isArray, int& arrayIndex, int& arraySize)
{
	isArray = false;
	arrayIndex = -1;
	arraySize = 0;

	UniformLocationInfo info;
	if ( uniformInfos_.Lookup(location, info) )
	{
		isArray = info.isArray;
		arrayIndex = info.arrayIndex;
		arraySize = info.arraySize;
	}
}

BOOL CWebGLProgram::NextGeneration()
{
	if ( ++progGeneration_ == 0)
		return false;

	mapUniformLocations_.RemoveAll();
	return true; 
}

bool CWebGLProgram::HasAttachedShaderOfType( ULONG shaderType )
{
	for (ULONG i = 0; i < MaxShaderCount; ++i)
	{
		if (attachedShaders_[i] && attachedShaders_[i]->ShaderType() == shaderType)
		{
			return true;
		}
	}
	return false;
}

HRESULT CreateWebGLProgram( CWebGLRenderingContext* ctx, ULONG name, WebGLProgramPtr& retVal )
{
	WebGLProgramType * impl = nullptr;
	V_RET(WebGLProgramType::CreateInstance(&impl));
	WebGLProgramPtr program(impl);

	V_RET(program->Init(ctx, impl->_tih, impl, name));

	retVal = program;
	return S_OK;
}


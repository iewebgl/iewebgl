#include "stdafx.h"
#include "TypedArrayMaker.h"


HRESULT NoTypeProperties( CAtlArray<std::pair<const CComBSTR, const CComVariant> >& props )
{
	props.RemoveAll();
	return S_OK;
}
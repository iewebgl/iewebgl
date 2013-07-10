//
// Copyright (c) 2002-2012 The ANGLE Project Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//

// main.cpp: DLL entry point and management of thread-local data.

#include "libEGL/main.h"

#include "common/debug.h"

static DWORD currentTLS = TLS_OUT_OF_INDEXES;

void SetupEGL_TLS()
{
	void *current = TlsGetValue(currentTLS);
	if (!current)
	{
		egl::Current *current = (egl::Current*)LocalAlloc(LPTR, sizeof(egl::Current));

		if (current)
		{
			TlsSetValue(currentTLS, current);

			current->error = EGL_SUCCESS;
			current->API = EGL_OPENGL_ES_API;
			current->display = EGL_NO_DISPLAY;
			current->drawSurface = EGL_NO_SURFACE;
			current->readSurface = EGL_NO_SURFACE;
		}
	}
}

BOOL WINAPI DllMainEGL(HINSTANCE instance, DWORD reason, LPVOID reserved)
{
    switch (reason)
    {
      case DLL_PROCESS_ATTACH:
        {
#if !defined(ANGLE_DISABLE_TRACE)
            FILE *debug = fopen(TRACE_OUTPUT_FILE, "rt");

            if (debug)
            {
                fclose(debug);
                debug = fopen(TRACE_OUTPUT_FILE, "wt");   // Erase
                
                if (debug)
                {
                    fclose(debug);
                }
            }
#endif

            currentTLS = TlsAlloc();

            if (currentTLS == TLS_OUT_OF_INDEXES)
            {
                return FALSE;
            }
        }
        // Fall throught to initialize index
      case DLL_THREAD_ATTACH:
        {
            /*egl::Current *current = (egl::Current*)LocalAlloc(LPTR, sizeof(egl::Current));

            if (current)
            {
                TlsSetValue(currentTLS, current);

                current->error = EGL_SUCCESS;
                current->API = EGL_OPENGL_ES_API;
                current->display = EGL_NO_DISPLAY;
                current->drawSurface = EGL_NO_SURFACE;
                current->readSurface = EGL_NO_SURFACE;
            }*/
			SetupEGL_TLS();
        }
        break;
      case DLL_THREAD_DETACH:
        {
            void *current = TlsGetValue(currentTLS);

            if (current)
            {
                LocalFree((HLOCAL)current);
            }
        }
        break;
      case DLL_PROCESS_DETACH:
        {
            void *current = TlsGetValue(currentTLS);

            if (current)
            {
                LocalFree((HLOCAL)current);
            }

            TlsFree(currentTLS);
        }
        break;
      default:
        break;
    }

    return TRUE;
}

namespace egl
{
void setCurrentError(EGLint error)
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    current->error = error;
}

EGLint getCurrentError()
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    return current->error;
}

void setCurrentAPI(EGLenum API)
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    current->API = API;
}

EGLenum getCurrentAPI()
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    return current->API;
}

void setCurrentDisplay(EGLDisplay dpy)
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    current->display = dpy;
}

EGLDisplay getCurrentDisplay()
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    return current->display;
}

void setCurrentDrawSurface(EGLSurface surface)
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    current->drawSurface = surface;
}

EGLSurface getCurrentDrawSurface()
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    return current->drawSurface;
}

void setCurrentReadSurface(EGLSurface surface)
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    current->readSurface = surface;
}

EGLSurface getCurrentReadSurface()
{
	SetupEGL_TLS();
    Current *current = (Current*)TlsGetValue(currentTLS);

    return current->readSurface;
}
}

void error(EGLint errorCode)
{
    egl::setCurrentError(errorCode);
}

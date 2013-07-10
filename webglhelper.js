/**********************************************************
IEWebGL support routines
You can copy, use, modify, distribute this file.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS

"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
**********************************************************/

var WebGLHelper = {

    'pluginInstallerURL': 'http://localhost/iewebgl.cab',
    'currentVersion': "#Version=1,0,1,0",
    
    'manualLoadScreen': {
        'innerHTML':
            '<div style="width:100%;height:100%;border-width:1px;border-style:solid">' +
                '<div style="height:50%"></div>' +
                '<p style="text-align:center">' +
                    'Please get IEWebGL plugin <a href="http://iewebgl.com/">here</a> to see 3D.' +
                '</p>' +
            '</div>'
    },

    'autoLoadScreen': {
        'innerHTML':
            '<div style="height:50%; text-align:center"></div>' +
            '<div style="text-align:center">' +
                'Please wait, while IEWebGL is loading for the first time.<br/>' +
                '<img src="http://iewebgl.com/progress.gif">' +
            '</div>',
          
        'cssText': 'position:absolute;top:0;left:0;width:100%;height:100%;border-style:solid;border-width:1px;background-color:#FFFFFF;',
        'className': undefined
    },

    'IsIE': function () {
        return navigator.userAgent.indexOf("MSIE") >= 0;
    },

    'GetGLContext': function (cnv, attributes) {
        var ctxNames = ["webgl", "experimental-webgl"];
        var glCtx = null;
        for (var i = 0; i < ctxNames.length && glCtx == null; ++i) {
            try {
                glCtx = cnv.getContext(ctxNames[i], attributes);
            }
            catch (e) { }
        }

        return glCtx;
    },

    'CreateNativeCanvas': function (element, id, replace, okHandler, failHandler) {
        try {
            var cnv = document.createElement("canvas");
            if (replace) {
                if (element.attributes.width) cnv.width = element.attributes.width.value;
                if (element.attributes.height) cnv.height = element.attributes.height.value;
                if (element.style.cssText) cnv.style.cssText = element.style.cssText;
                element.parentNode.replaceChild(cnv, element);
            }
            else {
                element.appendChild(cnv);
            }

            cnv.innerHTML = "Your browser does not support &lt;canvas&gt; tag.";
            cnv.id = id;
            if (okHandler) {
                okHandler(cnv, id);
            }
            return cnv;
        }
        catch(e) {
            if (failHandler) {
                failHandler(null, id);
            }
            return null;
        }
    },

    'CreatePluginCanvas': function (element, id, replace, okHandler, failHandler) {
        var container = document.createElement("div");
        container.style.cssText = "position:relative;width:100%;height:100%";



        var obj = document.createElement("object");
        if (replace) {
            if (element.attributes.width) obj.width = element.attributes.width.value;
            if (element.attributes.height) obj.height = element.attributes.height.value;
            if (element.style.cssText) obj.style.cssText = element.style.cssText;
            element.parentNode.replaceChild(container, element);
        }
        else {
            element.appendChild(container);
        }
        container.appendChild(obj);

        try {
            obj.innerHTML = WebGLHelper.manualLoadScreen.innerHTML;
        }
        catch (e) { /* IE8 workaround */
            obj.altHtml = WebGLHelper.manualLoadScreen.innerHTML;
        }

        var loadTimeOverlay = document.createElement("div");
        loadTimeOverlay.innerHTML = WebGLHelper.autoLoadScreen.innerHTML;
        if (WebGLHelper.autoLoadScreen.className == undefined) {
            loadTimeOverlay.style.cssText = WebGLHelper.autoLoadScreen.cssText;
        }
        else {
            loadTimeOverlay["class"] = WebGLHelper.autoLoadScreen.className;
        }
        container.appendChild(loadTimeOverlay);
        
        var showPlugin = function () {
            if (loadTimeOverlay.parentNode) {
                loadTimeOverlay.parentNode.removeChild(loadTimeOverlay);
            }
            obj.style.visibility = "visible";
        };

        var errorHandler = function() {
            showPlugin();
            obj.onreadystatechange = null;
            if (failHandler)
                failHandler(null, id);
        }

        var successHandler = function() {
            showPlugin();
            if (okHandler)
                okHandler(obj, id);
        }

        obj.style.visibility = "hidden";
        obj.onreadystatechange = successHandler;
        obj.onerror = errorHandler;
        obj.id = id;
        obj.codeBase = WebGLHelper.pluginInstallerURL + WebGLHelper.currentVersion;
        obj.type = "application/x-webgl";
        return obj;
    },

    'CreateGLCanvas': function (el, id, replace, okHandler, failHandler) {
        if (WebGLHelper.IsIE()) {
            var usePlugin;
            try {
                usePlugin = WebGLRenderingContext.hasOwnProperty('iewebgl');
            } catch (e) {
                usePlugin = true;
            }

            if (usePlugin) {
                return WebGLHelper.CreatePluginCanvas(el, id, replace, okHandler, failHandler);
            }
            else {
                return WebGLHelper.CreateNativeCanvas(el, id, replace, okHandler, failHandler);
            }
        }
        else {
            return WebGLHelper.CreateNativeCanvas(el, id, replace, okHandler, failHandler);
        }
    },

    'CreateGLCanvasInline': function (id, okHandler, failHandler) {
        var placeHolder = document.getElementById("WebGLCanvasCreationScript");
        WebGLHelper.CreateGLCanvas(placeHolder, id, true, okHandler, failHandler);
    }
}

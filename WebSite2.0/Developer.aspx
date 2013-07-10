<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Developer" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Developer.aspx.cs" Inherits="Developer" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <script type="text/javascript" src="scripts/shCore.js"></script>
	<script type="text/javascript" src="scripts/shBrushJScript.js"></script>
    <script type="text/javascript" src="scripts/shBrushXml.js"></script>
	<link type="text/css" rel="stylesheet" href="styles/shCoreDefault.css"/>
	<script type="text/javascript">SyntaxHighlighter.all();</script>
    <style type="text/css">#developer { color:#FFFFFF; }</style>
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>Developer</h1>
        <p>
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server">Samples</asp:Hyperlink><br />
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#CreatingTutorial" runat="Server">Creating WebGL context with IEWebGL plugin tutorial</asp:Hyperlink><br />
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#StandardCompatibility" runat="Server">Standard compatibility</asp:Hyperlink><br />
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#UnitTests" runat="Server">Unit tests</asp:Hyperlink><br />
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#NonStandardBehaviour" runat="Server">Non-standard behaviour</asp:Hyperlink><br />
            - <asp:Hyperlink NavigateUrl="~/Developer.aspx#SpecialSettings" runat="Server">Special settings</asp:Hyperlink>
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="Samples">Samples</h1>
        <p>
            Click to the picture to see the sample and the code listing for it.
        </p>
        <table border="0" cellspacing="0" cellpadding="0" width="577" style="margin-top:10px">
            <tr valign="middle">
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/VertexColor.aspx#header" runat="Server"><img class="img-preview" src="Samples/VertexColor.png"/></asp:Hyperlink><p class="img-desc-text">vertex color</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/Lighting.aspx#header" runat="Server"><img class="img-preview" src="Samples/Lighting.png"/></asp:Hyperlink><p class="img-desc-text">lighting</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/Texturing.aspx#header" runat="Server"><img class="img-preview" src="Samples/Texturing.png"/></asp:Hyperlink><p class="img-desc-text">texturing</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/VideoTexturing.aspx#header" runat="Server"><img class="img-preview" src="Samples/VideoTexturing.png"/></asp:Hyperlink><p class="img-desc-text">video texturing</p></td>
            </tr>
            <tr valign="middle">
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/CanvasTexturing.aspx#header" runat="Server"><img class="img-preview" src="Samples/CanvasTexturing.png"/></asp:Hyperlink><p class="img-desc-text">canvas texturing</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/RenderToTexture.aspx#header" runat="Server"><img class="img-preview" src="Samples/RenderToTexture.png"/></asp:Hyperlink><p class="img-desc-text">render to texture</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/CubemapReflection.aspx#header" runat="Server"><img class="img-preview" src="Samples/CubemapReflection.png"/></asp:Hyperlink><p class="img-desc-text">cubemap reflection</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/MultiCanvasBlending.aspx#header" runat="Server"><img class="img-preview" src="Samples/MultiCanvasBlending.png"/></asp:Hyperlink><p class="img-desc-text">multicanvas blending</p></td>
            </tr>
            <tr valign="middle">
                <td width="130" align="center"></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/VertexTextureFetch.aspx#header" runat="Server"><img class="img-preview" src="Samples/VertexTextureFetch.png"/></asp:Hyperlink><p class="img-desc-text">vertex texture fetch</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Samples/A32FShadowMapping.aspx#header" runat="Server"><img class="img-preview" src="Samples/A32FShadowMapping.png"/></asp:Hyperlink><p class="img-desc-text">A32F shadow mapping</p></td>
                <td width="19"></td>
                <td width="130" align="center"></td>
            </tr>
        </table>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="CreatingTutorial">Creating WebGL context with IEWebGL plugin tutorial</h1>
        <p>
            We provide simple and very small WebGLHelper.js library to hide little difference between native WebGL and IEWebGL plugin.
            WebGLHelper.js is very convenient - you should not think about stuff like feature detection,
            plugin downloading and installation, browser support, plugin updates and error handling.
            <br />
            Let's learn how to use it.
        </p>
        <h2><br />Example 0. How it works</h2>
<p>In IE with IEWebGL installed, you create an object element, instead of canvas element as shown below. Then you can get webgl context from that element as usually:</p>
<pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;script type="text/javascript"&gt;
	function InitWebGLContext() {
		var glCanvas = document.getElementById("glCanvas");
		// first, try standard WebGL context
		var gl = glCanvas.getContext("webgl");
		if (!gl) {
			// if failed, try experimental one
			gl = glCanvas.getContext("experimental-webgl");
        }

		if (!gl) {
			alert("Your browser does not support WebGL");
			return;
		}

		// here we get WebGL context - 
		// for demonstation let's show some info
		alert(
			"WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
			"WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
			"WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
		);
	}
&lt;/script&gt; 
&lt;/head&gt;

&lt;body onload="InitWebGLContext()"&gt;
&lt;object style="width:100%;height:100%" id="glCanvas"
type="application/x-webgl"&gt;&lt;/object&gt;
&lt;/body&gt;

&lt;/html&gt;
</pre>



        <h2><br />Example 1. Inlining into markup</h2>
        <p>
            Consider the very simple page with canvas and WebGL context:
        </p>
        <pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;script type="text/javascript"&gt;
	function InitWebGLContext() {
		var glCanvas = document.getElementById("glCanvas");
		// first, try standard WebGL context
		var gl = glCanvas.getContext("webgl");
		if (!gl) {
			// if failed, try experimental one
			gl = glCanvas.getContext("experimental-webgl");
        }

		if (!gl) {
			alert("Your browser does not support WebGL");
			return;
		}

		// here we get WebGL context - 
		// for demonstation let's show some info
		alert(
			"WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
			"WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
			"WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
		);
	}
&lt;/script&gt; 
&lt;/head&gt;

&lt;body onload="InitWebGLContext()"&gt;
&lt;canvas style="width:100%;height:100%" id="glCanvas"&gt;&lt;/canvas&gt;
&lt;/body&gt;

&lt;/html&gt;
        </pre>
        <p>
            Now lets turn it to use IEWebGL or native WebGL, depending on whether it is supported.
            (Note: webglhelper.js is designed so, that if in the future Internet Explorer will support WebGL
            natively - the library will choose native WebGL instead of IEWebGL plugin,
            so you will not have to change your code to support new browser):
        </p>
        <pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;!-- required to use WebGLHelper object --&gt;
&lt;script src="http://iewebgl.com/scripts/webglhelper.js"
    type="text/javascript"&gt;
&lt;/script&gt;

&lt;script type="text/javascript"&gt;
	function InitWebGLContext() {
		var glCanvas = document.getElementById("glCanvas");
		// first, try standard WebGL context
		var gl = glCanvas.getContext("webgl");
		if (!gl) {
			// if failed, try experimental one
			gl = glCanvas.getContext("experimental-webgl");
		}

		if (!gl) {
			alert("Your browser does not support WebGL");
			return;
		}

		// here we get WebGL context, let's show some info
		alert(
			"WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
			"WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
			"WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
		);
	}

	function OnGLCanvasCreated(canvasElement, elementId) {
		InitWebGLContext();
	}

	function OnGLCanvasFailed(canvasElement, elementId) {
		alert("Your browser does not support WebGL");
	}
&lt;/script&gt; 
&lt;/head&gt;

&lt;body&gt;
&lt;script id="WebGLCanvasCreationScript" type="text/javascript"
	style="width:100%;height:100%"&gt;WebGLHelper.CreateGLCanvasInline(
		'glCanvas', OnGLCanvasCreated, OnGLCanvasFailed)
&lt;/script&gt;
&lt;/body&gt;

&lt;/html&gt;
        </pre>
        <p>
            Here we replaced the original &lt;canvas&gt; element with special &lt;script&gt; element. This script creates &lt;canvas&gt; or
            &lt;object&gt; in place of itself. It detects if the browser supports WebGL, and if it isn't and browser is IE, it creates &lt;object&gt;
            element, that loads IEWebGL plugin.
            <br /><br />
            You see two new functions OnGLCanvasCreated and OnGLCanvasFailed. They are handlers for successful and unsuccessful canvas/object
            creation result. The reason for fail can be user's cancellation of the plugin installation in IE.
            The handlers are very convenient. All handling of plugin installation, updates and initialization is hidden inside WebGLHelper.js
            library, you don't have to worry about all that stuff.
            <br /><br />
            Also, as you see, you can still use style attribute on &lt;script&gt; element, although it can't be applied to &lt;script&gt;
            element directly, it is applied (copied) to &lt;canvas&gt; or &lt;object&gt; element by the script.
            Separate CSS definitions can also be applied to &lt;canvas&gt; or &lt;object&gt; element, using id ("glCanvas" in this example),
            you pass to WebGLHelper.CreateGLCanvasInline().
            <br /><br />
            Using WebGLHelper.js is very easy. If you already have existing WebGL pages and want your site to
            work in Internet Explorer and with IEWebGL, only few lines of code are needed! If your user hasn't installed IEWebGL plugin yet, or if
            newer IEWebGL plugin version is available, the browser will propose to install or update plugin.
            In all other WebGL capable browsers there will be no superfluous messages.
        </p>
        <h2><br />Example 2. Creating canvas and getting WebGL context from JavaScript</h2>
        <p>
            The Example 1 shows declarative style of creating canvas, but you may decide to create canvas from JavaScript. Lets look the sample page code:
        </p>
        <pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;script src="http://iewebgl.com/scripts/webglhelper.js"
    type="text/javascript"&gt;
&lt;/script&gt;
&lt;/head&gt;

&lt;script type="text/javascript"&gt;
	function InitWebGLContext() {
		var glCanvas = document.getElementById("glCanvas");
		// first, try standard WebGL context
		var gl = glCanvas.getContext("webgl");
		if (!gl) {
			// if failed, try experimental one
			gl = glCanvas.getContext("experimental-webgl");
		}

		if (!gl) {
			alert("Your browser does not support WebGL");
			return;
		}

		// here we get WebGL context, let's show some info
		alert(
			"WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
			"WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
			"WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
		);
	}

	function OnGLCanvasCreated(canvasElement, elementId) {
		InitWebGLContext();
	}

	function OnGLCanvasFailed(canvasElement, elementId) {
		alert("Your browser does not support WebGL");
	}

	function Init() {
		var cnv = WebGLHelper.CreateGLCanvas(
			document.getElementById('renderArea'),
			'glCanvas', false, OnGLCanvasCreated, OnGLCanvasFailed);
	}
&lt;/script&gt;

&lt;/head&gt;

&lt;body onload="Init()"&gt;
&lt;div id="renderArea"&gt;
&lt;!-- we want to create canvas inside this div, using JavaScript --&gt;
&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;
        </pre>
        <p>
            This example creates child element (&lt;canvas&gt; or &lt;object&gt;, depending of browser capabilities) inside parent &lt;div&gt;.
            Init() function is executed after browser finished loading the page body and WebGLHelper.CreateGLCanvas() creates
            canvas using the same handlers as in previous sample.
        </p>
        <h2><br />Example 3. Creating WebGL context with helper</h2>
        <p>
            Different browser vendors use the "exprimental-" prefix while their WebGL implementations evolve, so to be ready for final implementations,
            we should write code, that tries to create WebGL context, using standard context name that is "webgl", and "experimental-webgl".
            WebGLHelper.js have the utility function for that. Let's look the sample code.
        </p>
        <pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;!-- required to use WebGLHelper object --&gt;
&lt;script src="http://iewebgl.com/scripts/webglhelper.js"
    type="text/javascript"&gt;
&lt;/script&gt;

&lt;script type="text/javascript"&gt; 
	function InitWebGLContext() {
		var gl = WebGLHelper.GetGLContext(
			document.getElementById("glCanvas"));

		if (!gl) {
			alert("Your browser does not support WebGL");
			return;
		}

		// here we get WebGL context, let's show some info
		alert(
			"WebGL version=" + gl.getParameter(gl.VERSION) + "\n" +
			"WebGL vendor=" + gl.getParameter(gl.VENDOR) + "\n" +
			"WebGL renderer=" + gl.getParameter(gl.RENDERER) + "\n"
		);
	}

	function OnGLCanvasCreated(canvasElement, elementId) {
		InitWebGLContext();
	}

	function OnGLCanvasFailed(canvasElement, elementId) {
		alert("Your browser does not support WebGL");
	}
&lt;/script&gt; 
&lt;/head&gt;

&lt;body&gt;
&lt;script id="WebGLCanvasCreationScript" type="text/javascript"
	style="width:100%;height:100%"&gt;WebGLHelper.CreateGLCanvasInline(
		'glCanvas', OnGLCanvasCreated, OnGLCanvasFailed)
&lt;/script&gt;
&lt;/body&gt;

&lt;/html&gt;
        </pre>
        <p>
            This example is slightly modified version of the Example 2.
            If neither standard, nor experimental WebGL context can be created, WebGLHelper.CreateGLContext() returns null;
        </p>
        <h2><br />Example 4. Styling plugin loading screen</h2>
        <p>
            When IE user comes to IEWebGL compatible site for the first time, he sees the plugin loading splash screen,
            <br />
            <img class="screenshot" alt="Loading screen" src="Imgs/loading_screen.png" width="577" height="400"><br />
            you can adapt this screen to your site's look and feel, by using special property of WebGLHelper object.
        </p>
        <pre class="brush: js; html-script: true">
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;!-- required to use WebGLHelper object --&gt;
&lt;script src="http://iewebgl.com/scripts/webglhelper.js"
    type="text/javascript"&gt;
&lt;/script&gt;

&lt;script type="text/javascript"&gt; 
	function OnGLCanvasCreated(canvasElement, elementId) {
		
	}

	function OnGLCanvasFailed(canvasElement, elementId) {
		
	}
&lt;/script&gt; 
&lt;/head&gt;

&lt;body&gt;
&lt;script id="WebGLCanvasCreationScript" type="text/javascript"
	style="width:100%;height:100%"&gt;
	WebGLHelper.autoLoadScreen.innerHTML = "DEMO DESIGN HERE";
	WebGLHelper.CreateGLCanvasInline(
		'glCanvas', OnGLCanvasCreated, OnGLCanvasFailed);
&lt;/script&gt;
&lt;/body&gt;

&lt;/html&gt;
        </pre>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="StandardCompatibility">Standard compatibility</h1>
        <p>
            IEWebGL fully implements WebGL v1.0 specification. See our unit tests in the next section.
            <br /><br />
            The important feature of IEWebGL is support of JavaScript debugger:
            <br />
            <img class="screenshot" alt="JavaScript debugger" src="Imgs/debug_watch.png" width="576" height="436"><br /><br />
            and console error logging:
            <br />
            <img class="screenshot" alt="console error logging" src="Imgs/debug_console.png" width="576" height="436">
        </p>
    </div><div class="separator"></div>
    <div class="block">
        <h1 id="UnitTests">Unit tests</h1>
        <p>
            We publish our unit test suite to unsure standard compatibility and interoperable behaviour with another webgl implementations.
        </p>
        <br /><h2>TypedArray unit tests:</h2>
        <p>
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=ArrayBuffer" runat="Server">ArrayBuffer</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Uint8Array" runat="Server">Uint8Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Int8Array" runat="Server">Int8Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Uint16Array" runat="Server">Uint16Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Int16Array" runat="Server">Int16Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Uint32Array" runat="Server">Uint32Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Int32Array" runat="Server">Int32Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Float32Array" runat="Server">Float32Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Float64Array" runat="Server">Float64Array</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=DataView" runat="Server">DataView</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/TypedArray/TypedArray.html?filter=Mixed" runat="Server">Mixed</asp:Hyperlink>
        </p>
        <br /><h2>WebGL objects unit tests:</h2>
        <p>
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLRenderingContext" runat="Server">WebGLRenderingContext</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLShader" runat="Server">WebGLShader</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLBuffer" runat="Server">WebGLBuffer</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLProgram" runat="Server">WebGLProgram</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLTexture" runat="Server">WebGLTexture</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLRenderbuffer" runat="Server">WebGLRenderbuffer</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLFramebuffer" runat="Server">WebGLFramebuffer</asp:Hyperlink>, 
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLExtensions" runat="Server">WebGLExtensions</asp:Hyperlink>,
            <asp:Hyperlink NavigateUrl="~/UnitTest/WebGL/WebGL.html?filter=WebGLFunctional" runat="Server">WebGLFunctional</asp:Hyperlink>
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="NonStandardBehaviour">Non-standard behaviour</h1>
        <h2>1. Texturing</h2>
        <p>
            IE6, IE7 and IE8 browsers do not support HTML5 video and canvas so textures can't be created from that objects.
        </p>
        <h2><br />2. Events</h2>
        <p>
            In IE6, IE7 and IE8 WebGL's "webglcontextcreationerror", "webglcontextlost" and "webglcontextrestored" events are
            emulated using "onerror" event. To distinguish WebGL event from others, check the "webglEventType" property of
            the event object, it contains the name of WebGL event.
        </p>
        <h2><br />3. Draw canvas to canvas</h2>
        <p>
            HTML canvas specification says that you can draw image from one canvas to another canvas using 2d context's
            drawImage() method. As specification says drawImage() can draw image, canvas or video elements. As you know,
            IEWebGL plugin is actually an object element, so it can't be drawn to regular canvas directly.
            Here we show the way how to use non-standard IEWebGL extension to achieve the same result.
        </p>
        <pre class="brush: js;">
function CopyCanvas() {
    var nativeCnv = document.getElementById("nativeCanvas");
    nativeCnv.width = nativeCnv.scrollWidth;
    nativeCnv.height = nativeCnv.scrollHeight;
    var webglCnv = document.getElementById("webglCanvas");
		
    var ctx2D = nativeCnv.getContext("2d");

    // standard way
    // ctx2D.drawImage(webglCnv, 0, 0);

    // IEWebGL extension way
    webglCnv.updateNativeCanvas();
    ctx2D.drawImage(webglCnv.getNativeCanvas(), 0, 0);
}    
        </pre>
        <p>
            The webglCnv.updateNativeCanvas() call updates hidden canvas created by IEWebGL plugin with current IEWebGL plugin picture.
            The webglCnv.getNativeCanvas() method returns the hidden canvas object, and you can use it anythere as any other native canvas.
        </p>
        <h2><br />4. Read binary data from XMLHTTPRequest object in IE8 and IE9 (as they do not support .responseType="arraybuffer")</h2>
        <p>
            Using IEWebGL you can create any TypedArray object from xhr.responseBody:
            <pre class="brush: js;">
function loadArrayBuffer(uri, callback) {

  var xhr = new XMLHttpRequest();
  xhr.open('GET', uri, true);
  //xhr.responseType = "arraybuffer"; // for modern browsers
  xhr.onreadystatechange = function(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        var byteView = new Uint8Array(xhr.responseBody); // for IE8 and IE9
        callback(byteView.buffer);
      //callback(xhr.response); // for modern browsers
    }
  }
  xhr.send(null);

}    
        </pre>
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="SpecialSettings">Special settings</h1>
        <h2>1. Local content</h2>
        <p>
            To allow IEWebGL plugin to load local content, create empty file named "IEWebGLAllowLocalContent" (without extension) in your Windows directory.
        </p>
    </div>
</asp:Content>

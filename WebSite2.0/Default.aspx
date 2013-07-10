<%@ Page Title="IEWebGL - WebGL for Internet Explorer" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Default.aspx.cs" Inherits="_Default" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
	<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>
	<script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script>
    <style type="text/css">#main { color:#FFFFFF; }</style>
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
            <h1 id="H8">IEWebGL v1.1.4 Released</h1>
            <p>
                - Fixed WebGL error logging to browser console.<br />
                - Added some CORS textures support.<br />
                - Fixed buffer range checking in glDrawElements().<br />
                - Fixed convertion of FP values from JS (made it system locale invariant).<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[13 June 2013]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H7">IEWebGL v1.1.3 Released</h1>
            <p>
                - Fixed issues with first frame rendering.<br />
                - Delete WebGL objects that were deleted are no longer bound to the GL context.<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[10 December 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H6">IEWebGL v1.1.2 Released</h1>
            <p>
                - Fixed drawing single frame (static image).<br />
                - Fixed creating textures from images with "data:" URI scheme.<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[19 September 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H5">IEWebGL v1.1.1 Released</h1>
            <p>
                - Added support of <a href="http://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/">EXT_texture_filter_anisotropic</a> WebGL extension.<br/>
                - Small bug fix.<br />
                - Added new LXEngine <a href="Engines.aspx#LXEngine">demos</a>.<br/>
                - Added new three.js <a href="Engines.aspx#ThreeJS">demos</a>.<br/>
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[2 August 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H4">IEWebGL v1.1.0 Released</h1>
            <p>
                - Fixed all graphics resources leaks, work clean under D3D Debug Runtime.<br />
                - Fixed LCIE threading issues.<br />
                - Fixed all memory leaks, work clean under debug heap manager.<br />
                - Added support for IE10 Release Preview. Now IEWebGL can use native TypedArrays, that gains significant speedup (x1,5 up to x10 depending on application).<br />
                - Added tiny extension to TypedArray specification, to support receiving binary data through XMLHttpRequest in IE browsers without XHR Level 2 support. See <a href="Developer.aspx#NonStandardBehaviour">Developer section</a> for details.<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[10 July 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H3">IEWebGL v1.0.8 Released</h1>
            <p>
                - Fixed handling of vertex attribute 0.<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[02 May 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H2">IEWebGL v1.0.7 Released</h1>
            <p>
                - Now totally free for commercial and non-commercial use. Yes it is freeware !<br />
                - Very experimental support of WEBGL_compressed_texture_s2tc extension.<br />
                - Fixed creation of non-alpha blended context.<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[19 Mar 2012]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H1">IEWebGL v1.0.6 Released</h1>
            <p>
                - getShaderPrecisionFormat() API from latest WebGL spec.<br />
                - Decreased memory consumption and improved stability<br />
                - Bug fixes<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[20 Dec 2011]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="H1">IEWebGL v1.0.5 Released</h1>
            <p>
                - Bug fixes<br />
                - Performance optimizations<br />
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[21 Nov 2011]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="Release104">IEWebGL v1.0.4 Released</h1>
            <p>
                - License chages: IEWebGL is now totally free for non-commercial use !<br />
                - Improved memory consumption and plugin stability<br />
                - Several performance optimizations<br />
                - <asp:Hyperlink ID="Hyperlink3" NavigateUrl="~/Developer.aspx#UnitTests" runat="Server">Unit test suite</asp:Hyperlink> updated with Khronos conformance tests
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[20 Oct 2011]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
            <h1 id="Release103">IEWebGL v1.0.3 Released</h1>
            <p>
                - Experimental support for OES_texture_float and OES_standard_derivatives WebGL extensions added<br />
                - New samples: <asp:Hyperlink NavigateUrl="~/Samples/VertexTextureFetch.aspx#header" runat="Server">Vertex Texture Fetch</asp:Hyperlink> and <asp:Hyperlink NavigateUrl="~/Samples/A32FShadowMapping.aspx#header" runat="Server">A32F Shadow Mapping</asp:Hyperlink><br />
                - Crashes when working in multiple browser tabs fixed<br />
                - Several texture loading and decoding bugs fixed<br />
                - Drawing to native canvas fixed<br />
                - Test suite <asp:Hyperlink NavigateUrl="~/Developer.aspx#UnitTests" runat="Server">published</asp:Hyperlink>
            </p>
            <div class="blogpost-bar">
                <div class="blogpost-bar-date"><p><u>[05 Sep 2011]</u></p></div>
            </div>
        </div>
        <div class="separator"></div>
    <div class="block">
        <h1 id="Searching100Projects">Searching for projects</h1>
        <p>
            We would like to present unlimited license for 100 projects (games, WebGL frameworks) who would support IEWebGL. Add IEWebGL support and let us know.
            <br />
            Please, contact us: <a href="mailto:info@iewebgl.com">info@iewebgl.com</a>
        </p>
        <div class="blogpost-bar">
            <div class="blogpost-bar-date"><p><u>[18 Aug 2011]</u></p></div>
        </div>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="Release">IEWebGL v1.0 Released</h1>
        <p>
            IEWebGL plugin is developed to make possible for web developers
            to use same technologies and same project code base for all platforms.
            It is important because WebGL is expected to be widely supported
            on all platforms from mobile to desktop.
            <br /><br />
            - Standard compatible<br/>
            - One-click plugin installation and update<br/>
            - Fast (up to 100 FPS on IE9 and IE10 Platform Previews, up to 60 FPS in IE8)<br/>
            - Works in all actual IE versions<br/>
            - Secure (no local content loading, no cross-domain textures)<br/>
            - Works even without OpenGL drivers installed<br/>
            - Works through remote desktop on Vista and Windows 7
            <br/><br/>
            You can easily install IEWebGL plugin. There is
            neither toolbars/popups added, nor browser load time increased,
            IEWebGL simply works when it’s needed.
        </p>
        <div class="blogpost-bar">
            <div class="blogpost-bar-date"><p><u>[08 Aug 2011]</u></p></div>
        </div>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="Beta2">IEWebGL Beta 2 Released</h1>
        <p>
            - No local and cross-domain textures<br/>
            - IE6 and IE7 support added<br/>
            - Texture loading bugs on XP fixed<br/>
            - Correctly handles lost context state<br/>
            - Context attributes flags handling fixed<br/>
            - Digitally signed<br/>
            - Developer's demos updated (now run in IE8)
        </p>
        <div class="blogpost-bar">
            <div class="blogpost-bar-date"><p><u>[01 Jul 2011]</u></p></div>
        </div>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="Beta">IEWebGL Beta Released</h1>
        <p>
            After several months of prototyping, development and testing, the first IEWebGL beta is presented to public.
        </p>
        <div class="blogpost-bar">
            <div class="blogpost-bar-date"><p><u>[27 Jun 2011]</u></p></div>
        </div>
    </div>
</asp:Content>

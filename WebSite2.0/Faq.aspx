<%@ Page Title="IEWebGL - WebGL for Internet Explorer - FAQ" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Faq.aspx.cs" Inherits="Faq" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <style type="text/css">#faq { color:#FFFFFF; }</style>
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>F.A.Q.</h1>
	    <p>
	        <b>Q:</b> What IE versions are supported ?<br/>
	        <b>A:</b> IE6, IE7, IE8, IE9 and IE10 Platform Previews. Both 32 and 64 bits versions of IE are supported.<br/>
	        <br/>
	        <b>Q:</b> What Windows versions are supported ?<br/>
	        <b>A:</b> Windows XP/Vista/7 32 and 64 bit.<br/>
	        <br/>
	        <b>Q:</b> Is it freeware software ?<br/>
	        <b>A:</b> Yes, it is! You can use IEWebGL the way you like in commercial and non-commercial projects without any limitations. You can also have a copies of IEWebGL installer on your own servers. We'll very appreciate if you somehow mention IEWebGL in your project info. We are working hard on fixing bugs and adding new functionality and WebGL extensions, but we can't guarantee timeframes for such work.<br/>
	        <br/>
	        <b>Q:</b> I'm a web developer, can I evaluate your product ?<br/>
	        <b>A:</b> Yes, simply install IEWebGL plugin, and start prototyping, making tests, or developering your site using WebGL.<br/>
	        <br/>
            <b>Q:</b> I'm not a web developer, I've installed IEWebGL and my favourite site still does not work in IE, why ?<br/>
	        <b>A:</b> IEWebGL implements WebGL standard for IE, but it does not function so seamless like built-in implementation, and does not alter deep internals of IE web browser, so there are several simple steps, a web developers should perform to support IEWebGL.<br/>
	        <br/>
	        <b>Q:</b> What is the difference between native WebGL support and IEWebGL plugin ?<br/>
	        <b>A:</b> There are several limitations in IE6, IE7 and IE8, because they do not support HTML video and HTML canvas, so the mentioned objects can't be used to create textures, and you are limited to use Image object and TypedArrays. In IE9 and IE10 Platform Preview all WebGL features are available, so there is virtually no difference.<br/>
	        <br/>
	        <b>Q:</b> What is performance compared to browsers with native WebGL support ?<br/>
	        <b>A:</b> Our perfomance tests shows high FPS rates even in HD resolutions. There are areas, there IEWebGL shows lower perfomance in IE9 and earlier, because plugin is not a part of browser and can't use for example all internal JavaScript objects and interfaces, but can only work through COM layer, whose perfomance is not as good. In IE10 you should expect no performance issues, IEWebGL run at native speed.<br/>
	        <br/>
	        <b>Q:</b> Is IEWebGL compatible with any WebGL JavaScript engine ?<br/>
	        <b>A:</b> Yes, it is. We are working with engine developers to test and enable their engines to work with Internet Explorer and IEWebGL. One great example is Ambierra's CopperLicht3D engine, that works great with IEWebGL, and already supports Internet Explorer, another popular open-source 3D library for JavaScript - THREE.js also can be used with IEWebGL.<br/>
	        <br/>
	        <b>Q:</b> Does IEWebGL implement 2d context ?<br/>
	        <b>A:</b> No, IE9+ supports 2d context natively, and it is very complex to make fully standard-compatible implementation of 2d context for IE8, so IEWebGL provide only WebGL context.<br/>
            <br/>
	        <b>Q:</b> What other useful things IEWebGL can do for me ?<br/>
	        <b>A:</b> You could use IEWebGL for things, different from 3D graphics. IEWebGL implements TypedArray standard for IE browsers, that do not have built-in support. You can receive binary data using XMLHttpRequest + IEWebGL and process that data with JavaScript in a standard-compliant way. See Developers page for details on that.<br/>
	    </p>
    </div>
</asp:Content>

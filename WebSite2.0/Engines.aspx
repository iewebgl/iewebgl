<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Engines" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Engines.aspx.cs" Inherits="Engines" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <style type="text/css">#engines { color:#FFFFFF; }</style>
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>Engines</h1>
        <p>
            If you are WebGL-engine developer and you've added support for IEWebGL, you can inform
            us. We will add your engine to this page. Also you can send us some demos that you
            would like to see here.
        </p>
    </div>
    <div class="separator"></div>
     <div class="block">
        <h1 id="LXEngine">LXEngine</h1>
        <p>
            LXEngine is a JavaScript engine for creating 3D on the web page. It has powerfull and fast graphics core, extension library (cameras, environment, resources, models, pipelines) and web service for 3D-model editing.<br/>
        </p>
        <table border="0" cellspacing="0" cellpadding="0" width="577" style="margin-top:10px">
            <tr valign="middle">
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="http://lx-engine.com/sample/sample07/sample.html" runat="Server"><img class="img-preview" src="Engines/LXEngine/Lake.png"/></asp:Hyperlink><p class="img-desc-text">complex scene</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="http://lx-engine.com/sample/sample06/sample.html" runat="Server"><img class="img-preview" src="Engines/LXEngine/Church.png"/></asp:Hyperlink><p class="img-desc-text">multiple materials</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="http://lx-engine.com/sample/sample04/sample.html" runat="Server"><img class="img-preview" src="Engines/LXEngine/Box2D.png"/></asp:Hyperlink><p class="img-desc-text">Box2D.JS physics</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="http://lx-engine.com/demo/village/demo.html" runat="Server"><img class="img-preview" src="Engines/LXEngine/Village.png"/></asp:Hyperlink><p class="img-desc-text">architectural visualization</p></td>
            </tr>
        </table>
        <p>
            Visit website: <a href="http://lx-engine.com/en/main.html" target="_parent">http://lx-engine.com/en/main.html</a><br />
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="ThreeJS">three.js</h1>
        <p>
            The aim of the project is to create a lightweight 3D library with a very low level of complexity — in other words, for dummies.<br />
        </p>
        <table border="0" cellspacing="0" cellpadding="0" width="577" style="margin-top:10px">
            <tr valign="middle">
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Three/webgl_geometry_terrain.html" runat="Server"><img class="img-preview" src="Engines/Three/Terrain.png"/></asp:Hyperlink><p class="img-desc-text">generated terrain</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Three/webgl_materials_cars.html" runat="Server"><img class="img-preview" src="Engines/Three/Cars.png"/></asp:Hyperlink><p class="img-desc-text">materials and cars</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Three/webgl_geometry_minecraft_ao.html" runat="Server"><img class="img-preview" src="Engines/Three/Minecraft.png"/></asp:Hyperlink><p class="img-desc-text">minecraft style rendering</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Three/webgl_interactive_draggablecubes.html" runat="Server"><img class="img-preview" src="Engines/Three/Draggable.png"/></asp:Hyperlink><p class="img-desc-text">draggable objects</p></td>
            </tr>
        </table>
        <p>
            Visit website: <a href="https://github.com/mrdoob/three.js/" target="_parent">https://github.com/mrdoob/three.js/</a><br />
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="CopperLicht">CopperLicht</h1>
        <p>
            CopperLicht is a WebGL library and JavaScript 3D engine for creating games and 3d
            applications in the webbrowser. CopperLicht comes with a full 3D editor and supports
            all features necessary to create full 3d games.<br />
        </p>
        <table border="0" cellspacing="0" cellpadding="0" width="577" style="margin-top:10px">
            <tr valign="middle">
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo00.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo00.png"/></asp:Hyperlink><p class="img-desc-text">movement and keyboard</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo01.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo01.png"/></asp:Hyperlink><p class="img-desc-text">custom scene nodes</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo02.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo02.png"/></asp:Hyperlink><p class="img-desc-text">2d overlays</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo03.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo03.png"/></asp:Hyperlink><p class="img-desc-text">materials and shaders</p></td>
            </tr>
            <tr valign="middle">
                <td width="130" align="center"></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo04.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo04.png"/></asp:Hyperlink><p class="img-desc-text">collision detection</p></td>
                <td width="19"></td>
                <td width="130" align="center"><asp:Hyperlink NavigateUrl="~/Engines/Copperlicht/Demo05.aspx#header" runat="Server"><img class="img-preview" src="Engines/Copperlicht/Demo05.png"/></asp:Hyperlink><p class="img-desc-text">character animation</p></td>
                <td width="19"></td>
                <td width="130" align="center"></td>
            </tr>
        </table>
        <p>
            Visit website: <a href="http://www.ambiera.com/copperlicht/index.html" target="_parent">http://www.ambiera.com/copperlicht/index.html</a><br />
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1>Other engines</h1>
        <p>
            Most well-engineered engines should work, but you still may need to write special initialization code to work in IE.
        </p>
    </div>
</asp:Content>

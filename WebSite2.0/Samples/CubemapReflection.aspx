<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Cubemap Reflection Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="CubemapReflection.aspx.cs" Inherits="Samples_CubemapReflection" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Cubemap Reflection Sample</h1>
        <p>
            This demo shows how to load and use cube textures on 3D models in WebGL. We use simple vertex shader,
            to calculate view reflection vector and use it in frament shader to sample a cube texture, creating a mirroring cube.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="CubemapReflection.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="CubemapReflection.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
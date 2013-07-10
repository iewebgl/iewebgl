<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Lighting Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Texturing.aspx.cs" Inherits="Samples_Texturing" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Texturing Sample</h1>
        <p>
            This sample shows how texture can be loaded and applied to 3D model. Every vertex of the cube model has now three attributes: position, normal and texture coordinates.
            The vertex shader calculates the lighting using normal and global light direction, it also pass texture coordinates to fragment shader.
            The fragment shader uses interpolated texture coordinates to sample a texture map, that is loaded using JavaScript Image object.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Texturing.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="Texturing.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Lighting Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Lighting.aspx.cs" Inherits="Samples_Lighting" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Lighting Sample</h1>
        <p>
            This sample demonstrates how lighting can be applied to 3D model. Every vertex of the cube model has two attributes: position and normal.
            The vertex shader calculates the color of the vertex using it's normal and global light direction.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Lighting.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="Lighting.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
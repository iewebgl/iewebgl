<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Render To Texture Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="RenderToTexture.aspx.cs" Inherits="Samples_RenderToTexture" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Render To Texture Sample</h1>
        <p>
            This demo shows how to use framebuffer and renderbuffer WebGL objects
            to render 3D picture and after that use it as texture.
            This technique is very popular to create mirrors, shadows and other interesting effects.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="RenderToTexture.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="RenderToTexture.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
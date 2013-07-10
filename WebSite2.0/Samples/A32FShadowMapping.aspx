<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Render To Texture Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="A32FShadowMapping.aspx.cs" Inherits="Samples_A32FShadowMapping" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">A32F Shadow Mapping</h1>
        <p>
            This demo shows how to use OES_float_texture extension for shadow mapping technique. 
            We are creating A32F format texture and rendering the scene by special depth-write shader. 
            Then we are sampling from the texture and calculate shadow value in the main render pass. 
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="A32FShadowMapping.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="A32FShadowMapping.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
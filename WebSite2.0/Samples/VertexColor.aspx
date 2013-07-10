<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Vertex Color Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="VertexColor.aspx.cs" Inherits="Samples_VertexColor" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Vertex Color Sample</h1>
        <p>
            This demo shows the colored cube. Every cube vertex has it's color.
            That color is smoothly interpolated on the faces of the cube using the very simple fragment shader.
            Vertices use only two attributes: position and color, so the setup is easy.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="VertexColor.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="VertexColor.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
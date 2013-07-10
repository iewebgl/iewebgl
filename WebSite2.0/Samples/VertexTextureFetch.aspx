<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Vertex Color Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="VertexTextureFetch.aspx.cs" Inherits="Samples_VertexTextureFetch" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Vertex Texure Fetch Sample</h1>
        <p>
            This demo shows texture fetching in vertex shader. We are calculating the height of the grid from height map and applying some animation. 
            The feature is available if your hardware has at least one vertex texture unit. 
            You can check it by getParameter call with MAX_VERTEX_TEXTURE_IMAGE_UNITS value.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="VertexTextureFetch.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="VertexTextureFetch.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
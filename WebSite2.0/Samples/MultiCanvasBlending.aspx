<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Multi Canvas Blending Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="MultiCanvasBlending.aspx.cs" Inherits="Samples_MultiCanvasBlending" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Multi Canvas Blending Sample</h1>
        <p>
            This demo creates two canvases with WebGL contexts, fill them with semitransparent color
            and move them around a page, to demonstrate how content blending and page composition work with WebGL.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="MultiCanvasBlending.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="MultiCanvasBlending.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
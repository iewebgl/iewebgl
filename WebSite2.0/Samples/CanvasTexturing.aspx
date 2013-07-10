<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Canvas Texturing Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="CanvasTexturing.aspx.cs" Inherits="Samples_CanvasTexturing" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Canvas Texturing Sample</h1>
        <p>
            This demo uses HTML5 &lt;canvas&gt; element to draw a 2d clock. Every render frame the canvas content is copied to texture and applied to cube model.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="CanvasTexturing.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="CanvasTexturing.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
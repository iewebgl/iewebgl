<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Video Texturing Sample" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="VideoTexturing.aspx.cs" Inherits="Samples_VideoTexturing" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Video Texturing Sample</h1>
        <p>
            This demo uses HTML5 &lt;video&gt; element to stream a video to the browser. When WebGL context is ready, the video starts,
            and when browser streams enough data to show frames, the texture is created.
            Every render frame the video element is copied to texture.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="VideoTexturing.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <table border="0" cellspacing="0" cellpadding="0" width="577">
        	<tr>
        		<td width="50%" align="left"><p><asp:Hyperlink NavigateUrl="~/Developer.aspx#Samples" runat="Server"><< back to another samples</asp:Hyperlink></p></td>
                <td align="right"><p><asp:Hyperlink NavigateUrl="VideoTexturing.zip" runat="Server">[download source code]</asp:Hyperlink></p></td>
        	</tr>
        </table>
    </div>
</asp:Content>
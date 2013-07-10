<%@ Page Title="IEWebGL - WebGL for Internet Explorer - CopperLicht Demo" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Demo02.aspx.cs" Inherits="Engines_Copperlicht_Demo02" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">2D Overlays</h1>
        <p>
            Demonstrates 2d text overlays, how to caculate the 2d position from a 3d position and how to use the OnAnimate handler.
            <br />
            Look with the mouse, move with the cursor keys or <b>WASD</b>.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Demo02.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <p>
            <asp:Hyperlink NavigateUrl="~/Engines.aspx#CopperLicht" runat="Server"><< back to another samples</asp:Hyperlink>
        </p>
    </div>
</asp:Content>
<%@ Page Title="IEWebGL - WebGL for Internet Explorer - CopperLicht Demo" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Demo03.aspx.cs" Inherits="Engines_Copperlicht_Demo03" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Custom materials and shaders</h1>
        <p>
            Demonstrates how to create custom materials and shaders.
            <br />
            Look with the mouse, move with the cursor keys or <b>WASD</b>.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Demo03.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <p>
            <asp:Hyperlink NavigateUrl="~/Engines.aspx#CopperLicht" runat="Server"><< back to another samples</asp:Hyperlink>
        </p>
    </div>
</asp:Content>
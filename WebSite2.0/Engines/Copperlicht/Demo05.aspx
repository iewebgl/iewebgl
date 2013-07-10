<%@ Page Title="IEWebGL - WebGL for Internet Explorer - CopperLicht Demo" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Demo05.aspx.cs" Inherits="Engines_Copperlicht_Demo05" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Character Animation</h1>
        <p>
            Demonstrates how to show animated 3D Characters using Skeletal Animation.
            <br />
            Press <b>Space</b> to change the animation, press <b>C</b> to clone the soldier. Use cursor keys and mouse to move the camera.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Demo05.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <p>
            <asp:Hyperlink NavigateUrl="~/Engines.aspx#CopperLicht" runat="Server"><< back to another samples</asp:Hyperlink>
        </p>
    </div>
</asp:Content>
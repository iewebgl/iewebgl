<%@ Page Title="IEWebGL - WebGL for Internet Explorer - CopperLicht Demo" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Demo04.aspx.cs" Inherits="Engines_Copperlicht_Demo04" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Collision detection and response</h1>
        <p>
            Demonstrates how to do collision detection in CopperLicht.
            <br />
            Look with the mouse, move with the cursor keys or <b>WASD</b>. Press <b>Space</b> to 'shoot' a cube at the next wall.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Demo04.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <p>
            <asp:Hyperlink NavigateUrl="~/Engines.aspx#CopperLicht" runat="Server"><< back to another samples</asp:Hyperlink>
        </p>
    </div>
</asp:Content>
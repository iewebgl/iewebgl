<%@ Page Title="IEWebGL - WebGL for Internet Explorer - CopperLicht Demo" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Demo00.aspx.cs" Inherits="Engines_Copperlicht_Demo00" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1 id="header">Movement and Keyboard input</h1>
        <p>
            Shows how to move 3d objects by pressing keys, and how to use animators.
            <br />
            Press <b>F</b> and <b>G</b> to move the Cube up and down.
        </p>
        <div class="canvas-3d" style="width:575px;height:432px;">
            <iframe align="left" width="575" height="432" src="Demo00.html" frameborder="0" scrolling="no"></iframe>
        </div>
        <p>
            <asp:Hyperlink NavigateUrl="~/Engines.aspx#CopperLicht" runat="Server"><< back to another samples</asp:Hyperlink>
        </p>
    </div>
</asp:Content>
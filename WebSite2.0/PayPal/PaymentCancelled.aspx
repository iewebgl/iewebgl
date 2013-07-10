<%@ Page Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true" CodeFile="PaymentCancelled.aspx.cs" Inherits="PaymentCancelled" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>Payment cancelled</h1>
        <p>
            You cancelled the payment process.
            <br />
            Please visit products section to choose another product.
            <br /><br />
            <asp:Hyperlink NavigateUrl="~/Products.aspx" runat="server">Back to product list</asp:Hyperlink>
        </p>
    </div>
</asp:Content>

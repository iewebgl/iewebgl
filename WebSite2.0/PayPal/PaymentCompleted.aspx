<%@ Page Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true" CodeFile="PaymentCompleted.aspx.cs" Inherits="PaymentCompleted" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>Payment completed</h1>
        <p>
            Your payment transaction ID is: <%= PayPalFields["txn_id"] %>
            <br /><br />
            <asp:Hyperlink NavigateUrl="~/Products.aspx" runat="server">Back to product list</asp:Hyperlink>
        </p>
    </div>
</asp:Content>

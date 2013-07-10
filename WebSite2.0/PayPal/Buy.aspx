<%@ Page Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true" CodeFile="Buy.aspx.cs"
    Inherits="Buy" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <asp:Wizard ID="Wizard1" runat="server" ActiveStepIndex="0" FinishPreviousButtonStyle-CssClass="form-button"
        FinishCompleteButtonStyle-CssClass="disabled" StartNextButtonStyle-CssClass="form-button">
        <LayoutTemplate>
            <div style="width:400px; margin:0 auto;">
                <asp:PlaceHolder ID="WizardStepPlaceHolder" runat="server" />
            </div>
            <div style="width:410px; margin:0 auto; padding="0px">
                <asp:PlaceHolder ID="navigationPlaceHolder" runat="server" />
            </div>
            <div class="disabled">
                <asp:PlaceHolder ID="sideBarPlaceHolder" runat="server" />
            </div>
        </LayoutTemplate>
        <WizardSteps>
            <asp:WizardStep ID="WizardStep1" runat="server" Title="Step 1">
                <p style="padding-top:10px;">
                    <br />
                    <span class="form-error-text" style="text-align:left">
                        <asp:RequiredFieldValidator ID="RequiredFieldValidator1" runat="server" ErrorMessage="Domain URL is required."
                            ControlToValidate="domain" Display="Dynamic"></asp:RequiredFieldValidator>
                        <asp:RegularExpressionValidator ID="RegularExpressionValidator1" runat="server" ErrorMessage="Domain URL is invalid. (valid example: http://iewebgl.com)"
                            ControlToValidate="domain" ValidationExpression="http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&amp;=]*)?"
                            Display="Dynamic"></asp:RegularExpressionValidator>
                    </span>
                    <br />
                    <div style="text-align: center; width:400px;">
                        <div class="accountInfo">
                            <fieldset class="login">
                                <legend><asp:Label ID="Label1" runat="server">Enter domain URL (ex. http://domain.com no "www."):</asp:Label></legend>
                                <p>
                                    <br />
                                    <asp:TextBox ID="Domain" Style="width: 300px;" runat="server" CssClass="textEntry" MaxLength="128"></asp:TextBox>
                                </p>
                            </fieldset>
                        </div>
                    </div>
            </asp:WizardStep>
            <asp:WizardStep ID="WizardStep2" runat="server" Title="Step 2">
                <div class="paypal-verified">
                    <a href="https://www.paypal.com/us/verified/pal=paypal%40iewebgl%2ecom" target="_blank">
                        <img width="120px" height="87px" class="img" alt="Official PayPal Seal" src="../Imgs/paypal-verified.png">
                    </a>
                </div>
                <p style="padding-top:10px;">
                    <br />
                    <br />
                    <div style="text-align: center; width:400px;">
                        <div class="accountInfo">
                            <fieldset class="login">
                                <legend><asp:Label ID="Message" runat="server">Please now use BuyNow button to pay:</asp:Label></legend>
                                <div class="sell-item-info">
                                    <asp:Repeater runat="server" DataSourceID="SqlDataSource">
                                        <ItemTemplate>
                                            <p style="padding: 10px 10px;">
                                                <b>Domain name:</b> <%= Domain.Text%>
                                                <br />
                                                <b>License name:</b> <%# Eval("name") %>
                                                <br />
                                                <b>License duration:</b> <%# Eval("duration") %>
                                                <br />
                                                <b>Price:</b> <%# Eval("price")%> USD
                                            </p>
                                        </ItemTemplate>
                                    </asp:Repeater>
                                </div>
                                <div>
                                    <%= String.Format("<a href=\"PayPalProxy.aspx?id={0}&domain={1}\"><img src=\"../Imgs/buybutton.gif\" border=\"0\" alt=\"PayPal - The safer, easier way to pay online!\"></a>", Request.Params["id"], Domain.Text)%>
                                </div>
                            </fieldset>
                        </div>
                    </div>
            </asp:WizardStep>
        </WizardSteps>
    </asp:Wizard>

    <asp:SqlDataSource ID="SqlDataSource" ConnectionString="<%$ ConnectionStrings:ApplicationServices %>"
        SelectCommand="SELECT * FROM [sell_items] WHERE ([id] = @id)" 
        runat="server">
        <SelectParameters>
            <asp:QueryStringParameter Name="id" QueryStringField="id" Type="Decimal" />
        </SelectParameters>
    </asp:SqlDataSource>

</asp:Content>

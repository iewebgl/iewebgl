<%@ Page Title="IEWebGL - WebGL for Internet Explorer - Download" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="Download.aspx.cs" Inherits="Download" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">

<script src="Scripts/webglhelper.js" type="text/javascript"></script>
<script type="text/javascript">

    var installerURL = "http://iewebgl.com/releases/iewebgl.exe";
    
    function InitiateDownload(url) {
        document.getElementById("Downloader").src = url;
    }

    function ShowByBrowser() {
        document.getElementById("other").style.display = "block";
        InitiateDownload(installerURL);
    }

</script>

</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <div id="other" style="display:none">
            <h1>Download</h1>
            <p>
                If download does not start in 5 seconds, please download IEWebGL plugin using <a id="ManualDownload" href="">link</a>.
            </p>
        </div>
        <iframe id="Downloader" style="display:none"></iframe>
    </div>
    <script type="text/javascript">
        document.getElementById("ManualDownload").href = installerURL;
        ShowByBrowser();
    </script>
</asp:Content>

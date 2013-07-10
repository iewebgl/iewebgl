<%@ Page Title="IEWebGL - WebGL for Internet Explorer - About" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeFile="About.aspx.cs" Inherits="About" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
    <style type="text/css">#about { color:#FFFFFF; }</style>
</asp:Content>

<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">
    <div class="block">
        <h1>Who we are ?</h1>
        <p>
            We are small team located in Moscow, Russia.
            Our team consists of professional developers, with years of
            experience in various commercial 3D graphics and gaming projects.
            <br /><br />
            To receive latest news, announcements etc, follow us on Twitter or visit us on Facebook.
            <br /><br />
            For any questions, offers, or support, please feel free to email to <a href="mailto:info@iewebgl.com">info@iewebgl.com</a>
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1 id="license">IEWebGL license</h1>
        <p>
            Permission is hereby granted, free of charge, to any person obtaining a copy
            of this software and associated documentation files (the "Software"), to deal
            in the Software without restriction, including without limitation the rights
            to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
            copies of the Software, and to permit persons to whom the Software is
            furnished to do so, subject to the following conditions:
            <br/><br/>
            The above copyright notice and this permission notice shall be included in
            all copies or substantial portions of the Software.
            <br/><br/>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
            AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
            LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
            OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
            THE SOFTWARE.
        </p>
    </div>
    <div class="separator"></div>
    <div class="block">
        <h1>People and press about us</h1>
        <p>
            <a href="http://www.irrlicht3d.org/pivot/entry.php?id=1211" target="_parent">http://www.irrlicht3d.org/pivot/entry.php?id=1211</a><br/>
            Nikolaus Gebhardt in IrrLicht3D blog<br/>
            <br/>
            <a href="http://www.html5grind.com/2011/06/29/iewebgl-webgl-for-ie8-and-beyond/" target="_parent">http://www.html5grind.com/2011/06/29/iewebgl-webgl-for-ie8-and-beyond/</a><br/>
            HTML5Grinds.com about IEWebGL<br/>
            <br/>
        </p>
    </div>
</asp:Content>

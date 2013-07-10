using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;
using System.Collections;
using System.Data;
using System.Text;

public partial class PayPalProxy : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        try
        {
            StringBuilder htmlForm = new StringBuilder();
            htmlForm.AppendLine("<html>");
            htmlForm.AppendLine(String.Format("<body onload='document.forms[\"donate\"].submit()'>"));
            htmlForm.AppendLine(String.Format("<form id='donate' method='POST' action='https://www.paypal.com/cgi-bin/webscr'>"));
            htmlForm.AppendLine(
                "<input type='hidden' name='cmd' value='_s-xclick'/>" +
                "<input type='hidden' name='hosted_button_id' value='BFQJTJ99GK63N'/>"
            );
            htmlForm.AppendLine("</form>");
            htmlForm.AppendLine("</body>");
            htmlForm.AppendLine("</html>");

            HttpContext.Current.Response.Clear();
            HttpContext.Current.Response.Write(htmlForm.ToString());
            HttpContext.Current.Response.End();
        }
        catch (System.Exception)
        {
        }
    }
}
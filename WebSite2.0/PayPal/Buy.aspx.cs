using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;
using System.Collections;
using System.Data;

public partial class Buy : System.Web.UI.Page
{
    string sqlDSN_ = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["ApplicationServices"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        Control control = Master.FindControl("BuyBtn");
        if (control != null)
        {
            control.Visible = false;
        }


        if (Request.Params["id"] == null || Request.Params["id"].Length == 0)
            Response.Redirect("../Products.aspx");
    }
}
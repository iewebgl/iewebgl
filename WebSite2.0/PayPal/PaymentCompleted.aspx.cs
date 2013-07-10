using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Net;
using System.Collections.Specialized;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public partial class PaymentCompleted : System.Web.UI.Page
{
    string payPalURL = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["PayPalServices"].ConnectionString;
    string payPalPDT_ID = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["PayPalPDT_ID"].ConnectionString;

    NameValueCollection payPalResponseItems = new NameValueCollection();
    public NameValueCollection PayPalFields
    {
        get { return payPalResponseItems; }
    }

    protected void Page_Load(object sender, EventArgs e)
    {
        var tx = this.Request.Params["tx"];
        if (tx == null || tx.Length == 0)
            return;

        var parameters = new NameValueCollection();
        parameters["cmd"] = "_notify-synch";
        parameters["tx"] = tx;
        parameters["at"] = payPalPDT_ID;

        var httpWebRequest = (HttpWebRequest)WebRequest.Create(payPalURL);
        httpWebRequest.ContentType = "application/x-www-form-urlencoded";
        httpWebRequest.Method = "POST";

        var sb = new StringBuilder();
        foreach (var key in parameters.AllKeys)
        {
            sb.Append(key + "=" + parameters[key] + "&");
        }
        sb.Length = sb.Length - 1;

        byte[] requestBytes = Encoding.UTF8.GetBytes(sb.ToString());
        httpWebRequest.ContentLength = requestBytes.Length;

        using (var requestStream = httpWebRequest.GetRequestStream())
        {
            requestStream.Write(requestBytes, 0, requestBytes.Length);
            requestStream.Close();
        }

        string strResponse;
        using (var stIn = new StreamReader(httpWebRequest.GetResponse().GetResponseStream(), Encoding.GetEncoding(1252)))
        {
            strResponse = stIn.ReadToEnd();
            stIn.Close();
        }

        strResponse = Server.UrlDecode(strResponse);

        var values = Regex.Split(strResponse, "\n");
        foreach (var s in values)
        {
            var keyVal = Regex.Split(s, "=");

            if (keyVal.Length == 1)
            {
                payPalResponseItems.Add(keyVal[0], "");
            }
            if (keyVal.Length >= 2)
            {
                string[] join = new string[keyVal.Length-1];
                for (int i = 0; i < join.Length; ++i) join[i] = keyVal[i+1];
                payPalResponseItems.Add(keyVal[0], String.Join("&", join));
            }
        }

        if (payPalResponseItems["custom"] != null)
        {
            values = Regex.Split(payPalResponseItems["custom"], "&");
            foreach (var s in values)
            {
                var keyVal = Regex.Split(s, "=");

                if (keyVal.Length == 1)
                {
                    payPalResponseItems.Add(keyVal[0], "");
                }
                if (keyVal.Length >= 2)
                {
                    payPalResponseItems.Add(keyVal[0], keyVal[1]);
                }
            }
        }
    }
}

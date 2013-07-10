using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Mail;
using System.Web.Security;
using System.Net;
using System.IO;
using System.Data.SqlClient;
using System.Collections.Specialized;
using System.Text;

public partial class IPNPaymentProcessing : System.Web.UI.Page
{
    string sqlDSN_ = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["ApplicationServices"].ConnectionString;
    string payPalURL = System.Web.Configuration.WebConfigurationManager.ConnectionStrings["PayPalServices"].ConnectionString;

	string userID_ = "";
    string userName_ = "";
    string userEMail_ = "";
    
    int productID_ = 0;
    string productName_ = "";
    int productDuration_; // in days
	double price_ = 0.0;

    string domain_ = "";
    DateTime validThrough_ = DateTime.Now;
    string payPalTID_ = "";
    
	
	protected void Page_Load(object sender, EventArgs e)
	{
        try
        {
            ProcessPayPalIPN(this.Request.Params);
        }
        catch (System.Exception ex)
        {
            using ( StreamWriter sw = new StreamWriter(Server.MapPath("IPN_exception_log.txt"), true) ) 
            {
                sw.WriteLine(DateTime.Now.ToString());
                sw.WriteLine("Exception: " + ex.ToString());
                sw.WriteLine("");
                sw.WriteLine("StackTrace: " + ex.StackTrace);
                sw.WriteLine("");
                sw.WriteLine("Request params: " + this.Request.Params.ToString());
                sw.WriteLine("");
                sw.WriteLine("---------------------------------------------------------------------------------");
                sw.Close();
            }
        }
	}

    void Refund(System.Collections.Specialized.NameValueCollection reqParams)
    {

    }

	void ProcessPayPalIPN(System.Collections.Specialized.NameValueCollection reqParams)
	{
        if (reqParams.Count == 0)
            return;

		string strFormValues = reqParams.ToString();

		string strNewValue;
		string strResponse;
		// Create the request back
        HttpWebRequest req = (HttpWebRequest)WebRequest.Create(payPalURL);

		// Set values for the request back
		req.Method = "POST";
		req.ContentType = "application/x-www-form-urlencoded";
		strNewValue = "cmd=_notify-validate&" + strFormValues;
		req.ContentLength = strNewValue.Length;
		// Write the request back IPN strings
		StreamWriter stOut = new StreamWriter(req.GetRequestStream(), System.Text.Encoding.ASCII);
		stOut.Write(strNewValue);
		stOut.Close();

		// Do the request to PayPal and get the response
		StreamReader stIn = new StreamReader(req.GetResponse().GetResponseStream());
		strResponse = stIn.ReadToEnd();
		stIn.Close();

		// Confirm whether the IPN was VERIFIED or INVALID. If INVALID, just ignore
        if (strResponse == "VERIFIED" && reqParams["txn_type"] == "web_accept")
        {
            try
            {
                NameValueCollection customParams = new NameValueCollection();
                foreach (string s in reqParams["custom"].Split('&') )
                {
                    string[] keyVal = s.Split('=');
                    if (keyVal.Length == 1)
                    {
                        customParams.Add(keyVal[0], "");
                    }
                    if (keyVal.Length >= 2)
                    {
                        customParams.Add(keyVal[0], keyVal[1]);
                    }
                }

                System.Uri uri = null;
                try
                {
                    uri = new System.Uri(customParams["domain"]);
                }
                catch (System.UriFormatException)
                {
                    uri = new System.Uri("http://" + customParams["domain"]);
                }
                if (uri.Host.Length == 0)
                {
                    throw new System.UriFormatException();
                }
                  
                domain_ = uri.Host;
                userID_ = customParams["userId"];
                productID_ = Convert.ToInt32(reqParams["item_number"]);
                price_ = Convert.ToDouble(reqParams["mc_gross"]);
                payPalTID_ = reqParams["txn_id"];

                ProcessPayment();
            }
            catch (System.Exception)
            {
                Refund(reqParams);
                throw;
            }
        }
	}

	void ValidateByDB()
	{
        string selectUserCmd = "SELECT * FROM aspnet_Users INNER JOIN aspnet_membership ON aspnet_Users.UserId = aspnet_membership.UserId WHERE aspnet_Users.UserId = @UserId";
        string selectProductCmd = "SELECT * FROM sell_items WHERE id = @productId";
        	
        SqlConnection dbConn = new SqlConnection();
		try
		{
            // create Objects of ADOConnection and ADOCommand
            dbConn = new SqlConnection(sqlDSN_);
            dbConn.Open();

		    var dbCmd = dbConn.CreateCommand();
            dbCmd.CommandText = selectUserCmd;
            dbCmd.Parameters.Add(new SqlParameter("@UserId", userID_));
			var userReader = dbCmd.ExecuteReader();
            userReader.Read();
            userEMail_ = (string)userReader["Email"];
            userName_ = (string)userReader["UserName"];
            userReader.Close();
            if (userEMail_.Length == 0 || userName_.Length == 0)
            {
                throw new System.Exception("invalid user");
            }

            dbCmd = dbConn.CreateCommand();
            dbCmd.CommandText = selectProductCmd;
            dbCmd.Parameters.Add(new SqlParameter("@productId", productID_.ToString()));
			var productReader = dbCmd.ExecuteReader();
			productReader.Read();
			productName_ = (string)productReader["name"];
            productDuration_ = (int)productReader["duration"];
            double payPalPrice = (double)productReader["price"];
            productReader.Close();

            if (productName_.Length == 0)
            {
                throw new System.Exception("invalid product");
            }
           
            if (productDuration_ == 0)
            {
                throw new System.Exception("invalid duration");
            }

            if (price_ != payPalPrice)
            {
                throw new System.Exception("invalid price");
            }
		}
		finally
		{
            if (dbConn != null)
			    dbConn.Close();
		}
	}

	void UpdateDBState()
	{
        SqlConnection dbConn = null;
        SqlTransaction tx = null;
        string sqlStatement;
        bool update = false;

		try
		{
            dbConn = new SqlConnection(sqlDSN_);
			dbConn.Open();
            tx = dbConn.BeginTransaction();
        
            /* check existing validation record for domain */
            sqlStatement = String.Format("SELECT * FROM validation WHERE domain = '{0}'", domain_);
            var dbCmd = dbConn.CreateCommand();
            dbCmd.CommandText = sqlStatement;
            dbCmd.Transaction = tx;
            var valReader = dbCmd.ExecuteReader();
            if (valReader.Read())
            {
                validThrough_ = (DateTime)valReader["valid_through"];
                update = true;
            }
            valReader.Close();

            /* insert payment record */
			sqlStatement = String.Format("INSERT INTO purchase (user_id, item_id, domain, paypal_tid, date_time) VALUES ('{0:D}', '{1:D}', '{2}', '{3}', '{4}')",
                userID_,
                productID_,
                domain_,
                payPalTID_,
                DateTime.Now);
            dbCmd = dbConn.CreateCommand();
            dbCmd.CommandText = sqlStatement;
            dbCmd.Transaction = tx;
			dbCmd.ExecuteNonQuery();
                        
            /* insert domain validation record */
            validThrough_ = validThrough_.AddDays(productDuration_);
            if (update)
            {
                sqlStatement = String.Format("UPDATE validation SET valid_through = '{0}' WHERE domain = '{1}'",
                validThrough_, domain_);
            }
            else
            {
                sqlStatement = String.Format("INSERT INTO validation (domain, valid_through) VALUES ('{0}', '{1}')",
                domain_,
                validThrough_);
            }

            dbCmd = dbConn.CreateCommand();
            dbCmd.CommandText = sqlStatement;
            dbCmd.Transaction = tx;
			dbCmd.ExecuteNonQuery();

            tx.Commit();
		}
        catch(System.Exception)
        {
            if (tx != null)
                tx.Rollback();

            throw;
        }
		finally
		{
            if (dbConn != null)
                dbConn.Close();
		}
	}

	void SendInfo()
	{
        var mailer = new System.Net.Mail.SmtpClient("relay-hosting.secureserver.net");

        var oMail = new System.Net.Mail.MailMessage("info@iewebgl.com", userEMail_, "Your IEWebGL purchase",
            String.Format(
            "Dear {0}.\n" +
            "Thank you for purchasing {1}.\n" +
            "\n" +
            "Your license for IEWebGL plugin is valid through {2} for domain {3}." +
            "\n\n" +
            "Additional info:\n" +
            "PAYMENT TRANSACTION ID: {4}" +
            "\n\n" +
            "IEWebGL team.",
            userName_, productName_, validThrough_, domain_, payPalTID_));

        mailer.Send(oMail);
	}

	void ProcessPayment()
	{
        ValidateByDB();
        UpdateDBState();
        SendInfo();
	}
}
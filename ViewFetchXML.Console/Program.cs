using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using System;

namespace ViewFetchXML.Console
{
    public class Program
    {
        [STAThread]
        static void Main()
        {
            var fetchData = new
            {
                name = "ABC",
                industrycode = "3" /* Broadcasting Printing and Publishing */,
                name2 = "DEF",
                industrycode2 = "5" /* Building Supply Retail */,
                donotemail = "1" /* Do Not Allow */
            };
            var fetchXml = $@"
<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>
  <entity name='account'>
    <attribute name='name'/>
    <attribute name='primarycontactid'/>
    <attribute name='telephone1'/>
    <attribute name='accountid'/>
    <order attribute='name' descending='false'/>
    <filter type='and'>
      <condition attribute='name' operator='eq' value='{fetchData.name}'/>
      <condition attribute='industrycode' operator='eq' value='{fetchData.industrycode}'/>
    </filter>
    <link-entity name='account' from='parentaccountid' to='accountid' link-type='inner' alias='aa'>
      <filter type='and'>
        <condition attribute='name' operator='eq' value='{fetchData.name2}'/>
        <condition attribute='industrycode' operator='eq' value='{fetchData.industrycode2}'/>
        <condition attribute='donotemail' operator='eq' value='{fetchData.donotemail}'/>
      </filter>
    </link-entity>
  </entity>
</fetch>
";
            var request = new OrganizationRequest("FetchXMLToSQL");
            request["FetchXml"] = fetchXml;
            var response = AppSettings.Service.Execute(request);
            var t = string.Empty;
        }
    }
}

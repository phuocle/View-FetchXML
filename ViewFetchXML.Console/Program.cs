using System;
using ViewFetchXML.CustomAction.Actions;
using ViewFetchXML.Shared;

namespace ViewFetchXML.Console
{
    public class Program
    {
        [STAThread]
        static void Main()
        {
            DebugConvertFetchXmlToWebAPI();
        }

        private static void DebugConvertFetchXmlToWebAPI()
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
    <link-entity name='account' from='parentaccountid' to='accountid' link-type='inner' alias='ac'>
      <filter type='and'>
        <condition attribute='name' operator='eq' value='{fetchData.name2}'/>
        <condition attribute='industrycode' operator='eq' value='{fetchData.industrycode2}'/>
        <condition attribute='donotemail' operator='eq' value='{fetchData.donotemail}'/>
      </filter>
    </link-entity>
    <link-entity name='account' from='accountid' to='parentaccountid' visible='false' link-type='outer' alias='account'>
      <attribute name='accountnumber'/>
      <attribute name='name'/>
    </link-entity>
  </entity>
</fetch>
";
            var input = new
            {
                FetchXml = fetchXml,
                Url = $"https://org47503bc8.crm5.dynamics.com/api/data/v9.2"
            };
            var json = SimpleJson.SerializeObject(input);
            var output = ConvertFetchXmlToWebAPI.Process(AppSettings.Service, null, null, json);

            /*

                        {"WebApiJs":"https://org47503bc8.crm5.dynamics.com/api/data/v9.2\r\n/accounts?$select=name,_primarycontactid_value,telephone1,accountid&$expand=account_parent_account($filter=(name eq 'DEF' and industrycode eq 5 and donotemail eq true)),parentaccountid($select=accountnumber,name)&$filter=(name eq 'ABC' and industrycode eq 3) and (account_parent_account/any(o1:(o1/name eq 'DEF' and o1/industrycode eq 5 and o1/donotemail eq true)))&$orderby=name asc","WebApiCs":""}




            */
            var t = string.Empty;
        }
    }
}

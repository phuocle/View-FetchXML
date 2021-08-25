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
            //DebugConvertFetchXmlToWebAPI();
            DebugReturnObjectFetchXMLToJs();
        }

        private static void DebugReturnObjectFetchXMLToJs()
        {
            var fetchData = new
            {
                accountid = "{60E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}",
                transactioncurrencyid = "{F89D2C96-C802-EC11-B6E5-000D3AA2EB72}",
                isocurrencycode = "VND",
                contactid = "{74E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}"
            };
            var fetchXml = $@"
<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
  <entity name='account'>
    <attribute name='name'/>
    <attribute name='primarycontactid'/>
    <attribute name='telephone1'/>
    <attribute name='accountid'/>
    <attribute name='industrycode'/>
    <attribute name='statuscode'/>
    <attribute name='statecode'/>
    <attribute name='donotpostalmail'/>
    <attribute name='numberofemployees'/>
    <attribute name='createdon'/>
    <attribute name='accountnumber'/>
    <attribute name='stageid'/>
    <order attribute='name' descending='false'/>
    <filter type='and'>
      <condition attribute='accountid' operator='eq' value='{fetchData.accountid}'/>
    </filter>
    <link-entity name='transactioncurrency' from='transactioncurrencyid' to='transactioncurrencyid' link-type='inner' alias='currency'>
      <attribute name='isocurrencycode'/>
      <filter type='and'>
        <condition attribute='transactioncurrencyid' operator='eq' value='{fetchData.transactioncurrencyid}'/>
        <condition attribute='isocurrencycode' operator='eq' value='{fetchData.isocurrencycode}'/>
      </filter>
    </link-entity>
    <link-entity name='account' from='accountid' to='parentaccountid' visible='false' link-type='outer' alias='account'>
      <attribute name='accountnumber'/>
      <attribute name='name'/>
      <attribute name='createdby'/>
    </link-entity>
    <link-entity name='contact' from='contactid' to='primarycontactid' link-type='inner' alias='contact'>
      <attribute name='lastname'/>
      <attribute name='fullname'/>
      <attribute name='firstname'/>
      <link-entity name='systemuser' from='systemuserid' to='createdby' visible='false' link-type='outer' alias='user'>
        <attribute name='fullname'/>
      </link-entity>
      <filter type='and'>
        <condition attribute='contactid' operator='eq' value='{fetchData.contactid}'/>
      </filter>
    </link-entity>
  </entity>
</fetch>
";
            var input = new
            {
                FetchXml = fetchXml
            };
            var json = SimpleJson.SerializeObject(input);
            var output = ReturnObjectFetchXMLToJs.Process(AppSettings.Service, null, null, json);
            var t = string.Empty;

        }

        private static void DebugConvertFetchXmlToWebAPI()
        {
            var fetchData = new
            {
                accountid = "{60E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}",
                contactid = "{74E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}"
            };
            var fetchXml = $@"
<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
  <entity name='account'>
    <attribute name='name'/>
    <attribute name='primarycontactid'/>
    <attribute name='telephone1'/>
    <attribute name='accountid'/>
    <order attribute='name' descending='false'/>
    <filter type='and'>
      <condition attribute='accountid' operator='eq' value='{fetchData.accountid}'/>
    </filter>
    <link-entity name='account' from='accountid' to='parentaccountid' visible='false' link-type='outer' alias='a_57511732b5534cfbbcf2d280f9f8c6f1'>
      <attribute name='accountnumber'/>
      <attribute name='name'/>
    </link-entity>
    <link-entity name='contact' from='contactid' to='primarycontactid' link-type='inner' alias='ae'>
      <filter type='and'>
        <condition attribute='contactid' operator='eq' value='{fetchData.contactid}'/>
      </filter>
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


            var t = string.Empty;
        }
    }
}

//@ts-check
///<reference path="Account.d.ts" />
"use strict";
var formAccount = (function () {
	"use strict";
	/** @type WebResource.FormAccount */
	var form = null;
	async function onLoad(executionContext) {
		form = new WebResource.FormAccount(executionContext);

        var fetchData = {
            accountid: "{60E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}",
            transactioncurrencyid: "{F89D2C96-C802-EC11-B6E5-000D3AA2EB72}",
            isocurrencycode: "VND",
            contactid: "{74E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}"
        };
        var fetchXml = `
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
      <condition attribute='accountid' operator='eq' value='${fetchData.accountid}'/>
    </filter>
    <link-entity name='transactioncurrency' from='transactioncurrencyid' to='transactioncurrencyid' link-type='inner' alias='am'>
      <attribute name='isocurrencycode'/>
      <filter type='and'>
        <condition attribute='transactioncurrencyid' operator='eq' value='${fetchData.transactioncurrencyid}'/>
        <condition attribute='isocurrencycode' operator='eq' value='${fetchData.isocurrencycode}'/>
      </filter>
    </link-entity>
    <link-entity name='account' from='accountid' to='parentaccountid' visible='false' link-type='outer' alias='a_57511732b5534cfbbcf2d280f9f8c6f1'>
      <attribute name='accountnumber'/>
      <attribute name='name'/>
      <attribute name='createdby'/>
    </link-entity>
    <link-entity name='contact' from='contactid' to='primarycontactid' link-type='inner' alias='ba'>
      <attribute name='lastname'/>
      <attribute name='fullname'/>
      <attribute name='firstname'/>
      <link-entity name='systemuser' from='systemuserid' to='createdby' visible='false' link-type='outer' alias='user'>
        <attribute name='fullname'/>
      </link-entity>
      <filter type='and'>
        <condition attribute='contactid' operator='eq' value='${fetchData.contactid}'/>
      </filter>
    </link-entity>
  </entity>
</fetch>
`;
        fetchXml = "?fetchXml=" + encodeURIComponent(fetchXml);
        var res = await Xrm.WebApi.retrieveMultipleRecords("account", fetchXml);
		debugger;
	}
	async function onSave(executionContext) {
	}
	return {
		OnLoad: onLoad,
		OnSave: onSave
	};
})();
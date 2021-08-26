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
			accountid: `60e1c27f-dd03-ec11-b6e5-000d3aa2e9c5`,
			industrycode: `5` /* Building Supply Retail */,
			transactioncurrencyid: `f89d2c96-c802-ec11-b6e5-000d3aa2eb72`,
			isocurrencycode: `VND` /* VND */,
			contactid: `74e1c27f-dd03-ec11-b6e5-000d3aa2e9c5`,
			parentcustomerid: `60e1c27f-dd03-ec11-b6e5-000d3aa2e9c5`,
			transactioncurrencyid2: `f89d2c96-c802-ec11-b6e5-000d3aa2eb72`
		};
		var options = `?
$select=name,_primarycontactid_value,telephone1,accountid,industrycode,statuscode,statecode,donotpostalmail,numberofemployees,createdon,accountnumber,stageid&
$expand=transactioncurrencyid($select=isocurrencycode),parentaccountid($select=accountnumber,name,_createdby_value),primarycontactid($select=lastname,fullname,firstname)&
$filter=(accountid eq ${fetchData.accountid} or industrycode eq ${fetchData.industrycode}) and (transactioncurrencyid/transactioncurrencyid eq ${fetchData.transactioncurrencyid} and transactioncurrencyid/isocurrencycode eq '${fetchData.isocurrencycode}') and (primarycontactid/contactid eq ${fetchData.contactid} and primarycontactid/_parentcustomerid_value eq ${fetchData.parentcustomerid} and primarycontactid/_transactioncurrencyid_value eq ${fetchData.transactioncurrencyid2})&
$orderby=name asc
`;

        var res = await Xrm.WebApi.retrieveMultipleRecords("account", options);
        debugger;
	}
	async function onSave(executionContext) {
	}
	return {
		OnLoad: onLoad,
		OnSave: onSave
	};
})();
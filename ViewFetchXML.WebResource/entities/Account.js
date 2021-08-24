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
			accountid: "{60E1C27F-DD03-EC11-B6E5-000D3AA2E9C5}"
		};
		var options = `?
$select=name,_primarycontactid_value,telephone1,accountid&$expand=parentaccountid($select=accountnumber,name)&$filter=(accountid eq 60e1c27f-dd03-ec11-b6e5-000d3aa2e9c5)&$orderby=name asc
`;




		var response = await Xrm.WebApi.retrieveMultipleRecords("account", options);
		debugger;
	}
	async function onSave(executionContext) {
	}
	return {
		OnLoad: onLoad,
		OnSave: onSave
	};
})();
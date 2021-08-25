//@ts-check
///<reference path="Account.d.ts" />
"use strict";
var formAccount = (function () {
	"use strict";
	/** @type WebResource.FormAccount */
	var form = null;
	async function onLoad(executionContext) {
		form = new WebResource.FormAccount(executionContext);

		var options = `?
$select=name,_primarycontactid_value,telephone1,accountid&
$expand=
	parentaccountid($select=accountnumber,name),
	transactioncurrencyid($select=isocurrencycode)&
$filter=(accountid eq 60e1c27f-dd03-ec11-b6e5-000d3aa2e9c5) and (primarycontactid/contactid eq 74e1c27f-dd03-ec11-b6e5-000d3aa2e9c5) and (transactioncurrencyid/transactioncurrencyid eq f89d2c96-c802-ec11-b6e5-000d3aa2eb72)&
$orderby=name asc
`;
		debugger;


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
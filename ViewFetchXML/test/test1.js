	var fetchData = {
		directioncode: "1",
		statuscode: "6",
		statuscode2: "7",
		statecode: "1",
		statuscode3: "8",
		statecode2: "0"
	};
	var fetchXml = `
<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
  <entity name='email'>
    <attribute name='to'/>
    <attribute name='subject'/>
    <attribute name='regardingobjectid'/>
    <attribute name='prioritycode'/>
    <attribute name='actualend'/>
    <attribute name='statuscode'/>
    <filter type='and'>
      <condition attribute='ownerid' operator='eq-userid'/>
      <condition attribute='directioncode' operator='eq' value='${fetchData.directioncode}'/>
      <filter type='or'>
        <filter type='and'>
          <condition attribute='statuscode' operator='in'>
            <value>${fetchData.statuscode}</value>
            <value>${fetchData.statuscode2}</value>
          </condition>
          <condition attribute='statecode' operator='eq' value='${fetchData.statecode}'/>
        </filter>
        <filter type='and'>
          <condition attribute='statuscode' operator='eq' value='${fetchData.statuscode3}'/>
          <condition attribute='statecode' operator='eq' value='${fetchData.statecode2}'/>
        </filter>
      </filter>
    </filter>
  </entity>
</fetch>
`;
using MarkMpn.FetchXmlToWebAPI;
using Microsoft.Xrm.Sdk;
using System;
using System.Linq;
using ViewFetchXML.Shared;

namespace ViewFetchXML.CustomAction.Actions
{
    public class InputConvertFetchXmlToWebAPI
    {
        public string Url { get; set; }
        public string FetchXml { get; set; }
    }

    public class OutputConvertFetchXmlToWebAPI
    {
        public string OrderBy { get; set; }
        public string Select { get; set; }
        public string Expand { get; set; }
        public string Filter { get; set; }

        public string FetchData { get; set; }

    }

    public class ConvertFetchXmlToWebAPI
    {
        public static string Process(IOrganizationService serviceAdmin, IOrganizationService service, ITracingService tracing, string json)
        {
            var input = SimpleJson.DeserializeObject<InputConvertFetchXmlToWebAPI>(json);
            var output = new OutputConvertFetchXmlToWebAPI {
                Select = string.Empty,
                Expand = string.Empty,
                Filter = string.Empty,
                OrderBy = string.Empty,
                FetchData = string.Empty
            };
            try
            {
                var converter = new FetchXmlToWebAPIConverter(new MetadataProvider(serviceAdmin), input.Url);
                //output.WebApiJs = converter.ConvertFetchXmlToWebAPI(input.FetchXml);
                var odata = converter.ConvertFetchXmlToWebAPI(input.FetchXml);
                if (odata.Select.Count > 0)
                    output.Select = "$select=" + String.Join(",", odata.Select);
                if (odata.Expand.Count > 0)
                    output.Expand = "$expand=" + String.Join(",", odata.Expand.Select(e => $"{e.PropertyName}({e})"));
                if (odata.Filter.Count > 0)
                    output.Filter = "$filter=" + String.Join(" and ", odata.Filter);
                if (odata.OrderBy.Count > 0)
                    output.OrderBy = "$orderby=" + String.Join(",", odata.OrderBy);

                output.FetchData = SimpleJson.SerializeObject(odata.FetchData);
            }
            catch (NotSupportedException e)
            {

            }
            catch (Exception e2)
            {

            }
            return SimpleJson.SerializeObject(output);
        }
    }
}

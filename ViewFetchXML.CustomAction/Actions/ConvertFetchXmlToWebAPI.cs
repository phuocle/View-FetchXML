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
            var output = new OutputConvertFetchXmlToWebAPI { };
            try
            {
                var converter = new FetchXmlToWebAPIConverter(new MetadataProvider(serviceAdmin), input.Url);
                //output.WebApiJs = converter.ConvertFetchXmlToWebAPI(input.FetchXml);
                var odata = converter.ConvertFetchXmlToWebAPI(input.FetchXml);

                output.Select = "$select=" + String.Join(",", odata.Select);
                output.Expand = "$expand=" + String.Join(",", odata.Expand.Select(e => $"{e.PropertyName}({e})"));
                output.Filter = "$filter=" + String.Join(" and ", odata.Filter);
                output.OrderBy = "$orderby=" + String.Join(",", odata.OrderBy);
                output.FetchData = SimpleJson.SerializeObject(odata.FetchData);

                //var filterString = string.Empty;
                //foreach(var filter in odata.Filter)
                //{
                //    if (filter.Conditions.Count == 0) continue;
                //    foreach(var condition in filter.Conditions)
                //    {
                //        var t = string.Empty;
                //    }
                //}
                //output.Filter = filterString;

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

using MarkMpn.FetchXmlToWebAPI;
using Microsoft.Xrm.Sdk;
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
        public string WebApiJs { get; set; }
        public string WebApiCs { get; set; }
    }

    public class ConvertFetchXmlToWebAPI
    {
        public static string Process(IOrganizationService serviceAdmin, IOrganizationService service, ITracingService tracing, string json)
        {
            var input = SimpleJson.DeserializeObject<InputConvertFetchXmlToWebAPI>(json);
            var output = new OutputConvertFetchXmlToWebAPI { WebApiJs = string.Empty, WebApiCs = string.Empty };
            var converter = new FetchXmlToWebAPIConverter(new MetadataProvider(serviceAdmin), input.Url);
            output.WebApiJs = converter.ConvertFetchXmlToWebAPI(input.FetchXml);
            return SimpleJson.SerializeObject(output);
        }
    }
}

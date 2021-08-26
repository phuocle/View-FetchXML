using MarkMpn.FetchXmlToWebAPI;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Metadata;

namespace ViewFetchXML.CustomAction
{
    public class MetadataProvider : IMetadataProvider
    {
        private IOrganizationService org;

        public MetadataProvider(IOrganizationService org)
        {
            this.org = org;
        }

        public bool IsConnected => true;

        public EntityMetadata GetEntity(string logicalName)
        {
            var resp = (RetrieveEntityResponse)org.Execute(new RetrieveEntityRequest { LogicalName = logicalName, EntityFilters = EntityFilters.Entity | EntityFilters.Attributes | EntityFilters.Relationships });
            return resp.EntityMetadata;
        }
    }
}

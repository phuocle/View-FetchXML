using MarkMpn.FetchXmlToWebAPI;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Metadata;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Xml.Serialization;
using ViewFetchXML.Shared;

namespace ViewFetchXML.CustomAction.Actions
{

    public class InputReturnObjectFetchXMLToJs
    {
        public string FetchXml { get; set; }
    }

    public class OutputReturnObjectFetchXMLToJs
    {
        public List<string> Lines { get; set; }
    }

    public class ReturnObjectFetchXMLToJs
    {
        internal static string Process(IOrganizationService serviceAdmin, IOrganizationService service, ITracingService tracing, string json)
        {
            var output = new OutputReturnObjectFetchXMLToJs { Lines = new List<string>() };
            try
            {
                var input = SimpleJson.DeserializeObject<InputReturnObjectFetchXMLToJs>(json);
                using (var reader = new StringReader(input.FetchXml))
                {
                    var serializer = new XmlSerializer(typeof(FetchType));
                    var fetch = (FetchType)serializer.Deserialize(reader);

                    var entity = fetch.Items.Where(i => i is FetchEntityType).FirstOrDefault() as FetchEntityType;
                    var metadata = new MetadataProvider(serviceAdmin);
                    var entityMeta = metadata.GetEntity(entity.name);

                    if (entity == null)
                    {
                        throw new NotSupportedException("Fetch must contain entity definition");
                    }
                    var attributes = entity.Items
                        .OfType<FetchAttributeType>()
                        .Where(i => i.name != null);

                    output.Lines.Add("'@odata.etag': string");

                    foreach (FetchAttributeType attribute in attributes)
                    {
                        var attrMeta = entityMeta.Attributes.SingleOrDefault(x => x.LogicalName == attribute.name);
                        if (attrMeta == null)
                        {
                            output.Lines.Add($"Unknown attribute {entity.name}.{attribute.name}");
                        }
                        else
                        {
                            AddToOutputLines(output, attrMeta);
                        }
                    }
                    AddToOutputLinesForLink(output, metadata, entity.Items, entity.name);
                }
            }
            catch (NotSupportedException e)
            {
                output.Lines.Add(e.Message);
            }
            catch(Exception e2)
            {
                output.Lines.Add(e2.Message);
            }
            return SimpleJson.SerializeObject(output);
        }

        private static void AddToOutputLinesForLink(OutputReturnObjectFetchXMLToJs output, MetadataProvider metadata, object[] items, string entityName)
        {
            foreach (var linkEntity in items.OfType<FetchLinkEntityType>().Where(l => l.Items != null && l.Items.Any()))
            {
                var currentLinkEntity = linkEntity;
                var propertyName = LinkItemToNavigationProperty(metadata, entityName, currentLinkEntity, out var child, out var manyToManyNextLink);
                currentLinkEntity = manyToManyNextLink ?? currentLinkEntity;
                var linkAttributes = currentLinkEntity.Items
                    .OfType<FetchAttributeType>()
                    .Where(i => i.name != null);
                var linkEntityMeta = metadata.GetEntity(currentLinkEntity.name);

                foreach (FetchAttributeType attribute in linkAttributes)
                {
                    var attrMeta = linkEntityMeta.Attributes.SingleOrDefault(x => x.LogicalName == attribute.name);
                    if (attrMeta == null)
                    {
                        output.Lines.Add($"Unknown attribute {entityName}.{attribute.name}");
                    }
                    else
                    {
                        AddToOutputLines(output, attrMeta, linkEntity.alias);
                    }
                }
                AddToOutputLinesForLink(output, metadata, currentLinkEntity.Items, currentLinkEntity.name);
            }
        }

        private static string LinkItemToNavigationProperty(MetadataProvider metadata, string entityname, FetchLinkEntityType linkitem, out bool child, out FetchLinkEntityType manyToManyNextLink)
        {
            manyToManyNextLink = null;
            var entity = metadata.GetEntity(entityname);
            foreach (var relation in entity.OneToManyRelationships
                .Where(r =>
                    r.ReferencedEntity == entityname &&
                    r.ReferencedAttribute == linkitem.to &&
                    r.ReferencingEntity == linkitem.name &&
                    r.ReferencingAttribute == linkitem.from))
            {
                child = true;
                return relation.ReferencedEntityNavigationPropertyName;
            }
            foreach (var relation in entity.ManyToOneRelationships
                .Where(r =>
                    r.ReferencingEntity == entityname &&
                    r.ReferencingAttribute == linkitem.to &&
                    r.ReferencedEntity == linkitem.name &&
                    r.ReferencedAttribute == linkitem.from))
            {
                child = false;
                return relation.ReferencingEntityNavigationPropertyName;
            }
            foreach (var relation in entity.ManyToManyRelationships
                .Where(r =>
                    r.Entity1LogicalName == entityname &&
                    r.Entity1IntersectAttribute == linkitem.from))
            {
                var linkitems = linkitem.Items.Where(i => i is FetchLinkEntityType).ToList();
                if (linkitems.Count > 1)
                {
                    throw new NotSupportedException("Invalid M:M-relation definition for OData");
                }
                if (linkitems.Count == 1)
                {
                    var nextlink = (FetchLinkEntityType)linkitems[0];
                    if (relation.Entity2LogicalName == nextlink.name &&
                        relation.Entity2IntersectAttribute == nextlink.to)
                    {
                        child = true;
                        manyToManyNextLink = nextlink;
                        return relation.Entity1NavigationPropertyName;
                    }
                }
            }
            foreach (var relation in entity.ManyToManyRelationships
                .Where(r =>
                    r.Entity2LogicalName == entityname &&
                    r.Entity2IntersectAttribute == linkitem.from))
            {
                var linkitems = linkitem.Items.Where(i => i is FetchLinkEntityType).ToList();
                if (linkitems.Count > 1)
                {
                    throw new NotSupportedException("Invalid M:M-relation definition for OData");
                }
                if (linkitems.Count == 1)
                {
                    var nextlink = (FetchLinkEntityType)linkitems[0];
                    if (relation.Entity1LogicalName == nextlink.name &&
                        relation.Entity1IntersectAttribute == nextlink.from)
                    {
                        child = true;
                        manyToManyNextLink = nextlink;
                        return relation.Entity2NavigationPropertyName;
                    }
                }
            }
            throw new NotSupportedException($"Cannot find metadata for relation {entityname}.{linkitem.to} => {linkitem.name}.{linkitem.from}");
        }

        private static void AddToOutputLines(OutputReturnObjectFetchXMLToJs output, AttributeMetadata attrMeta, string alias = "")
        {
            if (alias != "") alias += ".";
            if (attrMeta is LookupAttributeMetadata)
            {
                output.Lines.Add($"'{alias}_{attrMeta.LogicalName}_value': guid");
                output.Lines.Add($"'{alias}_{attrMeta.LogicalName}_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string");
                output.Lines.Add($"'{alias}_{attrMeta.LogicalName}_value@Microsoft.Dynamics.CRM.lookuplogicalname': string");
                output.Lines.Add($"'{alias}_{attrMeta.LogicalName}_value@OData.Community.Display.V1.FormattedValue': string");
            }
            else if (
                attrMeta is BooleanAttributeMetadata ||
                attrMeta is EnumAttributeMetadata ||
                attrMeta is DateTimeAttributeMetadata ||
                attrMeta is DecimalAttributeMetadata ||
                attrMeta is DoubleAttributeMetadata ||
                attrMeta is IntegerAttributeMetadata ||
                attrMeta is BigIntAttributeMetadata ||
                attrMeta is MoneyAttributeMetadata
                )
            {
                if (attrMeta is BooleanAttributeMetadata)
                {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}' : bool");
                }
                else if (attrMeta is EnumAttributeMetadata ||
                    attrMeta is IntegerAttributeMetadata ||
                    attrMeta is BigIntAttributeMetadata ||
                    attrMeta is DoubleAttributeMetadata ||
                    attrMeta is DecimalAttributeMetadata)
                {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}' : number");
                }
                else if (attrMeta is DateTimeAttributeMetadata)
                {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}' : string");
                }
                else
                {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}' : string");
                }
                output.Lines.Add($"'{alias}{attrMeta.LogicalName}@OData.Community.Display.V1.FormattedValue': string");
            }
            else if (attrMeta is UniqueIdentifierAttributeMetadata)
            {
                output.Lines.Add($"'{alias}{attrMeta.LogicalName}': guid");
            }
            else
            {
                if (attrMeta.AttributeType == AttributeTypeCode.Uniqueidentifier)
                {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}': guid");
                }
                else {
                    output.Lines.Add($"'{alias}{attrMeta.LogicalName}': string");
                }
            }
        }
    }
}

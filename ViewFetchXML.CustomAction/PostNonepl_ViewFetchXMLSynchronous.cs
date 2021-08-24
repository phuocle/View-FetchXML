using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using ViewFetchXML.CustomAction.Actions;
using ViewFetchXML.Shared;

namespace ViewFetchXML.CustomAction
{
    [CrmPluginRegistration("pl_ViewFetchXML", "none", StageEnum.PostOperation, ExecutionModeEnum.Synchronous, "",
    "ViewFetchXML.CustomAction.PostNonepl_ViewFetchXMLSynchronous", 1/*ExecutionOrder*/, IsolationModeEnum.Sandbox, PluginType = PluginType.CustomAction)]
    public class PostNonepl_ViewFetchXMLSynchronous : IPlugin
    {
        /*
          InputParameters:
              function    System.String - require
              input       System.String
           OutputParameters:
              output      System.String - require
        */

        //private readonly string unSecureConfiguration = null;
        //private readonly string secureConfiguration = null;

        //public PostNonepl_ViewFetchXMLSynchronous(string unSecureConfiguration, string secureConfiguration)
        //{
        //    this.unSecureConfiguration = unSecureConfiguration;
        //    this.secureConfiguration = secureConfiguration;
        //}

        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var serviceAdmin = serviceFactory.CreateOrganizationService(null);
            var service = serviceFactory.CreateOrganizationService(context.InitiatingUserId);
            var tracing = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            if (context.Stage != (int)StageEnum.PostOperation) throw new InvalidPluginExecutionException("Stage does not equals PostOperation");
            if (context.PrimaryEntityName.ToLower() != "none".ToLower()) throw new InvalidPluginExecutionException("PrimaryEntityName does not equals none");
            if (context.MessageName.ToLower() != "pl_ViewFetchXML".ToLower()) throw new InvalidPluginExecutionException("MessageName does not equals pl_ViewFetchXML");
            if (context.Mode != (int)ExecutionModeEnum.Synchronous) throw new InvalidPluginExecutionException("Execution does not equals Synchronous");

            //tracing.DebugMessage("Begin Custom Action: ViewFetchXML.CustomAction.PostNonepl_ViewFetchXMLSynchronous");
            //tracing.DebugContext(context);

            var outputs = ExecuteCustomAction(context, serviceFactory, serviceAdmin, service, tracing);

            foreach (var output in outputs)
                if (context.OutputParameters.Contains(output.Key))
                    context.OutputParameters[output.Key] = output.Value;

            //tracing.DebugMessage("End Custom Action: ViewFetchXML.CustomAction.PostNonepl_ViewFetchXMLSynchronous");
        }

        private ParameterCollection ExecuteCustomAction(IPluginExecutionContext context, IOrganizationServiceFactory serviceFactory, IOrganizationService serviceAdmin, IOrganizationService service, ITracingService tracing)
        {
            var outputs = new ParameterCollection();
            //YOUR CUSTOM ACTION BEGIN HERE
            var function = (string)context.InputParameters?["function"];
            var input = (string)context.InputParameters?["input"];
            var output = string.Empty;
            switch (function)
            {
                case "ConvertFetchXmlToWebApi":
                    output = ConvertFetchXmlToWebAPI.Process(serviceAdmin, service, tracing, input);
                    break;
                default:
                    output = string.Empty;
                    break;
            }
            outputs.Add(new KeyValuePair<string, object>("output", output));
            return outputs;
        }
    }
}

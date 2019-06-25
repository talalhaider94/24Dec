using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Quantis.WorkFlow.APIBase.API;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.APIBase.Mappers;
using Quantis.WorkFlow.APIBase.Mappers.Information;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Models.Information;
using Quantis.WorkFlow.Models.SDM;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase
{
    public static class BaseAPIRegistry
    {
        public static void RegisterServices(IServiceCollection services)
        {
            RegisterAPIServices(services);
            RegisterMappers(services);
        }

        private static void RegisterAPIServices(IServiceCollection services)
        {
            services.AddTransient<ISampleAPI, SampleAPI>();
            services.AddTransient<IDataService, DataService>();
            services.AddTransient<IServiceDeskManagerService, ServiceDeskManagerService>();
            services.AddTransient<IOracleDataService, OracleDataService>();
            services.AddTransient<ISMTPService, SMTPService>();
            services.AddTransient<IInformationService, InformationService>();
        }
        public static void RegisterMappers(IServiceCollection services)
        {
            services.AddTransient<IMappingService<GroupDTO, T_Group>, GroupMapper>();
            services.AddTransient<IMappingService<UserDTO, T_CatalogUser>, UserMapper>();
            services.AddTransient<IMappingService<PageDTO, T_Page>, PageMapper>();
            services.AddTransient<IMappingService<WidgetDTO, T_Widget>, WidgetMapper>();
            services.AddTransient<IMappingService<FormRuleDTO, T_FormRule>, FormRuleMapper>();
            services.AddTransient<IMappingService<FormAttachmentDTO, T_FormAttachment>, FormAttachmentMapper>();
            services.AddTransient<IMappingService<CatalogKpiDTO, T_CatalogKPI>, CatalogKpiMapper>();            
            services.AddTransient<IMappingService<ApiDetailsDTO, T_APIDetail>, ApiMapper>();
            services.AddTransient<IMappingService<ConfigurationDTO, T_Configuration>, ConfigurationMapper>();
            services.AddTransient<IMappingService<SDMStatusDTO, SDM_TicketStatus>, SDMStatusMapper>();
            services.AddTransient<IMappingService<SDMGroupDTO, SDM_TicketGroup>, SDMGroupMapper>();
        }
    }
}

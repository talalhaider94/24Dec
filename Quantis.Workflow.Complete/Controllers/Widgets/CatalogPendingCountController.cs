using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    public class CatalogPendingCountController : BaseWidgetController
    {
        private IGlobalFilterService _globalfilterService;
        private IWidgetService _widgetService;
        public CatalogPendingCountController(IGlobalFilterService globalfilterService, IWidgetService widgetService)
        {
            _globalfilterService = globalfilterService;
            _widgetService = widgetService;
        }

        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var result = _widgetService.GetCatalogPendingCount();
            return result;
        }
    }
}
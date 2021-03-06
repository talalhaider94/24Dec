﻿using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    public class DistributionByVerificaController : BaseWidgetController
    {
        private IGlobalFilterService _globalfilterService;
        private IWidgetService _widgetService;

        public DistributionByVerificaController(IGlobalFilterService globalfilterService, IWidgetService widgetService)
        {
            _globalfilterService = globalfilterService;
            _widgetService = widgetService;
        }

        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            vm.DefaultDateRange = _globalfilterService.GetDefualtDateRange();
            vm.ShowDateRangeFilter = true;
            vm.ShowDateType = true;
            vm.ShowPropertyTab = false;
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var dto = _globalfilterService.MapBaseWidget(props);
            var result = _widgetService.GetDistributionByVerifica(dto);
            return result;
        }
    }
}
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
    public class KPICountSummaryController : BaseWidgetController
    {
        private IGlobalFilterService _globalfilterService;
        private IWidgetService _widgetService;
        public KPICountSummaryController(IGlobalFilterService globalfilterService, IWidgetService widgetService)
        {
            _globalfilterService = globalfilterService;
            _widgetService = widgetService;
        }
        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            vm.DefaultDateRange = _globalfilterService.GetDefualtDateRange();
            vm.ShowMeasure = true;
            vm.ShowDateType = true;
            vm.ShowDateFilter = true;
            vm.AddMeasure(Measures.Number_of_ticket_in_KPI_in_Verifica);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Compliant);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Non_Calcolato);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Non_Compliant);
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var dto = _globalfilterService.MapBaseWidget(props);
            var result = _widgetService.GetKPICountSummary(dto);
            return result;
        }
    }
}
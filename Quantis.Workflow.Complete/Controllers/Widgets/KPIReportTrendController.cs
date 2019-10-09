using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    public class KPIReportTrendController : BaseWidgetController
    {
        private IGlobalFilterService _globalfilterService;
        private IWidgetService _widgetService;
        public KPIReportTrendController(IGlobalFilterService globalfilterService, IWidgetService widgetService)
        {
            _globalfilterService = globalfilterService;
            _widgetService = widgetService;
        }
        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            vm.DefaultDateRange = _globalfilterService.GetDefualtDateRange();
            vm.ShowChartType = true;
            vm.ShowDateType = true;
            vm.ShowDateRangeFilter = true;
            vm.ShowLevelWiseOrganization = true;
            vm.ShowOrganization = false;
            vm.ChartTypes.Add(ChartType.BAR);
            vm.ChartTypes.Add(ChartType.LINE);
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var dto = _globalfilterService.MapBaseWidget(props);
            var result = _widgetService.GetKPIReportTrend(dto);
            return result;
        }
    }
}

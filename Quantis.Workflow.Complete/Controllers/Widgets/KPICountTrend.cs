using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    public class KPICountTrend : BaseWidgetController
    {
        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            vm.ShowMeasure = true;
            vm.ShowChartType = true;
            vm.ShowAggregationOption = true;
            vm.ShowDateRangeFilter = true;
            vm.AddMeasure(Measures.Number_of_ticket_in_KPI_in_Verifica);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Compliant);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Non_Calcolato);
            vm.AddMeasure(Measures.Number_of_ticket_of_KPI_Non_Compliant);
            vm.ChartTypes.Add(ChartType.BAR);
            vm.ChartTypes.Add(ChartType.LINE);
            vm.AggregationOptions.Add(AggregationOption.ANNAUL);
            vm.AggregationOptions.Add(AggregationOption.PERIOD);
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var list = new List<XYDTO>();
            list.Add(new XYDTO() { XValue = "03/19", YValue = 10 });
            list.Add(new XYDTO() { XValue = "04/19", YValue = 11 });
            list.Add(new XYDTO() { XValue = "05/19", YValue = 12 });
            list.Add(new XYDTO() { XValue = "06/19", YValue = 11 });
            list.Add(new XYDTO() { XValue = "07/19", YValue = 14 });
            return list;
        }
    }
}

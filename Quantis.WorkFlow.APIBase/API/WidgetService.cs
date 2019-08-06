using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class WidgetService : IWidgetService
    {
        public List<XYDTO> GetKPICountTrend(WidgetwithAggOptionDTO dto)
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

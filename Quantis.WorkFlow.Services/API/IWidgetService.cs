using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IWidgetService
    {
        List<XYDTO> GetKPICountTrend(WidgetwithAggOptionDTO dto);
        
    }
}

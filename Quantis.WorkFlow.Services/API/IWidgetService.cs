using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IWidgetService
    {
        List<XYDTO> GetKPICountTrend(WidgetwithAggOptionDTO dto);
        XYDTO GetCatalogPendingCount();
        List<XYDTO> GetDistributionByVerifica(BaseWidgetDTO dto);
        List<XYDTO> GetKPICountByOrganization(WidgetwithAggOptionDTO dto);
        XYDTO GetKPICountSummary(BaseWidgetDTO dto);
        List<XYDTO> GetNotificationTrend(WidgetwithAggOptionDTO dto);
        List<XYZDTO> GetKPIReportTrend(BaseWidgetDTO dto);


    }
}

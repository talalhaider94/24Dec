using Quantis.WorkFlow.Services.DTOs.Dashboard;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IDashboardService
    {
        List<DashboardDTO> GetDashboards();
        void AddUpdateDasboard(DashboardDetailDTO dto);
        List<WidgetDTO> GetAllWidgets();
        DashboardDetailDTO GetDashboardWigetsByDashboardId(int id);
    }
}

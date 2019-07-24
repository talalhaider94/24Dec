using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Dashboard
{
    public class DashboardDetailDTO: BaseIdNameDTO
    {
        public List<DashboardWidgetDTO> DashboardWidgets { get; set; }
    }
}

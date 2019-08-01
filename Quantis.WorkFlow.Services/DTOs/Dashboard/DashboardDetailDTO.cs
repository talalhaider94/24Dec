using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Dashboard
{
    public class DashboardDetailDTO: BaseIdNameDTO
    {
        public int GlobalFilterId { get; set; }
        public List<DashboardWidgetDTO> DashboardWidgets { get; set; }
    }
}

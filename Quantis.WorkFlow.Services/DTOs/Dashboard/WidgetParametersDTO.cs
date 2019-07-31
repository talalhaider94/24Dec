using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Dashboard
{
    public class WidgetParametersDTO
    {
        public int GlobalFilterId { get; set; }
        public List<DashboardWidgetPropertyDTO> Properties { get; set; }
        public List<DashboardWidgetFilterDTO> Filters { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Dashboard
{
    public class DashboardWidgetDTO
    {
        public int Id { get; set; }
        public int WidgetId { get; set; }
        public int DashboardId { get; set; }
        public int SizeX { get; set; }
        public int SizeY { get; set; }
        public int LocationX { get; set; }
        public int LocationY { get; set; }
        public string WidgetName { get; set; }
        public int GlobalFilterId { get; set; }
        public List<DashboardWidgetPropertyDTO> Properties { get; set; }
        public List<DashboardWidgetFilterDTO> Filters { get; set; }
    }
}

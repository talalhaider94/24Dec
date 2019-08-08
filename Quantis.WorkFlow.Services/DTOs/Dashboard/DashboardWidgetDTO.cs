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
        public string UIIdentifier { get; set; }
        public Dictionary<string,string> Properties { get; set; }
        public Dictionary<string,string> Filters { get; set; }
    }
}

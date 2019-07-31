using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Widgets
{
    public class WidgetViewModel
    {
        public bool ShowMeasure { get; set; }
        public bool ShowChartType { get; set; }
        public bool ShowAggregationOption { get; set; }
        public bool ShowDateRangeFilter { get; set; }

        public Dictionary<int,string> Measures { get; set; }
        public Dictionary<string,string> ChartTypes { get; set; }
        public Dictionary<string,string> AggregationOptions { get; set; }

        public WidgetViewModel()
        {
            ShowAggregationOption = false;
            ShowChartType = false;
            ShowDateRangeFilter = false;
            ShowMeasure = false;

            Measures = new Dictionary<int, string>();
            ChartTypes = new Dictionary<string, string>();
            AggregationOptions = new Dictionary<string, string>();
        }

        public void AddMeasure(Measures m)
        {
            Measures.Add((int)m, GetDescription(m));

        }
        private static string GetDescription(Enum value)
        {
            return
                value
                    .GetType()
                    .GetMember(value.ToString())
                    .FirstOrDefault()
                    ?.GetCustomAttribute<DescriptionAttribute>()
                    ?.Description
                ?? value.ToString();
        }
    }
}

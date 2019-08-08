using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class GlobalFilterService: IGlobalFilterService
    {
        private string defaultDateRange = "03/19:07/19";
        public BaseWidgetDTO MapBaseWidget(WidgetParametersDTO props)
        {
            var dto = new BaseWidgetDTO();
            if (props.Filters.ContainsKey("daterange"))
            {
                var daterange = props.Filters["daterange"];
                var range = daterange.Split(':');
                dto.DateRange = new Tuple<DateTime, DateTime>(DateTime.ParseExact(range[0], "MM/yy", CultureInfo.InvariantCulture), DateTime.ParseExact(range[1], "MM/yy", CultureInfo.InvariantCulture));
            }
            else
            {
                var daterange = defaultDateRange;
                var range = daterange.Split(':');
                dto.DateRange = new Tuple<DateTime, DateTime>(DateTime.ParseExact(range[0], "MM/yy", CultureInfo.InvariantCulture), DateTime.ParseExact(range[1], "MM/yy", CultureInfo.InvariantCulture));
            }
            if (props.Filters.ContainsKey("measures"))
            {
                dto.Measures = new List<Measures>() { (Measures)Int32.Parse(props.Filters["measures"]) };
            }
            else
            {
                dto.Measures = new List<Measures>();
            }
            dto.KPIs = new List<int>();
            return dto;
        }
        public WidgetwithAggOptionDTO MapAggOptionWidget(WidgetParametersDTO props)
        {
            var map = MapBaseWidget(props);
            var dto = new WidgetwithAggOptionDTO()
            {
                DateRange=map.DateRange,
                KPIs=map.KPIs,
                Measures=map.Measures,
            };
            if (props.Filters.ContainsKey("aggregationoption"))
            {
                dto.AggregationOption = props.Filters["aggregationoption"];                
            }
            else
            {
                dto.AggregationOption = "";
            }
            return dto;
        }

    }
}

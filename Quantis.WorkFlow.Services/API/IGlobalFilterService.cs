using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IGlobalFilterService
    {
        BaseWidgetDTO MapBaseWidget(WidgetParametersDTO props);
        WidgetwithAggOptionDTO MapAggOptionWidget(WidgetParametersDTO props);
    }
}

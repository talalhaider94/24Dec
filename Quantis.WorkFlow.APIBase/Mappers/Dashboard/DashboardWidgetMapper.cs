using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.Mappers.Dashboard
{

    public class DashboardWidgetMapper : MappingService<DashboardWidgetDTO, DB_DashboardWidget>
    {
        public override DashboardWidgetDTO GetDTO(DB_DashboardWidget e)
        {
            var dto = new DashboardWidgetDTO()
            {
                DashboardId = e.DashboardId,
                Id = e.Id,
                LocationX = e.LocationX,
                LocationY = e.LocationY,
                SizeX = e.SizeX,
                SizeY = e.SizeY,
                WidgetId = e.WidgetId,
                WidgetName = e.WidgetName ?? e.Widget.Name,
                UIIdentifier=e.Widget.UIIdentifier
                
            };
            dto.Properties = new Dictionary<string, string>();
            dto.Filters= new Dictionary<string, string>();
            foreach(var val in e.DashboardWidgetSettings)
            {
                if (val.SettingType == 0)
                {
                    dto.Properties.Add(val.SettingKey, val.SettingValue);
                }
                else
                {
                    dto.Filters.Add(val.SettingKey, val.SettingValue);
                }
            }           
            return dto;
            
        }

        public override DB_DashboardWidget GetEntity(DashboardWidgetDTO o, DB_DashboardWidget e)
        {            
            e.LocationX = o.LocationX;
            e.LocationY = o.LocationY;
            e.SizeX = o.SizeX;
            e.SizeY = o.SizeY;
            e.WidgetName = o.WidgetName;
            if (e.Id == 0)
            {
                e.WidgetId = o.WidgetId;
                e.DashboardId = e.DashboardId;
            }
            foreach (var p in o.Properties)
            {
                var prop = e.DashboardWidgetSettings.FirstOrDefault(r => r.SettingType == 0 && r.SettingKey == p.Key);
                if (prop != null)
                {
                    prop.SettingValue = p.Value;
                }
                else
                {
                    e.DashboardWidgetSettings.Add(new DB_DashboardWidgetSetting()
                    {
                        SettingKey = p.Key,
                        SettingType = 0,
                        SettingValue = p.Value
                    });
                }
            }
            foreach (var p in o.Filters)
            {
                var prop = e.DashboardWidgetSettings.FirstOrDefault(r => r.SettingType == 1 && r.SettingKey == p.Key);
                if (prop != null)
                {
                    prop.SettingValue = p.Value;
                }
                else
                {
                    e.DashboardWidgetSettings.Add(new DB_DashboardWidgetSetting()
                    {
                        SettingKey = p.Key,
                        SettingType = 1,
                        SettingValue = p.Value
                    });
                }
            }
            return e;
        }
    }
}

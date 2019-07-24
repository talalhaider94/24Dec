using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models.Dashboard;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class DashboardService : IDashboardService
    {
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private readonly IMappingService<DashboardDTO, DB_Dashboard> _dashboardMapper;
        private readonly IMappingService<Services.DTOs.Dashboard.WidgetDTO, DB_Widget> _widgetMapper;
        private readonly IMappingService<DashboardWidgetDTO, DB_DashboardWidget> _dashboardWidgetMapper;
        public DashboardService(WorkFlowPostgreSqlContext dbcontext,
            IMappingService<DashboardDTO, DB_Dashboard> dashboardMapper,
            IMappingService<Services.DTOs.Dashboard.WidgetDTO, DB_Widget> widgetMapper,
            IMappingService<DashboardWidgetDTO, DB_DashboardWidget> dashboardWidgetMapper
            )
        {
            _dbcontext = dbcontext;
            _dashboardMapper = dashboardMapper;
            _widgetMapper = widgetMapper;
            _dashboardWidgetMapper = dashboardWidgetMapper;
        }

        public List<DashboardDTO> GetDashboards()
        {
            try
            {
                var entities=_dbcontext.DB_Dashboards.ToList();
                return _dashboardMapper.GetDTOs(entities);
            }
            catch(Exception e)
            {
                throw e;
            }
        }


    }
}

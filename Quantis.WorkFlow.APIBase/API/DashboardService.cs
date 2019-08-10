using Microsoft.EntityFrameworkCore;
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
                var entities=_dbcontext.DB_Dashboards.Include(o=>o.User).ToList();
                return _dashboardMapper.GetDTOs(entities);
            }
            catch(Exception e)
            {
                throw e;
            }
        }
        public int AddUpdateDasboard(DashboardDetailDTO dto)
        {
            try
            {
                if (dto.Id == 0)
                {
                    List<DB_DashboardWidget> dbwidgets = new List<DB_DashboardWidget>();
                    foreach(var dbw in dto.DashboardWidgets)
                    {
                        var ent = new DB_DashboardWidget();
                        ent=_dashboardWidgetMapper.GetEntity(dbw, ent);
                        dbwidgets.Add(ent);
                    }
                    DB_Dashboard entdb = new DB_Dashboard();
                    entdb.Name = dto.Name;
                    entdb.GlobalFilterId = dto.GlobalFilterId;
                    entdb.DashboardWidgets = dbwidgets;
                    _dbcontext.DB_Dashboards.Add(entdb);
                    _dbcontext.SaveChanges();
                    return entdb.Id;
                }
                else
                {
                    var dashboardWidgetIds = dto.DashboardWidgets.Where(o => o.Id != 0).Select(o => o.Id).ToList();
                    var deletewidgets = _dbcontext.DB_DashboardWidgets.Where(o => o.DashboardId == dto.Id && !dashboardWidgetIds.Contains(o.Id)).ToArray();
                    if (deletewidgets.Any())
                    {
                        _dbcontext.DB_DashboardWidgets.RemoveRange(deletewidgets);
                    }

                    var newwidgets = dto.DashboardWidgets.Where(o => o.Id == 0).ToList();
                    List<DB_DashboardWidget> dbwidgets = new List<DB_DashboardWidget>();
                    foreach (var dbw in newwidgets)
                    {
                        var ent = new DB_DashboardWidget();
                        ent = _dashboardWidgetMapper.GetEntity(dbw, ent);
                        ent.DashboardId = dto.Id;
                        dbwidgets.Add(ent);
                    }
                    _dbcontext.DB_DashboardWidgets.AddRange(dbwidgets.ToArray());
                    _dbcontext.SaveChanges();

                    var oldwidgets = dto.DashboardWidgets.Where(o => o.Id != 0).ToList();
                    foreach (var dbw in oldwidgets)
                    {
                        var ent = _dbcontext.DB_DashboardWidgets.Single(o => o.Id == dbw.Id);
                        ent = _dashboardWidgetMapper.GetEntity(dbw, ent);
                    }
                    var dashboard=_dbcontext.DB_Dashboards.Single(o => o.Id == dto.Id);
                    dashboard.GlobalFilterId = dto.GlobalFilterId;
                    _dbcontext.SaveChanges();
                    return dto.Id;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<WidgetDTO> GetAllWidgets()
        {
            try
            {
                var entities = _dbcontext.DB_Widgets.ToList();
                return _widgetMapper.GetDTOs(entities);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public DashboardDetailDTO GetDashboardWigetsByDashboardId(int id)
        {
            try
            {
                var db = _dbcontext.DB_Dashboards.Single(o => o.Id == id);
                var entities = _dbcontext.DB_DashboardWidgets.Include(o => o.Widget).Include(o=>o.DashboardWidgetSettings).Where(o => o.DashboardId == id);
                var widgets= _dashboardWidgetMapper.GetDTOs(entities.ToList());
                return new DashboardDetailDTO()
                {
                    Id = db.Id,
                    Name = db.Name,
                    GlobalFilterId = db.GlobalFilterId,
                    DashboardWidgets = widgets
                };

            }
            catch (Exception e)
            {
                throw e;
            }
        }



    }
}

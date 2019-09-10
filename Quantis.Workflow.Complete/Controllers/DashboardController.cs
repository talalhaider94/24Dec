using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.Framework;

namespace Quantis.Workflow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class DashboardController : ControllerBase
    {
        private IDashboardService _dashboardAPI { get; set; }

        public DashboardController(IDashboardService dashboardAPI)
        {
            _dashboardAPI = dashboardAPI;
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetDashboards")]
        public List<DashboardDTO> GetDashboards()
        {
            var user = HttpContext.User as AuthUser;
            return _dashboardAPI.GetDashboards(user.UserId);
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("SetDefaultDashboard")]
        public void SetDefaultDashboard(int id)
        {
            var user = HttpContext.User as AuthUser;
            _dashboardAPI.SetDefaultDashboard(id, user.UserId);
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetDefaultDashboardId")]
        public int GetDefaultDashboardId()
        {
            var user = HttpContext.User as AuthUser;
            return _dashboardAPI.GetDefaultDashboardId(user.UserId);
        }
        [HttpPost("AddUpdateDasboard")]
        public DashboardDetailDTO AddUpdateDasboard([FromBody]DashboardDetailDTO dto)
        {
            var user = HttpContext.User as AuthUser;
            var id = _dashboardAPI.AddUpdateDasboard(dto,user.UserId);
            return _dashboardAPI.GetDashboardWigetsByDashboardId(id);

        }
        [HttpGet("GetAllWidgets")]
        public List<WidgetDTO> GetAllWidgets()
        {
            return _dashboardAPI.GetAllWidgets();
        }
        [HttpGet("GetDashboardWigetsByDashboardId")]
        public DashboardDetailDTO GetDashboardWigetsByDashboardId(int id)
        {
            return _dashboardAPI.GetDashboardWigetsByDashboardId(id);
        }
        [HttpPost("SaveDashboardState")]
        public void SaveDashboardState([FromBody]List<DashboardWidgetBaseDTO> dtos)
        {
            _dashboardAPI.SaveDashboardState(dtos);
        }
        [HttpGet("ActivateDashboard")]
        public void ActivateDashboard(int id)
        {
            _dashboardAPI.ActivateDashboard(id);
        }
        [HttpGet("DeactivateDashboard")]
        public void DeactivateDashboard(int id)
        {
            _dashboardAPI.DeactivateDashboard(id);
        }


    }
}
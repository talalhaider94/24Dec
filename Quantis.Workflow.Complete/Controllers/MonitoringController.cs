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
using Quantis.WorkFlow.Services.DTOs.Monitoring;

namespace Quantis.Workflow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class MonitoringController : ControllerBase
    {
        private readonly IMonitoringService _monitoringAPI;

        public MonitoringController(IMonitoringService monitoringAPI)
        {
            _monitoringAPI = monitoringAPI;
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_MONITORING_ORG)]
        [HttpGet("GetTicketsMonitoringByPeriod")]
        public List<MonitoringDTO> GetTicketsMonitoringByPeriod(string period)
        {
            return _monitoringAPI.GetTicketsMonitoringByPeriod(period);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_MONITORING_DAY)]
        [HttpGet("GetDayLevelTicketsMonitoring")]
        public List<MonitoringDayLevelDTO> GetDayLevelTicketsMonitoring()
        {
            return _monitoringAPI.GetDayLevelTicketsMonitoring();
        }
    }
}
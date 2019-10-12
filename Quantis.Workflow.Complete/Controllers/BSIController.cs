using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.BSI;
using Quantis.WorkFlow.Services.Framework;
using System.Collections.Generic;

namespace Quantis.Workflow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class BSIController : ControllerBase
    {
        private IBSIService _bsiAPI { get; set; }

        public BSIController(IBSIService bsiAPI)
        {
            _bsiAPI = bsiAPI;
        }

        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetMyNormalReports")]
        public List<BSIReportLVDTO> GetMyNormalReports()
        {
            var user = HttpContext.User as AuthUser;
            return _bsiAPI.GetMyNormalReports(user.UserName);
        }

        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetAllNormalReports")]
        public List<BSIReportLVDTO> GetAllNormalReports()
        {
            var user = HttpContext.User as AuthUser;
            return _bsiAPI.GetAllNormalReports(user.UserName);
        }

        //[Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetReportDetail")]
        public BSIReportMainDTO GetReportDetail(int reportId)
        {
            //var user = HttpContext.User as AuthUser;
            return _bsiAPI.GetReportDetail("sadmin", reportId);
        }
        [HttpGet("GetAllUserReports")]
        public List<BSIUserFolderDTO> GetAllUserReports()
        {
            return _bsiAPI.GetAllUserReports();
        }
    }
}
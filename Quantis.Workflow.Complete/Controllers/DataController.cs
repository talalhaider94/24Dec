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
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.Framework;

namespace Quantis.WorkFlow.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class DataController : ControllerBase
    {
        private IDataService _dataAPI { get; set; }
        public DataController(IDataService dataAPI)
        {
            _dataAPI = dataAPI;
        }
        [HttpGet("CronJobsScheduler")]
        public bool CronJobsScheduler()
        {
            return _dataAPI.CronJobsScheduler();
        }
        [HttpGet("GetAllWidgets")]
        public List<WidgetDTO> GetAllWidgets()
        {
            return _dataAPI.GetAllWidgets();
        }

        [HttpGet("RemoveAttachment/{id}")]
        public bool RemoveAttachment(int id)
        {
            return _dataAPI.RemoveAttachment(id);
        }
        [HttpGet("GetEmailHistory")]
        public List<NotifierLogDTO> GetEmailHistory()
        {
            return _dataAPI.GetEmailHistory();
        }
        [HttpGet("GetWidgetById/{id}")]
        public WidgetDTO GetWidgetById(int id)
        {
            return _dataAPI.GetWidgetById(id);
        }
        [HttpPost("AddUpdateWidget")]
        public bool AddUpdateWidget([FromBody]WidgetDTO dto)
        {
            return _dataAPI.AddUpdateWidget(dto);
        }
        [HttpPost("GetAllPagedUsers")]
        public PagedList<UserDTO> GetAllPagedUsers([FromBody]UserFilterDTO filter)
        {
            return _dataAPI.GetAllPagedUsers(filter);
        }
        [HttpGet("GetAllUsers")]
        public List<UserDTO> GetAllUsers()
        {
            return _dataAPI.GetAllUsers();
        }
        [HttpGet("GetUsersByRoleId")]
        public List<UserDTO> GetUsersByRoleId(int roleId)
        {
            return _dataAPI.GetUsersByRoleId(roleId);
        }
        [HttpGet("GetUserById")]
        public UserDTO GetUserById(string UserId)
        {
            return _dataAPI.GetUserById(UserId);
        }
        [HttpPost("AddUpdateUser")]
        public bool AddUpdateUser([FromBody]UserDTO dto)
        {
            return _dataAPI.AddUpdateUser(dto);
        }
        [HttpGet("GetAllPages")]
        public List<PageDTO> GetAllPages()
        {
            return _dataAPI.GetAllPages();
        }
        [HttpGet("GetPageById/{id}")]
        public PageDTO GetPageById(int id)
        {
            return _dataAPI.GetPageById(id);
        }
        [HttpPost("AddUpdatePage")]
        public bool AddUpdatePage([FromBody]PageDTO dto)
        {
            return _dataAPI.AddUpdatePage(dto);
        }
        [HttpGet("GetAllGroups")]
        public List<GroupDTO> GetAllGroups()
        {
            return _dataAPI.GetAllGroups();
        }
        [HttpGet("GetGroupById/{id}")]
        public GroupDTO GetGroupById(int id)
        {
            return _dataAPI.GetGroupById(id);
        }
        [HttpPost("AddUpdateGroup")]
        public bool AddUpdateGroup([FromBody]GroupDTO dto)
        {
            return _dataAPI.AddUpdateGroup(dto);
        }
        [HttpGet("GetAllKpis")]
        public List<CatalogKpiDTO> GetAllKpis()
        {
            return _dataAPI.GetAllKpis();
        }
        [HttpGet("GetKpiById/{id}")]
        public CatalogKpiDTO GetKpiById(int id)
        {
            return _dataAPI.GetKpiById(id);
        }
        [HttpPost("AddUpdateKpi")]
        public bool AddUpdateKpi([FromBody]CatalogKpiDTO dto)
        {
            return _dataAPI.AddUpdateKpi(dto);
        }
        [HttpGet("GetKpiByFormId/{id}")]
        public KPIOnlyContractDTO GetKpiByFormId(int id)
        {
            return _dataAPI.GetKpiByFormId(id);
        }
        [HttpGet("GetFormRuleByFormId/{id}")]
        public FormRuleDTO GetFormRuleByFormId(int id)
        {
            return _dataAPI.GetFormRuleByFormId(id);
        }
        [HttpPost("AddUpdateFormRule")]
        public bool AddUpdateFormRule([FromBody]FormRuleDTO dto)
        {
            return _dataAPI.AddUpdateFormRule(dto);
        }
        [HttpGet("Login")]
        public IActionResult Login(string username, string password)
        {
            var data = _dataAPI.Login(username, password);
            if (data != null) {
                return Ok(data);
            }
            var json = new { error = "Login Error", description = "Username o Password errati." };
            return StatusCode(StatusCodes.Status401Unauthorized, json);
        }
        [HttpGet("Logout")]
        public void Logout()
        {
            var usr = (HttpContext.User) as AuthUser;
            if (usr != null)
            {
                _dataAPI.Logout(usr.SessionToken);
            }            
        }
        [HttpGet("ResetPassword")]
        public bool ResetPassword(string username, string email)
        {
            return _dataAPI.ResetPassword(username, email);
        }
        [HttpPost("SubmitForm")]
        [DisableRequestSizeLimit]
        public bool SubmitForm([FromBody]SubmitFormDTO dto)
        {
            return _dataAPI.SumbitForm(dto);
        }

        [HttpPost("SubmitAttachment")]
        [DisableRequestSizeLimit]
        public bool SubmitAttachment([FromBody]List<FormAttachmentDTO> dto)
        {
            return _dataAPI.SubmitAttachment(dto);
        }
        [HttpGet("GetAttachmentsByFormId")]
        public List<FormAttachmentDTO> GetAttachmentsByFormId(int formId)
        {
            return _dataAPI.GetAttachmentsByFormId(formId);
        }
        [HttpGet("GetAllTUsers")]
        public List<TUserDTO> GetAllTUsers()
        {
            return _dataAPI.GetAllTUsers();
        }
        [HttpPost("ArchiveKPIs")]
        public int ArchiveKPIs([FromBody]ArchiveKPIDTO dto)
        {
            return _dataAPI.ArchiveKPIs(dto);
        }
        [HttpGet("GetAllForms")]
        public List<FormLVDTO> GetAllForms()
        {
            return _dataAPI.GetAllForms();
        }
        //[Authorize(WorkFlowPermissions.USER)]
        [HttpGet("GetAllAPIs")]
        public List<ApiDetailsDTO> GetAllAPIs()
        {
            return _dataAPI.GetAllAPIs();
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetAllAPIWithPermission")]
        public List<ApiDetailsDTO> GetAllAPIWithPermission()
        {
            return _dataAPI.GetAllAPIs();
        }

        [HttpGet("GetAllArchivedKPIs")]
        public List<ARulesDTO> GetAllArchivedKPIs(string month, string year, int id_kpi)
        {
            return _dataAPI.GetAllArchiveKPIs(month, year, id_kpi);
        }

        [HttpGet("GetRawDataByKpiID")]
        public List<ATDtDeDTO> GetRawDataByKpiID(int id_kpi, string month, string year)
        {
            return _dataAPI.GetRawDataByKpiID(id_kpi, month, year);
        }
        [HttpGet("GetDetailsArchivedKPI")]
        public List<ATDtDeDTO> GetDetailsArchivedKPIs(int idkpi, string month, string year)
        {
            return _dataAPI.GetDetailsArchiveKPI(idkpi, month, year);
        }
 
        [HttpGet("GetFormConfiguration")]
        public List<FormConfigurationDTO> GetFormConfiguration()
        {
            return _dataAPI.GetFormConfiguration();
        }
        [HttpGet("GetAllCustomersKP")]
        public List<KeyValuePair<int, string>> GetAllCustomersKP()
        {
            return _dataAPI.GetAllCustomersKP();
        }
        [HttpGet("GetAllTRules")]
        public List<TRuleDTO> GetAllTRules()
        {
            return _dataAPI.GetAllTRules();
        }
    }
}
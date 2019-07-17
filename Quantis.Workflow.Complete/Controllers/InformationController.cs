using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;

namespace Quantis.WorkFlow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class InformationController : ControllerBase
    {
        private IInformationService _infomationAPI { get; set; }
        public InformationController(IInformationService infomationAPI)
        {
            _infomationAPI = infomationAPI;
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetAllBasicConfigurations")]
        public List<ConfigurationDTO> GetAllBasicConfigurations()
        {
            return _infomationAPI.GetAllBasicConfigurations();
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetAllAdvancedConfigurations")]
        public List<ConfigurationDTO> GetAllAdvancedConfigurations()
        {
            return _infomationAPI.GetAllAdvancedConfigurations();
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("DeleteBasicConfiguration")]
        public void DeleteBasicConfiguration(string owner, string key)
        {
            _infomationAPI.DeleteConfiguration(owner, key);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("DeleteAdvancedConfiguration")]
        public void DeleteAdvancedConfiguration(string owner, string key)
        {
            _infomationAPI.DeleteConfiguration(owner, key);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AddUpdateBasicConfiguration")]
        public void AddUpdateBasicConfiguration([FromBody]ConfigurationDTO dto)
        {
            _infomationAPI.AddUpdateBasicConfiguration(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AddUpdateAdvancedConfiguration")]
        public void AddUpdateAdvancedConfiguration([FromBody]ConfigurationDTO dto)
        {
            _infomationAPI.AddUpdateAdvancedConfiguration(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetAllRoles")]
        public List<BaseNameCodeDTO> GetAllRoles()
        {
            return _infomationAPI.GetAllRoles();
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AddUpdateRole")]
        public void AddUpdateRole([FromBody]BaseNameCodeDTO dto)
        {
            _infomationAPI.AddUpdateRole(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("DeleteRole")]
        public void DeleteRole(int roleId)
        {
            _infomationAPI.DeleteRole(roleId);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetAllPermissions")]
        public List<PermissionDTO> GetAllPermissions()
        {
            return _infomationAPI.GetAllPermissions();
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetRolesByUserId")]
        public List<BaseNameCodeDTO> GetRolesByUserId(int userid)
        {
            return _infomationAPI.GetRolesByUserId(userid);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetPermissionsByUserId")]
        public List<PermissionDTO> GetPermissionsByUserId(int userid)
        {
            return _infomationAPI.GetPermissionsByUserId(userid);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetPermissionsByRoleID")]
        public List<PermissionDTO> GetPermissionsByRoleID(int roleId)
        {
            return _infomationAPI.GetPermissionsByRoleID(roleId);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AssignRolesToUser")]
        public void AssignRolesToUser([FromBody]MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignRolesToUser(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AssignPermissionsToRoles")]
        public void AssignPermissionsToRoles([FromBody]MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignPermissionsToRoles(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpGet("GetAllSDMStatusConfigurations")]
        public List<SDMStatusDTO> GetAllSDMStatusConfigurations()
        {
            return _infomationAPI.GetAllSDMStatusConfigurations();
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpGet("GetAllSDMGroupConfigurations")]
        public List<SDMGroupDTO> GetAllSDMGroupConfigurations()
        {
            return _infomationAPI.GetAllSDMGroupConfigurations();
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpGet("DeleteSDMGroupConfiguration/{id}")]
        public void DeleteSDMGroupConfiguration(int id)
        {
            _infomationAPI.DeleteSDMGroupConfiguration(id);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpGet("DeleteSDMStatusConfiguration/{id}")]
        public void DeleteSDMStatusConfiguration(int id)
        {
            _infomationAPI.DeleteSDMStatusConfiguration(id);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpPost("AddUpdateSDMStatusConfiguration")]
        public void AddUpdateSDMStatusConfiguration([FromBody]SDMStatusDTO dto)
        {
            _infomationAPI.AddUpdateSDMStatusConfiguration(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_CONFIGURATIONS)]
        [HttpPost("AddUpdateSDMGroupConfiguration")]
        public void AddUpdateSDMGroupConfiguration([FromBody]SDMGroupDTO dto)
        {
            _infomationAPI.AddUpdateSDMGroupConfiguration(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetAllKPIHierarchy")]
        public List<HierarchicalNameCodeDTO> GetAllKPIHierarchy()
        {
            return _infomationAPI.GetAllKPIHierarchy();
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetGlobalRulesByUserId")]
        public List<int> GetGlobalRulesByUserId(int userId)
        {
            return _infomationAPI.GetGlobalRulesByUserId(userId);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpPost("AssignGlobalRulesToUserId")]
        public void AssignGlobalRulesToUserId([FromBody]MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignGlobalRulesToUserId(dto);
        }
        [Authorize(WorkFlowPermissions.VIEW_CONFIGURATIONS)]
        [HttpGet("GetVersion")]
        public IActionResult GetVersion()
        {
            var json = new { API = "v. 1.2.5", UI = "v. 1.2.5b" };
            return Ok(json);
        }
        [Authorize(WorkFlowPermissions.VIEW_BSI_LINK)]
        [HttpGet("GetBSILink")]
        public string GetBSILink()
        {
            var conf=_infomationAPI.GetConfiguration("bsi_server", "bsi_webserver");
            return (conf==null)?null:conf.Value;
        }

    }
}
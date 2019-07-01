using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
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
        [HttpGet("GetAllBasicConfigurations")]
        public List<ConfigurationDTO> GetAllBasicConfigurations()
        {
            return _infomationAPI.GetAllBasicConfigurations();
        }
        [HttpGet("GetAllAdvancedConfigurations")]
        public List<ConfigurationDTO> GetAllAdvancedConfigurations()
        {
            return _infomationAPI.GetAllAdvancedConfigurations();
        }
        [HttpGet("DeleteBasicConfiguration")]
        public void DeleteBasicConfiguration(string owner, string key)
        {
            _infomationAPI.DeleteConfiguration(owner,key);
        }
        [HttpGet("DeleteAdvancedConfiguration")]
        public void DeleteAdvancedConfiguration(string owner, string key)
        {
            _infomationAPI.DeleteConfiguration(owner, key);
        }
        [HttpPost("AddUpdateBasicConfiguration")]
        public void AddUpdateBasicConfiguration([FromBody]ConfigurationDTO dto)
        {
            _infomationAPI.AddUpdateConfiguration(dto);
        }
        [HttpPost("AddUpdateAdvancedConfiguration")]
        public void AddUpdateAdvancedConfiguration([FromBody]ConfigurationDTO dto)
        {
            _infomationAPI.AddUpdateConfiguration(dto);
        }

        [HttpGet("GetAllRoles")]
        public List<BaseNameCodeDTO> GetAllRoles()
        {
            return _infomationAPI.GetAllRoles();
        }
        [HttpPost("AddUpdateRole")]
        public void AddUpdateRole([FromBody]BaseNameCodeDTO dto)
        {
            _infomationAPI.AddUpdateRole(dto);
        }
        [HttpGet("DeleteRole")]
        public void DeleteRole(int roleId)
        {
            _infomationAPI.DeleteRole(roleId);
        }
        [HttpGet("GetAllPermissions")]
        public List<PermissionDTO> GetAllPermissions()
        {
            return _infomationAPI.GetAllPermissions();
        }

        [HttpGet("GetRolesByUserId")]
        public List<BaseNameCodeDTO> GetRolesByUserId(int userid)
        {
            return _infomationAPI.GetRolesByUserId(userid);
        }

        [HttpGet("GetPermissionsByUserId")]
        public List<PermissionDTO> GetPermissionsByUserId(int userid)
        {
            return _infomationAPI.GetPermissionsByUserId(userid);
        }

        [HttpGet("GetPermissionsByRoleID")]
        public List<PermissionDTO> GetPermissionsByRoleID(int roleId)
        {
            return _infomationAPI.GetPermissionsByRoleID(roleId);
        }

        [HttpPost("AssignRolesToUser")]
        public void AssignRolesToUser([FromBody]MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignRolesToUser(dto);
        }

        [HttpPost("AssignPermissionsToRoles")]
        public void AssignPermissionsToRoles([FromBody]MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignPermissionsToRoles(dto);
        }
        [HttpGet("GetAllSDMStatusConfigurations")]
        public List<SDMStatusDTO> GetAllSDMStatusConfigurations()
        {
            return _infomationAPI.GetAllSDMStatusConfigurations();
        }
        [HttpGet("GetAllSDMGroupConfigurations")]
        public List<SDMGroupDTO> GetAllSDMGroupConfigurations()
        {
            return _infomationAPI.GetAllSDMGroupConfigurations();
        }
        [HttpGet("DeleteSDMGroupConfiguration/{id}")]
        public void DeleteSDMGroupConfiguration(int id)
        {
            _infomationAPI.DeleteSDMGroupConfiguration(id);
        }
        [HttpGet("DeleteSDMStatusConfiguration/{id}")]
        public void DeleteSDMStatusConfiguration(int id)
        {
            _infomationAPI.DeleteSDMStatusConfiguration(id);
        }
        [HttpPost("AddUpdateSDMStatusConfiguration")]
        public void AddUpdateSDMStatusConfiguration([FromBody]SDMStatusDTO dto)
        {
            _infomationAPI.AddUpdateSDMStatusConfiguration(dto);
        }
        [HttpPost("AddUpdateSDMGroupConfiguration")]
        public void AddUpdateSDMGroupConfiguration([FromBody]SDMGroupDTO dto)
        {
            _infomationAPI.AddUpdateSDMGroupConfiguration(dto);
        }
        [HttpGet("GetAllKPIHierarchy")]
        public List<HierarchicalNameCodeDTO> GetAllKPIHierarchy()
        {
            return _infomationAPI.GetAllKPIHierarchy();
        }
        public void AssignGlobalRulesToUserId(MultipleRecordsDTO dto)
        {
            _infomationAPI.AssignGlobalRulesToUserId(dto);
        }

    }
}
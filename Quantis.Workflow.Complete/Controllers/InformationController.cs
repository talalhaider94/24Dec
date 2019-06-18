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
        [HttpGet("GetAllConfigurations")]
        public List<ConfigurationDTO> GetAllConfigurations()
        {
            return _infomationAPI.GetAllConfigurations();
        }
        [HttpGet("DeleteConfiguration")]
        public void DeleteConfiguration(string owner, string key)
        {
            _infomationAPI.DeleteConfiguration(owner,key);
        }
        [HttpPost("AddUpdateConfiguration")]
        public void AddUpdateConfiguration([FromBody]ConfigurationDTO dto)
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
        public List<BaseNameCodeDTO> GetAllPermissions()
        {
            return _infomationAPI.GetAllPermissions();
        }

        [HttpGet("GetRolesByUserId")]
        public List<BaseNameCodeDTO> GetRolesByUserId(int userid)
        {
            return _infomationAPI.GetRolesByUserId(userid);
        }

        [HttpGet("GetPermissionsByUserId")]
        public List<BaseNameCodeDTO> GetPermissionsByUserId(int userid)
        {
            return _infomationAPI.GetPermissionsByUserId(userid);
        }

        [HttpGet("GetPermissionsByRoleID")]
        public List<BaseNameCodeDTO> GetPermissionsByRoleID(int roleId)
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

    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.OracleAPI;

namespace Quantis.WorkFlow.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class OracleController : ControllerBase
    {
        private IOracleDataService _oracleAPI { get; set; }

        public OracleController(IOracleDataService oracleAPI)
        {
            _oracleAPI = oracleAPI;
        }
        [HttpGet("GetCustomerById/{id}")]
        public List<OracleCustomerDTO> GetCustomerById(int id)
        {
            return _oracleAPI.GetCustomer(id, "");
        }
        [HttpGet("GetBooklets")]
        public List<OracleBookletDTO> GetBooklets()
        {
            return _oracleAPI.GetBooklets();
        }
        [HttpGet("GetCustomers")]
        public List<OracleCustomerDTO> GetCustomers(string name)
        {
            return _oracleAPI.GetCustomer(0, name);
        }
        [HttpGet("GetFormById/{id}")]
        public List<OracleFormDTO> GetFormById(int id)
        {
            return _oracleAPI.GetForm(id, 0);
        }
        [HttpGet("GetFormsByUserId/{userid}")]
        public List<OracleFormDTO> GetFormByUserId(int userid)
        {
            return _oracleAPI.GetForm(0, userid);
        }
        [HttpGet("GetForms")]
        public List<OracleFormDTO> GetForms(int id)
        {
            return _oracleAPI.GetForm(0, 0);
        }
        [HttpGet("GetGroupById/{id}")]
        public List<OracleGroupDTO> GetGroupById(int id)
        {
            return _oracleAPI.GetGroup(id, "");
        }
        [HttpGet("GetGroups")]
        public List<OracleGroupDTO> GetGroups(string name)
        {
            return _oracleAPI.GetGroup(0, name);
        }
        [HttpGet("GetSlaById/{id}")]
        public List<OracleSlaDTO> GetSlaById(int id)
        {
            return _oracleAPI.GetSla(id, "");
        }
        [HttpGet("GetSlas")]
        public List<OracleSlaDTO> GetSlas(string name)
        {
            return _oracleAPI.GetSla(0, name);
        }
        [HttpGet("GetRuleById/{id}")]
        public List<OracleRuleDTO> GetRuleById(int id)
        {
            return _oracleAPI.GetRule(id, "");
        }
        [HttpGet("GetRules")]
        public List<OracleRuleDTO> GetRules(string name)
        {
            return _oracleAPI.GetRule(0, name);
        }
        [HttpGet("GetUserById/{id}")]
        public List<OracleUserDTO> GetUserById(int id)
        {
            return _oracleAPI.GetUser(id, "");
        }
        [HttpGet("GetUsers")]
        public List<OracleUserDTO> GetUsers(string name)
        {
            return _oracleAPI.GetUser(0, name);
        }
        [HttpGet("GetPsl")]
        public List<PslDTO> GetPsl(string period, string sla_name, string rule_name, string tracking_period)
        {
            return _oracleAPI.GetPsl(period, sla_name, rule_name, tracking_period);
        }
    }
}
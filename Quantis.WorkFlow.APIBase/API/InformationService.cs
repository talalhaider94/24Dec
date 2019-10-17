using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models.Information;
using Quantis.WorkFlow.Models.SDM;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace Quantis.WorkFlow.APIBase.API
{
    public class InformationService : IInformationService
    {
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private readonly IMappingService<ConfigurationDTO, T_Configuration> _configurationMapper;
        private readonly IMappingService<SDMGroupDTO, SDM_TicketGroup> _sdmGroupMapper;
        private readonly IMappingService<SDMStatusDTO, SDM_TicketStatus> _sdmStatusMapper;
        private readonly IConfiguration _configuration;

        public InformationService(WorkFlowPostgreSqlContext dbcontext, IMappingService<ConfigurationDTO, T_Configuration> configurationMapper,
             IMappingService<SDMGroupDTO, SDM_TicketGroup> sdmGroupMapper,
             IMappingService<SDMStatusDTO, SDM_TicketStatus> sdmStatusMapper,
             IConfiguration configuration)
        {
            _dbcontext = dbcontext;
            _configurationMapper = configurationMapper;
            _sdmGroupMapper = sdmGroupMapper;
            _sdmStatusMapper = sdmStatusMapper;
            _configuration = configuration;
        }

        public void AddUpdateBasicConfiguration(ConfigurationDTO dto)
        {
            try
            {
                var conf = _dbcontext.Configurations.FirstOrDefault(o => o.owner == dto.Owner && o.key == dto.Key);
                //TODO: Need to fix cutt of date.
                if (dto.Owner == "be_restserver" && dto.Key == "day_cutoff")
                {
                    var ents = _dbcontext.CatalogKpi.ToList();
                    foreach (var en in ents)
                    {
                        en.day_cutoff = int.Parse(dto.Value);
                    }
                    _dbcontext.SaveChanges();
                }
                if (conf == null)
                {
                    conf = new T_Configuration();
                    conf = _configurationMapper.GetEntity(dto, conf);
                    conf.category = "B";
                    _dbcontext.Configurations.Add(conf);
                }
                else
                {
                    conf = _configurationMapper.GetEntity(dto, conf);
                }
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AddUpdateAdvancedConfiguration(ConfigurationDTO dto)
        {
            try
            {
                var conf = _dbcontext.Configurations.FirstOrDefault(o => o.owner == dto.Owner && o.key == dto.Key);
                if (conf == null)
                {
                    conf = new T_Configuration();
                    conf = _configurationMapper.GetEntity(dto, conf);
                    conf.category = "A";
                    _dbcontext.Configurations.Add(conf);
                }
                else
                {
                    conf = _configurationMapper.GetEntity(dto, conf);
                }
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AddUpdateUserSettings(int userId,string key,string value)
        {
            var settings = _dbcontext.UserSettings.FirstOrDefault(o => o.user_id == userId && o.key == key);
            if (settings == null)
            {
                var setting = new T_UserSetting()
                {
                    key = key,
                    value = value,
                    user_id = userId
                };
                _dbcontext.UserSettings.Add(setting);
                _dbcontext.SaveChanges();
            }
            else
            {
                settings.value = value;
                _dbcontext.SaveChanges();
            }
        }
        public string GetUserSetting(int userId,string key)
        {
            var setting= _dbcontext.UserSettings.FirstOrDefault(o => o.user_id == userId && o.key == key);
            if (setting != null)
            {
                return setting.value;
            }
            return null;
        }
        public List<KeyValuePair<string,string>> GetAllUserSettings(int userId)
        {
            var settings = _dbcontext.UserSettings.Where(o => o.user_id == userId);
            return settings.Select(o => new KeyValuePair<string, string>(o.key, o.value)).ToList();
        }

        public void DeleteConfiguration(string owner, string key)
        {
            try
            {
                var conf = _dbcontext.Configurations.Single(o => o.owner == owner && o.key == key);
                if (conf != null)
                {
                    _dbcontext.Configurations.Remove(conf);
                    _dbcontext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public ConfigurationDTO GetConfiguration(string owner, string key)
        {
            try
            {
                var conf = _dbcontext.Configurations.FirstOrDefault(o => o.owner == owner && o.key == key);
                if (conf == null)
                {
                    return null;
                }
                var dto = _configurationMapper.GetDTO(conf);
                return dto;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<ConfigurationDTO> GetAllBasicConfigurations()
        {
            try
            {
                var confs = _dbcontext.Configurations.Where(o => o.isvisible && o.category == "B").OrderBy(o => o.key);
                var dtos = _configurationMapper.GetDTOs(confs.ToList());
                return dtos;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<ConfigurationDTO> GetAllAdvancedConfigurations()
        {
            try
            {
                var confs = _dbcontext.Configurations.Where(o => o.isvisible && o.category == "A").OrderBy(o => o.key);
                var dtos = _configurationMapper.GetDTOs(confs.ToList());
                return dtos;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<BaseNameCodeDTO> GetAllRoles()
        {
            try
            {
                var roles = _dbcontext.Roles.ToList();
                return roles.Select(o => new BaseNameCodeDTO(o.id, o.name, o.code)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AddUpdateRole(BaseNameCodeDTO dto)
        {
            try
            {
                if (dto.Id == 0)
                {
                    var role = new T_Role();
                    role.name = dto.Name;
                    role.code = dto.Code;
                    _dbcontext.Roles.Add(role);
                    _dbcontext.SaveChanges();
                }
                else
                {
                    var role = _dbcontext.Roles.Single(o => o.id == dto.Id);
                    role.name = dto.Name;
                    role.code = dto.Code;
                    _dbcontext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void DeleteRole(int roleId)
        {
            try
            {
                var userroles = _dbcontext.UserRoles.Where(o => o.role_id == roleId);
                _dbcontext.UserRoles.RemoveRange(userroles.ToArray());
                var rolepermissions = _dbcontext.RolePermissions.Where(o => o.role_id == roleId);
                _dbcontext.RolePermissions.RemoveRange(rolepermissions.ToArray());
                var role = _dbcontext.Roles.Single(o => o.id == roleId);
                _dbcontext.Roles.Remove(role);
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<PermissionDTO> GetAllPermissions()
        {
            try
            {
                var permission = _dbcontext.Permissions.OrderBy(o => o.name).ToList();
                return permission.Select(o => new PermissionDTO(o.id, o.name, o.code, o.category, o.permission_type)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<BaseNameCodeDTO> GetRolesByUserId(int userid)
        {
            try
            {
                var roles = _dbcontext.UserRoles.Include(o => o.Role).Where(q => q.user_id == userid).Select(r => r.Role).ToList();
                return roles.Select(o => new BaseNameCodeDTO(o.id, o.name, o.code)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<PermissionDTO> GetPermissionsByUserId(int userid)
        {
            try
            {
                var roles = _dbcontext.UserRoles.Where(q => q.user_id == userid).Select(s => s.role_id).ToList();
                var permission = _dbcontext.RolePermissions.Include(o => o.Permission).Where(o => roles.Contains(o.role_id)).Select(p => p.Permission).Distinct().OrderBy(o => o.name).ToList();
                return permission.Select(o => new PermissionDTO(o.id, o.name, o.code, o.category, o.permission_type)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<PermissionDTO> GetPermissionsByRoleID(int roleId)
        {
            try
            {
                var permissions = _dbcontext.RolePermissions.Include(o => o.Permission).Where(p => p.role_id == roleId).Select(o => o.Permission);
                return permissions.OrderBy(o => o.name).Select(o => new PermissionDTO(o.id, o.name, o.code, o.category, o.permission_type)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public int GetContractIdByGlobalRuleId(int globalruleid)
        {
            try
            {
                int res = 0;
                string query = "select r.global_rule_id, m.sla_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' and r.global_rule_id=:global_rule_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":global_rule_id", globalruleid);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res = Decimal.ToInt32((Decimal)result[1]);
                        }
                    }
                }
                return res;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<BaseNameCodeDTO> GetAllContractPariesByUserId(int userId)
        {
            try
            {
                var res = new List<UserKPIDTO>();
                var dtos = new List<BaseNameCodeDTO>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE'";
                using (var command = _dbcontext.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = query;
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(new UserKPIDTO()
                            {
                                Rule_Name = (string)result[0],
                                Global_Rule_Id = Decimal.ToInt32((Decimal)result[1]),
                                Sla_Id = Decimal.ToInt32((Decimal)result[2]),
                                Sla_Name = (string)result[3],
                                Customer_name = (string)result[4],
                                Customer_Id = (int)result[5],
                            });
                        }
                    }
                    var userKpis = _dbcontext.UserKPIs.Where(o => o.user_id == userId).ToList();
                    var groups = res.GroupBy(o => new { o.Customer_Id, o.Customer_name });
                    foreach (var g in groups)
                    {
                        var kpiIds = g.Select(o => o.Global_Rule_Id).ToList();
                        var dto = new BaseNameCodeDTO(g.Key.Customer_Id, g.Key.Customer_name, "");
                        var kpicount = userKpis.Count(o => kpiIds.Contains(o.global_rule_id));
                        if (kpicount == 0)
                        {
                            dto.Code = "0";
                        }
                        else if (kpicount == kpiIds.Count)
                        {
                            dto.Code = "2";
                        }
                        else
                        {
                            dto.Code = "1";
                        }
                        dtos.Add(dto);
                    }
                    return dtos.OrderBy(o => o.Name).ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<ContractPartyContractDTO> GetAllContractPartiesContracts()
        {
            var res = new List<ContractPartyContractDTO>();
            string query = @"select m.sla_id,m.sla_name,c.customer_name,c.customer_id, round( avg(ck.day_cutoff)),round(avg(ck.day_workflow),0)
                            from t_rules r 
                            left join t_sla_versions s on r.sla_version_id = s.sla_version_id 
                            left join t_slas m on m.sla_id = s.sla_id 
                            inner join t_catalog_kpis ck on r.global_rule_id=ck.global_rule_id_bsi
                            left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE'
                            group by m.sla_id,m.sla_name,c.customer_name,c.customer_id";
            using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
            {
                con.Open();
                var command = new NpgsqlCommand(query, con);
                command.CommandType = CommandType.Text;
                _dbcontext.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        res.Add(new ContractPartyContractDTO()
                        {
                            ContractName = (string)result[1],
                            ContractId = Decimal.ToInt32((Decimal)result[0]),
                            ContractPartyId = (int)result[3],
                            ContractPartyName = (string)result[2],
                            DayCuttOff= Decimal.ToInt32((Decimal)result[4]),
                            DayWorkflow= Decimal.ToInt32((Decimal)result[5])
                        });
                    }
                }
                
            }
            return res.OrderBy(o => o.ContractPartyName).ThenBy(o => o.ContractName).ToList();
        }
        public void AssignCuttoffWorkflowDayByContractId(int contractId,int daycuttoff,int workflowday)
        {
            string query = "select r.global_rule_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' and m.sla_id=:sla_id";
            using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
            {
                con.Open();
                var command = new NpgsqlCommand(query, con);
                command.CommandType = CommandType.Text;
                command.Parameters.AddWithValue(":sla_id", contractId);
                _dbcontext.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        int globalRuleId=Decimal.ToInt32((Decimal)result[0]);
                        var catalogKPI=_dbcontext.CatalogKpi.FirstOrDefault(o => o.global_rule_id_bsi == globalRuleId);
                        if (catalogKPI != null)
                        {
                            catalogKPI.day_cutoff = daycuttoff;
                            catalogKPI.day_workflow = workflowday;
                            _dbcontext.SaveChanges();
                        }
                    }
                }                
            }
        }
        public List<BaseNameCodeDTO> GetAllContractsByUserId(int userId, int contractpartyId)
        {
            try
            {
                var res = new List<UserKPIDTO>();
                var dtos = new List<BaseNameCodeDTO>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' AND m.customer_id=:customer_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":customer_id", contractpartyId);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(new UserKPIDTO()
                            {
                                Rule_Name = (string)result[0],
                                Global_Rule_Id = Decimal.ToInt32((Decimal)result[1]),
                                Sla_Id = Decimal.ToInt32((Decimal)result[2]),
                                Sla_Name = (string)result[3],
                                Customer_name = (string)result[4],
                                Customer_Id = (int)result[5],
                            });
                        }
                    }
                    var userKpis = _dbcontext.UserKPIs.Where(o => o.user_id == userId).ToList();
                    var groups = res.GroupBy(o => new { o.Sla_Id, o.Sla_Name });
                    foreach (var g in groups)
                    {
                        var kpiIds = g.Select(o => o.Global_Rule_Id).ToList();
                        var dto = new BaseNameCodeDTO(g.Key.Sla_Id, g.Key.Sla_Name, "");
                        var kpicount = userKpis.Count(o => kpiIds.Contains(o.global_rule_id));
                        if (kpicount == 0)
                        {
                            dto.Code = "0";
                        }
                        else if (kpicount == kpiIds.Count)
                        {
                            dto.Code = "2";
                        }
                        else
                        {
                            dto.Code = "1";
                        }
                        dtos.Add(dto);
                    }
                    return dtos.OrderBy(o => o.Name).ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<BaseNameCodeDTO> GetAllKpisByUserId(int userId, int contractId)
        {
            try
            {
                var dtos = new List<BaseNameCodeDTO>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' AND m.sla_id=:sla_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":sla_id", contractId);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            dtos.Add(new BaseNameCodeDTO(Decimal.ToInt32((Decimal)result[1]), (string)result[0], ""));
                        }
                    }
                    var userKpis = _dbcontext.UserKPIs.Where(o => o.user_id == userId).ToList();

                    return (from d in dtos
                            join u in userKpis on d.Id equals u.global_rule_id
                            into gj
                            from subset in gj.DefaultIfEmpty()
                            select new BaseNameCodeDTO(d.Id, d.Name, subset == null ? "0" : "1")).OrderBy(o => o.Name).ToList();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AssignKpisToUserByContractParty(int userId, int contractpartyId, bool assign)
        {
            try
            {
                var res = new List<int>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' AND m.customer_id=:customer_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":customer_id", contractpartyId);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(Decimal.ToInt32((Decimal)result[1]));
                        }
                    }
                    var values = _dbcontext.UserKPIs.Where(o => res.Contains(o.global_rule_id) && o.user_id == userId).ToList();
                    _dbcontext.UserKPIs.RemoveRange(values.ToArray());
                    _dbcontext.SaveChanges();
                    if (assign)
                    {
                        var entities = res.Select(o => new T_User_KPI()
                        {
                            global_rule_id = o,
                            user_id = userId
                        }).ToList();
                        _dbcontext.UserKPIs.AddRange(entities.ToArray());
                        _dbcontext.SaveChanges();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<UserProfilingDTO> GetUserProfilingCSV()
        {
            var res = new List<UserProfilingDTO>();
            string query = @"select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id,u.user_name,u.user_id
                            from t_rules r
                            left join t_sla_versions s on r.sla_version_id = s.sla_version_id
                            left join t_slas m on m.sla_id = s.sla_id
                            left join t_customers c on m.customer_id = c.customer_id
                            left join t_user_kpis uk on uk.global_rule_id=r.global_rule_id
                            left join t_users u on uk.user_id=u.user_id
                            WHERE s.sla_status = 'EFFECTIVE'
                            AND m.sla_status = 'EFFECTIVE'
                            AND u.user_name is not null";
            using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
            {
                con.Open();
                var command = new NpgsqlCommand(query, con);
                command.CommandType = CommandType.Text;
                _dbcontext.Database.OpenConnection();
                using (var result = command.ExecuteReader())
                {
                    while (result.Read())
                    {
                        res.Add(new UserProfilingDTO()
                        {
                            GlobalRuleName = (string)result[0],
                            GlobalRuleId = Decimal.ToInt32((Decimal)result[1]),
                            ContractName = (string)result[3],
                            ContractId = Decimal.ToInt32((Decimal)result[2]),
                            ContractPartyName = (string)result[4],
                            ContractPartyId = (int)result[5],
                            UserName = (string)result[6],
                            UserId = (int)result[7]
                        });
                    }
                }
                return res;
            }
        }

        public void AssignKpisToUserByContract(int userId, int contractId, bool assign)
        {
            try
            {
                var res = new List<int>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' AND m.sla_id=:sla_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":sla_id", contractId);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(Decimal.ToInt32((Decimal)result[1]));
                        }
                    }
                    var values = _dbcontext.UserKPIs.Where(o => res.Contains(o.global_rule_id) && o.user_id == userId).ToList();
                    _dbcontext.UserKPIs.RemoveRange(values.ToArray());
                    _dbcontext.SaveChanges();
                    if (assign)
                    {
                        var entities = res.Select(o => new T_User_KPI()
                        {
                            global_rule_id = o,
                            user_id = userId
                        }).ToList();
                        _dbcontext.UserKPIs.AddRange(entities.ToArray());
                        _dbcontext.SaveChanges();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AssignKpisToUserByKpis(int userId, int contractId, List<int> kpiIds)
        {
            try
            {
                var res = new List<int>();
                string query = "select r.rule_name, r.global_rule_id, m.sla_id,m.sla_name,c.customer_name,c.customer_id from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id left join t_slas m on m.sla_id = s.sla_id left join t_customers c on m.customer_id = c.customer_id where s.sla_status = 'EFFECTIVE' AND m.sla_status = 'EFFECTIVE' AND m.sla_id=:sla_id";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":sla_id", contractId);
                    _dbcontext.Database.OpenConnection();
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(Decimal.ToInt32((Decimal)result[1]));
                        }
                    }
                    var values = _dbcontext.UserKPIs.Where(o => res.Contains(o.global_rule_id) && o.user_id == userId).ToList();
                    _dbcontext.UserKPIs.RemoveRange(values.ToArray());
                    _dbcontext.SaveChanges();

                    var entities = kpiIds.Select(o => new T_User_KPI()
                    {
                        global_rule_id = o,
                        user_id = userId
                    }).ToList();
                    _dbcontext.UserKPIs.AddRange(entities.ToArray());
                    _dbcontext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AssignRolesToUser(MultipleRecordsDTO dto)
        {
            try
            {
                var roles = _dbcontext.UserRoles.Where(o => o.user_id == dto.Id);
                _dbcontext.UserRoles.RemoveRange(roles.ToArray());
                var userroles = dto.Ids.Select(o => new T_UserRole()
                {
                    role_id = o,
                    user_id = dto.Id
                });
                _dbcontext.UserRoles.AddRange(userroles.ToArray());
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AssignPermissionsToRoles(MultipleRecordsDTO dto)
        {
            try
            {
                var permissions = _dbcontext.RolePermissions.Where(o => o.role_id == dto.Id);
                _dbcontext.RolePermissions.RemoveRange(permissions.ToArray());
                var rolepermissions = dto.Ids.Select(o => new T_RolePermission()
                {
                    role_id = dto.Id,
                    permission_id = o
                });
                _dbcontext.RolePermissions.AddRange(rolepermissions.ToArray());
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<SDMStatusDTO> GetAllSDMStatusConfigurations()
        {
            try
            {
                var ent = _dbcontext.SDMTicketStatus.ToList();
                var dtos = _sdmStatusMapper.GetDTOs(ent);
                return dtos;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<SDMGroupDTO> GetAllSDMGroupConfigurations()
        {
            try
            {
                var ent = _dbcontext.SDMTicketGroup.Include(o => o.category).ToList();
                var dtos = _sdmGroupMapper.GetDTOs(ent);
                return dtos;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void DeleteSDMGroupConfiguration(int id)
        {
            try
            {
                var ent = _dbcontext.SDMTicketGroup.Single(o => o.id == id);
                _dbcontext.SDMTicketGroup.Remove(ent);
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void DeleteSDMStatusConfiguration(int id)
        {
            try
            {
                var ent = _dbcontext.SDMTicketStatus.Single(o => o.id == id);
                _dbcontext.SDMTicketStatus.Remove(ent);
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AddUpdateSDMStatusConfiguration(SDMStatusDTO dto)
        {
            try
            {
                if (dto.id == 0)
                {
                    var ent = new SDM_TicketStatus();
                    ent = _sdmStatusMapper.GetEntity(dto, ent);
                    _dbcontext.SDMTicketStatus.Add(ent);
                    _dbcontext.SaveChanges();
                }
                else
                {
                    var ent = _dbcontext.SDMTicketStatus.Single(o => o.id == dto.id);
                    ent = _sdmStatusMapper.GetEntity(dto, ent);
                    _dbcontext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AddUpdateSDMGroupConfiguration(SDMGroupDTO dto)
        {
            try
            {
                if (dto.id == 0)
                {
                    var ent = new SDM_TicketGroup();
                    ent = _sdmGroupMapper.GetEntity(dto, ent);
                    _dbcontext.SDMTicketGroup.Add(ent);
                    _dbcontext.SaveChanges();
                }
                else
                {
                    var ent = _dbcontext.SDMTicketGroup.Single(o => o.id == dto.id);
                    ent = _sdmGroupMapper.GetEntity(dto, ent);
                    _dbcontext.SaveChanges();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<int> GetGlobalRulesByUserId(int userId)
        {
            try
            {
                var ent = _dbcontext.UserKPIs.Where(o => o.user_id == userId);
                return ent.Select(o => o.global_rule_id).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void AssignGlobalRulesToUserId(MultipleRecordsDTO dto)
        {
            try
            {
                var ent = _dbcontext.UserKPIs.Where(o => o.user_id == dto.Id);
                _dbcontext.UserKPIs.RemoveRange(ent.ToArray());
                _dbcontext.SaveChanges();
                var newent = dto.Ids.Select(o => new T_User_KPI()
                {
                    user_id = dto.Id,
                    global_rule_id = o
                });
                _dbcontext.UserKPIs.AddRange(newent.ToArray());
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<ContractPartyDetailDTO> GetContractPartyByUser(int userId)
        {
            try
            {
                var res = new List<UserKPIDTO>();
                var rules = _dbcontext.UserKPIs.Where(o => o.user_id == userId).Select(p => p.global_rule_id).ToList();
                return _dbcontext.CatalogKpi.Where(o => rules.Contains(o.global_rule_id_bsi)).Select(p => new ContractPartyDetailDTO()
                {
                    ContractPartyId = p.primary_contract_party,
                    KPIId = p.id,
                    GlobalRuleId = p.global_rule_id_bsi
                }).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
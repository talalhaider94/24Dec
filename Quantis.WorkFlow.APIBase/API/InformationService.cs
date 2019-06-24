using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Models.Information;
using Quantis.WorkFlow.Models.SDM;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class InformationService : IInformationService
    {
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private readonly IMappingService<ConfigurationDTO, T_Configuration> _configurationMapper;
        private readonly IMappingService<SDMGroupDTO, SDM_TicketGroup> _sdmGroupMapper;
        private readonly IMappingService<SDMStatusDTO, SDM_TicketStatus> _sdmStatusMapper;
        public InformationService(WorkFlowPostgreSqlContext dbcontext, IMappingService<ConfigurationDTO, T_Configuration> configurationMapper,
             IMappingService<SDMGroupDTO, SDM_TicketGroup> sdmGroupMapper,
             IMappingService<SDMStatusDTO, SDM_TicketStatus> sdmStatusMapper)
        {
            _dbcontext = dbcontext;
            _configurationMapper = configurationMapper;
            _sdmGroupMapper = sdmGroupMapper;
            _sdmStatusMapper = sdmStatusMapper;
        }
        public void AddUpdateConfiguration(ConfigurationDTO dto)
        {
            try
            {
                var conf=_dbcontext.Configurations.Single(o => o.owner == dto.Owner && o.key == dto.Key);
                if (conf == null)
                {
                    conf = new T_Configuration();
                    conf = _configurationMapper.GetEntity(dto, conf);
                    _dbcontext.Configurations.Add(conf);
                }
                else
                {
                    conf = _configurationMapper.GetEntity(dto, conf);
                }
                _dbcontext.SaveChanges();                
                
            }
            catch(Exception e)
            {
                throw e;
            }
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
                var conf = _dbcontext.Configurations.Single(o => o.owner == owner && o.key == key);
                if(conf == null)
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

        public List<ConfigurationDTO> GetAllConfigurations()
        {
            try
            {
                var confs = _dbcontext.Configurations.Where(o=>o.isvisible).OrderBy(o => o.key);
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
                var permission = _dbcontext.Permissions.ToList();
                return permission.Select(o => new PermissionDTO(o.id, o.name, o.code,o.category,o.permission_type)).ToList();
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
                var roles=_dbcontext.UserRoles.Include(o => o.Role).Where(q => q.user_id == userid).Select(r=>r.Role).ToList();
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
                var permission=_dbcontext.RolePermissions.Include(o => o.Permission).Where(o => roles.Contains(o.role_id)).Select(p => p.Permission).ToList();
                return permission.Select(o => new PermissionDTO(o.id, o.name, o.code,o.category,o.permission_type)).ToList();
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
                var permissions = _dbcontext.RolePermissions.Include(o => o.Permission).Where(p => p.role_id == roleId).Select(o=>o.Permission);
                return permissions.Select(o => new PermissionDTO(o.id, o.name, o.code,o.category,o.permission_type)).ToList();
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
                var roles=_dbcontext.UserRoles.Where(o => o.user_id == dto.Id);
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
                    permission_id=o
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
                var ent=_dbcontext.SDMTicketStatus.ToList();
                var dtos=_sdmStatusMapper.GetDTOs(ent);
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
                var ent = _dbcontext.SDMTicketGroup.ToList();
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
                    ent=_sdmStatusMapper.GetEntity(dto,ent);
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

    }
}

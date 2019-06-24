using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IInformationService
    {
        List<ConfigurationDTO> GetAllConfigurations();
        void DeleteConfiguration(string owner, string key);
        void AddUpdateConfiguration(ConfigurationDTO dto);
        ConfigurationDTO GetConfiguration(string owner, string key);
        void AddUpdateRole(BaseNameCodeDTO dto);
        void DeleteRole(int roleId);
        List<BaseNameCodeDTO> GetAllRoles(); 
        List<PermissionDTO> GetAllPermissions();
        List<BaseNameCodeDTO> GetRolesByUserId(int userid);
        List<PermissionDTO> GetPermissionsByUserId(int userid);
        List<PermissionDTO> GetPermissionsByRoleID(int roleId);
        void AssignRolesToUser(MultipleRecordsDTO dto);
        void AssignPermissionsToRoles(MultipleRecordsDTO dto);



    }
}

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


        List<BaseNameCodeDTO> GetAllRoles();
        List<BaseNameCodeDTO> GetAllPermissions();
        List<BaseNameCodeDTO> GetRolesByUserId(int userid);
        List<BaseNameCodeDTO> GetPermissionsByUserId(int userid);
        List<BaseNameCodeDTO> GetPermissionsByRoleID(int roleId);
        void AssignRolesToUser(MultipleRecordsDTO dto);
        void AssignPermissionsToRoles(MultipleRecordsDTO dto);



    }
}

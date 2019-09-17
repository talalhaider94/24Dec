using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IInformationService
    {
        List<ConfigurationDTO> GetAllAdvancedConfigurations();
        List<ConfigurationDTO> GetAllBasicConfigurations();
        void DeleteConfiguration(string owner, string key);
        void AddUpdateBasicConfiguration(ConfigurationDTO dto);
        void AddUpdateAdvancedConfiguration(ConfigurationDTO dto);
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
        List<SDMStatusDTO> GetAllSDMStatusConfigurations();
        List<SDMGroupDTO> GetAllSDMGroupConfigurations();
        void DeleteSDMGroupConfiguration(int id);
        void DeleteSDMStatusConfiguration(int id);
        void AddUpdateSDMStatusConfiguration(SDMStatusDTO dto);
        void AddUpdateSDMGroupConfiguration(SDMGroupDTO dto);        
        List<int> GetGlobalRulesByUserId(int userId);
        void AssignGlobalRulesToUserId(MultipleRecordsDTO dto);
        List<ContractPartyDetailDTO> GetContractPartyByUser(int userId);
        List<BaseNameCodeDTO> GetAllContractPariesByUserId(int userId);
        List<BaseNameCodeDTO> GetAllContractsByUserId(int userId, int contractpartyId);
        List<BaseNameCodeDTO> GetAllKpisByUserId(int userId, int contractId);
        void AssignKpisToUserByContractParty(int userId, int contractpartyId, bool assign);
        void AssignKpisToUserByContract(int userId, int contractId, bool assign);
        void AssignKpisToUserByKpis(int userId, int contractId, List<int> kpiIds);
        int GetContractIdByGlobalRuleId(int globalruleid);

    }
}

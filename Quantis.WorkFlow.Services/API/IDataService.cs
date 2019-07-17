using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IDataService
    {
        bool CronJobsScheduler();
        string GetBSIServerURL();
        List<WidgetDTO> GetAllWidgets();
        WidgetDTO GetWidgetById(int Id);
        bool AddUpdateWidget(WidgetDTO dto);
        List<FormLVDTO> GetAllForms();
        List<KeyValuePair<int, string>> GetAllCustomersKP();
        List<UserDTO> GetAllUsers();
        UserDTO GetUserById(string UserId);
        bool AddUpdateUser(UserDTO dto);
        PagedList<UserDTO> GetAllPagedUsers(UserFilterDTO filter);
        List<NotifierLogDTO> GetEmailHistory();
        List<FormDetialsDTO> GetFormDetials(List<int> formids);
        List<PageDTO> GetAllPages();
        PageDTO GetPageById(int Id);
        bool AddUpdatePage(PageDTO dto);
        List<FormAttachmentDTO> GetAttachmentsByFormId(int formId);
        List<GroupDTO> GetAllGroups();
        GroupDTO GetGroupById(int Id);
        bool AddUpdateGroup(GroupDTO dto);
        List<KeyValuePair<int, string>> GetKPITitolo(List<int> ids);
        List<TUserDTO> GetAllTUsers();
        List<TRuleDTO> GetAllTRules();
        List<EmailNotifierDTO> GetEmailNotifiers(string period);
        List<CatalogKpiDTO> GetAllKpis(); //List<CatalogKPILVDTO> GetAllKpis(); 
        CatalogKpiDTO GetKpiById(int Id);
        bool AddUpdateKpi(CatalogKpiDTO dto);
        List<KPIOnlyContractDTO> GetKpiByFormId(int Id);

        List<ApiDetailsDTO> GetAllAPIs();

        FormRuleDTO GetFormRuleByFormId(int Id);
        bool AddUpdateFormRule(FormRuleDTO dto);
        bool RemoveAttachment(int Id);
        void AddArchiveKPI(ARulesDTO dto);
        LoginResultDTO Login(string username, string password);
        void Logout(string token);
        bool SumbitForm(SubmitFormDTO dto);
        bool SubmitAttachment(List<FormAttachmentDTO> dto);

        int ArchiveKPIs(ArchiveKPIDTO dto);
        bool ResetPassword(string username, string email);
        List<UserDTO> GetUsersByRoleId(int roleId);
        List<ARulesDTO> GetAllArchiveKPIs(string month, string year, int id_kpi, List<int> globalruleIds);
        List<ATDtDeDTO> GetDetailsArchiveKPI(int idkpi, string month, string year);
        
        List<ATDtDeDTO> GetRawDataByKpiID(string id_kpi, string month, string year);

        string GetUserIdByUserName(string name);
        CreateTicketDTO GetKPICredentialToCreateTicket(int Id);

        List<FormAttachmentDTO> GetAttachmentsByKPIID(int kpiId);

    }
}

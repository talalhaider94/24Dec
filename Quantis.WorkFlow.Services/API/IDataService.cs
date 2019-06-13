using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
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

        List<UserDTO> GetAllUsers();
        UserDTO GetUserById(string UserId);
        bool AddUpdateUser(UserDTO dto);

        List<PageDTO> GetAllPages();
        PageDTO GetPageById(int Id);
        bool AddUpdatePage(PageDTO dto);

        List<GroupDTO> GetAllGroups();
        GroupDTO GetGroupById(int Id);
        bool AddUpdateGroup(GroupDTO dto);

        List<CatalogKpiDTO> GetAllKpis(); //List<CatalogKPILVDTO> GetAllKpis(); 
        CatalogKPILVDTO GetKpiById(int Id);
        bool AddUpdateKpi(CatalogKpiDTO dto);
        KPIOnlyContractDTO GetKpiByFormId(int Id);

        List<ApiDetailsDTO> GetAllAPIs();

        FormRuleDTO GetFormRuleByFormId(int Id);
        bool AddUpdateFormRule(FormRuleDTO dto);
        bool RemoveAttachment(int Id);

        LoginResultDTO Login(string username, string password);
        bool SumbitForm(SubmitFormDTO dto);
        bool SubmitAttachment(List<FormAttachmentDTO> dto);

        int ArchiveKPIs(ArchiveKPIDTO dto);
        bool ResetPassword(string username, string email);

        List<ARulesDTO> GetAllArchiveKPIs(string month, string year, int id_kpi);
        List<ATDtDeDTO> GetDetailsArchiveKPI(int idkpi, string month, string year);

        string GetUserIdByUserName(string name);
        CreateTicketDTO GetKPICredentialToCreateTicket(int Id);

        List<FormAttachmentDTO> GetAttachmentsByKPIID(int kpiId);

    }
}

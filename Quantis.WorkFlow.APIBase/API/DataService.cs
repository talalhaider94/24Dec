using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Xml.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Web;

namespace Quantis.WorkFlow.APIBase.API
{
    public class DataService:IDataService
    {

        private readonly IMappingService<GroupDTO, T_Group> _groupMapper;
        private readonly IMappingService<PageDTO, T_Page> _pageMapper;
        private readonly IMappingService<WidgetDTO, T_Widget> _widgetMapper;
        private readonly IMappingService<UserDTO, T_CatalogUser> _userMapper;
        private readonly IMappingService<FormRuleDTO, T_FormRule> _formRuleMapper;
        private readonly IMappingService<CatalogKpiDTO, T_CatalogKPI> _catalogKpiMapper;
        private readonly IMappingService<ApiDetailsDTO,T_APIDetail> _apiMapper;
        private readonly IMappingService<FormAttachmentDTO, T_FormAttachment> _fromAttachmentMapper;
        private readonly IOracleDataService _oracleAPI;
        private readonly IConfiguration _configuration;
        private readonly ISMTPService _smtpService;
        private readonly IInformationService _infomationAPI;
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private IMemoryCache _cache;

        public DataService(WorkFlowPostgreSqlContext context,
            IMappingService<GroupDTO, T_Group> groupMapper, 
            IMappingService<PageDTO, T_Page> pageMapper, 
            IMappingService<WidgetDTO, T_Widget> widgetMapper,
            IMappingService<UserDTO, T_CatalogUser> userMapper,
            IMappingService<FormRuleDTO, T_FormRule> formRuleMapper,
            IMappingService<CatalogKpiDTO, T_CatalogKPI> catalogKpiMapper,
            IMappingService<ApiDetailsDTO, T_APIDetail> apiMapper,
            IMappingService<FormAttachmentDTO, T_FormAttachment> fromAttachmentMapper,
            IConfiguration configuration,
            ISMTPService smtpService,
            IOracleDataService oracleAPI,
            IInformationService infomationAPI,
            IMemoryCache memoryCache)
        {
            _groupMapper = groupMapper;
            _pageMapper = pageMapper;
            _widgetMapper = widgetMapper;
            _userMapper = userMapper;
            _formRuleMapper = formRuleMapper;
            _catalogKpiMapper = catalogKpiMapper;
            _apiMapper = apiMapper;
            _oracleAPI = oracleAPI;
            _fromAttachmentMapper = fromAttachmentMapper;
            _configuration = configuration;
            _smtpService = smtpService;
            _dbcontext = context;
            _infomationAPI = infomationAPI;
            _cache = memoryCache;
        }
        public bool CronJobsScheduler()
        {
            return true;

        }
        public List<KeyValuePair<int,string>> GetAllCustomersKP()
        {
            try
            {
                return _dbcontext.Customers.Where(o=>o.customer_id>=1000).OrderBy(p=>p.customer_name).Select(o => new KeyValuePair<int, string>(o.customer_id, o.customer_name)).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool AddUpdateFormRule(FormRuleDTO dto)
        {
            try
            {
                var entity = _dbcontext.FormRules.FirstOrDefault(o => o.form_id == dto.form_id);
                if (entity == null)
                {
                    entity = new T_FormRule();
                    entity = _formRuleMapper.GetEntity(dto, entity);
                    _dbcontext.FormRules.Add(entity);

                }
                else
                {
                    _formRuleMapper.GetEntity(dto, entity);
                }
                _dbcontext.SaveChanges();

                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<FormDetialsDTO> GetFormDetials(List<int> formids)
        {
            try
            {
                return _dbcontext.Forms.Include(p => p.Attachments).Include(q=>q.FormLogs).Where(o => formids.Contains(o.form_id)).Select(o => new FormDetialsDTO() {form_id=o.form_id,attachment_count=o.Attachments.Count,latest_modified_date=o.FormLogs.Any()?o.FormLogs.Max(r=>r.time_stamp):new DateTime(0) }).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
 /*       public List<int> GetRawIdsFromRulePeriod(int ruleId,string period)
        {
            try
            {
                var config = new List<KPIRegistrationDTO>();
                using (var client = new HttpClient())
                {
                    var con = GetBSIServerURL();
                    var apiPath = "api/KPIRegistration/GetKPIRegistrations?ruleId="+ ruleId;
                    var output = QuantisUtilities.FixHttpURLForCall(con, apiPath);
                    client.BaseAddress = new Uri(output.Item1);
                    var response = client.GetAsync(output.Item2).Result;
                    if (response.IsSuccessStatusCode)
                    {

                        config = JsonConvert.DeserializeObject<List<KPIRegistrationDTO>>(response.Content.ReadAsStringAsync().Result);
                        var eventResource = config.Select(o => new EventResourceDTO()
                        {
                            EventId = o.EventTypeId,
                            ResourceId = o.ResourceId
                        }).ToList();
                        
                        var rawIds = GetRawIdsFromResource(eventResource, period);
                        return rawIds;
                    }
                    else
                    {
                        var e = new Exception(string.Format("KPI registration API not working: basePath: {0} apipath: {1}", client.BaseAddress, apiPath));
                        throw e;
                    }

                }
            }
            catch(Exception e)
            {
                throw e;
            }
        }*/
        public List<EventResourceDTO> GetEventResourceFromRule(int ruleId)
        {
            try
            {
                var config = new List<KPIRegistrationDTO>();
                using (var client = new HttpClient())
                {
                    var con = GetBSIServerURL();
                    var apiPath = "/api/KPIRegistration/GetKPIRegistrations?ruleId=" + ruleId;
                    var output = QuantisUtilities.FixHttpURLForCall(con, apiPath);
                    client.BaseAddress = new Uri(output.Item1);
                    var response = client.GetAsync(output.Item2).Result;
                    if (response.IsSuccessStatusCode)
                    {

                        config = JsonConvert.DeserializeObject<List<KPIRegistrationDTO>>(response.Content.ReadAsStringAsync().Result);
                        var eventResource = config.Select(o => new EventResourceDTO()
                        {
                            EventId = o.EventTypeId,
                            ResourceId = o.ResourceId
                        }).ToList();

                        //var rawIds = GetRawIdsFromResource(eventResource, period);
                        return eventResource;
                        //DO THE QUERY TO ARCHIVE
                    }
                    else
                    {
                        var e = new Exception(string.Format("KPI registration API not working: basePath: {0} apipath: {1}", client.BaseAddress, apiPath));
                        throw e;
                    }

                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<NotifierLogDTO> GetEmailHistory()
        {
            try
            {
                var entity = _dbcontext.NotifierLogs.ToList();
                return entity.Select(o => new NotifierLogDTO() {
                    email_body=o.email_body,
                    id_form=o.id_form,
                    is_ack=o.is_ack,
                    notify_timestamp=o.notify_timestamp,
                    period=o.period,
                    remind_timestamp=o.remind_timestamp,
                    year=o.year
                }).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public FormRuleDTO GetFormRuleByKPIID(string kpiId)
        {
            try
            {
                return null;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool AddUpdateGroup(GroupDTO dto)
        {
            try
            {
                var entity = new T_Group();
                if (dto.group_id > 0)
                {
                    entity = _dbcontext.Groups.FirstOrDefault(o => o.group_id == dto.group_id);
                }
                entity = _groupMapper.GetEntity(dto, entity);
                if (dto.group_id == 0)
                {
                    _dbcontext.Groups.Add(entity);
                }
                
                _dbcontext.SaveChanges();
                return true;
            }
            catch(Exception e)
            {
                throw e;
            }            
        }

        public bool AddUpdatePage(PageDTO dto)
        {
            try
            {
                var entity = new T_Page();
                if (dto.page_id > 0)
                {
                    entity = _dbcontext.Pages.FirstOrDefault(o => o.page_id == dto.page_id);
                }
                entity = _pageMapper.GetEntity(dto, entity);
                if (dto.page_id == 0)
                {
                    _dbcontext.Pages.Add(entity);
                }
                
                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string GetUserIdByUserName(string name)
        {
            try
            {
                var usr=_dbcontext.CatalogUsers.FirstOrDefault(o => o.ca_bsi_account == name);
                if (usr != null)
                {
                    return usr.userid;
                }
                return null;

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool AddUpdateUser(UserDTO dto)
        {
            using (var dbContextTransaction = _dbcontext.Database.BeginTransaction())
            {
                try
                {
                    var entity = new T_CatalogUser();
                    if (dto.id > 0)
                    {
                        entity = _dbcontext.CatalogUsers.FirstOrDefault(o => o.id == dto.id);
                    }
                    entity = _userMapper.GetEntity(dto, entity);

                    if (dto.id == 0)
                    {
                        var usr = _dbcontext.TUsers.FirstOrDefault(o => dto.ca_bsi_user_id == o.user_id);
                        if (usr != null)
                        {
                            usr.in_catalog = true;
                            _dbcontext.SaveChanges(false);
                            _dbcontext.CatalogUsers.Add(entity);
                        }
                    }

                    _dbcontext.SaveChanges(false);
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception e)
                {
                    dbContextTransaction.Rollback();
                    throw e;
                }
            }
            
        }

        public bool AddUpdateWidget(WidgetDTO dto)
        {
            try
            {
                var entity = new T_Widget();
                if (dto.widget_id > 0)
                {
                    entity = _dbcontext.Widgets.FirstOrDefault(o => o.widget_id == dto.widget_id);
                }
                entity = _widgetMapper.GetEntity(dto, entity);
                if (dto.widget_id == 0)
                {               
                    _dbcontext.Widgets.Add(entity);
                }
                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /*public bool AddUpdateKpi(CatalogKpiDTO dto)
        {
            try
            {
                var entity = new T_CatalogKPI();
                if (dto.id > 0)
                {
                    entity = _dbcontext.CatalogKpi.FirstOrDefault(o => o.id == dto.id);
                }
                entity = _catalogKpiMapper.GetEntity(dto, entity);
                if (dto.id == 0)
                {
                    _dbcontext.CatalogKpi.Add(entity);
                }
                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }*/
        public bool AddUpdateKpi(CatalogKpiDTO dto)
        {
            using (var dbContextTransaction = _dbcontext.Database.BeginTransaction())
            {
                try
                {
                    var entity = new T_CatalogKPI();
                    if (dto.id > 0)
                    {
                        entity = _dbcontext.CatalogKpi.FirstOrDefault(o => o.id == dto.id);
                    }
                    entity = _catalogKpiMapper.GetEntity(dto, entity);

                    if (dto.id == 0)
                    {
                        var kpi = _dbcontext.TGlobalRules.FirstOrDefault(o => dto.global_rule_id_bsi == o.global_rule_id);
                        if (kpi != null)
                        {
                            kpi.in_catalog = true;
                            _dbcontext.SaveChanges(false);
                            _dbcontext.CatalogKpi.Add(entity);
                        }
                    }

                    _dbcontext.SaveChanges(false);
                    dbContextTransaction.Commit();
                    return true;
                }
                catch (Exception e)
                {
                    dbContextTransaction.Rollback();
                    throw e;
                }
            }

        }
        public List<GroupDTO> GetAllGroups()
        {
            try
            {
                var groups = _dbcontext.Groups.Where(o => o.delete_date != null);
                return _groupMapper.GetDTOs(groups.ToList());
            }
            catch(Exception e)
            {
                throw e;
            }
            
        }

        public List<ApiDetailsDTO> GetAllAPIs()
        {
            try
            {
                var apis = _dbcontext.ApiDetails.ToList();
                return _apiMapper.GetDTOs(apis.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        public List<CatalogKpiDTO> GetAllKpis()
        {
            try
            {
                var kpis = _dbcontext.CatalogKpi.Include(o=>o.PrimaryCustomer).Include(o=>o.SecondaryCustomer).Include(o => o.GlobalRule).Include(o => o.Sla).ToList();
                return _catalogKpiMapper.GetDTOs(kpis.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        public List<CatalogKpiDTO> GetAllKpisByUserId(List<int> globalruleIds)
        {
            try
            {
                if (!globalruleIds.Any() || globalruleIds == null)
                {
                    return new List<CatalogKpiDTO>();
                }
                var kpis = _dbcontext.CatalogKpi.Include(o => o.PrimaryCustomer).Include(o => o.SecondaryCustomer).Include(o => o.GlobalRule).Include(o => o.Sla).Where(o => globalruleIds.Contains(o.global_rule_id_bsi)).ToList();
                return _catalogKpiMapper.GetDTOs(kpis.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        public List<PageDTO> GetAllPages()
        {
            try
            {
                var pages = _dbcontext.Pages.ToList();
                return _pageMapper.GetDTOs(pages.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }
        public PagedList<UserDTO> GetAllPagedUsers(UserFilterDTO filter)
        {
            try
            {
                var query = CreateGetUserQuery(filter);
                filter.OrderBy = _userMapper.SortMap(filter.OrderBy);
                var users = query.GetPaged(filter);
                return _userMapper.GetPagedDTOs(users);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<UserDTO> GetAllUsers()
        {
            try
            {
                var users = _dbcontext.CatalogUsers.ToList();
                return _userMapper.GetDTOs(users.ToList());                
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }
        public List<UserDTO> GetUsersByRoleId(int roleId)
        {
            try
            {
                var usersids = _dbcontext.UserRoles.Where(o=>o.role_id==roleId).Select(p=>p.user_id).ToList();
                var users = _dbcontext.CatalogUsers.Where(o => usersids.Contains(o.ca_bsi_user_id ?? 0));
                return _userMapper.GetDTOs(users.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<WidgetDTO> GetAllWidgets()
        {
            try
            {
                var widget = _dbcontext.Widgets.Where(o => o.delete_date != null);
                return _widgetMapper.GetDTOs(widget.ToList());
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }

        public bool RemoveAttachment(int id)
        {
            try
            {
                var entity = _dbcontext.FormAttachments.FirstOrDefault(o => o.t_form_attachments_id == id);

                _dbcontext.Remove(entity);

                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public FormRuleDTO GetFormRuleByFormId(int Id)
        {
            try
            {
                var form = _dbcontext.FormRules.FirstOrDefault(o => o.form_id == Id);
                if (form == null)
                {
                    return null;
                }
                return _formRuleMapper.GetDTO(form);
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public CatalogKpiDTO GetKpiById(int Id)
        {
            try
            {
                var kpi = _dbcontext.CatalogKpi.Include(o => o.GlobalRule).Include(o => o.PrimaryCustomer).Include(o => o.SecondaryCustomer).Include(o => o.Sla).FirstOrDefault(o => o.id == Id);
                return _catalogKpiMapper.GetDTO(kpi);
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public GroupDTO GetGroupById(int Id)
        {
            try
            {
                var group = _dbcontext.Groups.FirstOrDefault(o => o.group_id == Id);
                return _groupMapper.GetDTO(group);
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }

        public PageDTO GetPageById(int Id)
        {
            try
            {
                var page = _dbcontext.Pages.FirstOrDefault(o => o.page_id == Id);
                return _pageMapper.GetDTO(page);
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }

        public UserDTO GetUserById(string UserId)
        {
            try
            {
                var user = _dbcontext.CatalogUsers.FirstOrDefault(o => o.userid == UserId);
                return _userMapper.GetDTO(user);
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }

        public List<KPIOnlyContractDTO> GetKpiByFormId(int Id)
        {
            try
            {
                var kpi = _dbcontext.Forms.Include(o => o.CatalogKPIs).FirstOrDefault(o => o.form_id == Id);
                if (kpi== null && kpi.CatalogKPIs.Any())
                {
                    return null;
                }
                return kpi.CatalogKPIs.Select(o => new KPIOnlyContractDTO()
                {
                    contract = o.contract,
                    id_kpi = o.id_kpi,
                    global_rule_id = o.global_rule_id_bsi,
                    kpi_name_bsi = o.kpi_name_bsi,
                    target = o.target
                }).ToList();
                

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public WidgetDTO GetWidgetById(int Id)
        {
            try
            {
                var widget = _dbcontext.Widgets.FirstOrDefault(o => o.widget_id == Id);
                return _widgetMapper.GetDTO(widget);
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }
        public List<FormLVDTO> GetAllForms()
        {
            try
            {
                var forms = _dbcontext.Forms.Include(o=>o.FormLogs).OrderBy(o => o.form_name).ToList();
                var daycutoff= _infomationAPI.GetConfiguration("be_restserver", "day_cutoff");
                return forms.Select(o => new FormLVDTO()
                {
                    create_date=o.create_date,
                    form_description=o.form_description,
                    form_id=o.form_id,
                    form_name=o.form_name,
                    form_owner_id=o.form_owner_id,
                    modify_date=o.modify_date,
                    reader_id=o.reader_id,
                    latest_input_date=o.FormLogs.Any()?o.FormLogs.Max(p=>p.time_stamp):new DateTime(0),
                    day_cuttoff= (daycutoff==null)?null:daycutoff.Value
                }).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool SumbitForm(SubmitFormDTO dto)
        {
            using (var dbContextTransaction = _dbcontext.Database.BeginTransaction())
            {
                try
                {
                    var form_log = new T_FormLog()
                    {
                        empty_form = dto.empty_form,
                        id_form = dto.form_id,
                        id_locale = dto.locale_id,
                        period = dto.period,
                        time_stamp = DateTime.Now,
                        user_id = dto.user_id,
                        year = dto.year
                    };
                    var form=_dbcontext.Forms.FirstOrDefault(o => o.form_id == dto.form_id);
                    if (form != null)
                    {
                        form.modify_date = DateTime.Now;
                        _dbcontext.SaveChanges(false);
                    }
                    _dbcontext.FormLogs.Add(form_log);
                    _dbcontext.SaveChanges(false);
                    T_NotifierLog notifier_log = _dbcontext.NotifierLogs.FirstOrDefault(o => o.id_form == form_log.id_form && o.period == form_log.period && o.year == form_log.year);
                    if (notifier_log != null)
                    {
                        notifier_log.is_ack = true;
                    }
                    else
                    {
                        notifier_log = new T_NotifierLog()
                        {
                            id_form = dto.form_id,
                            notify_timestamp = DateTime.Now,
                            remind_timestamp = null,
                            is_ack = true,
                            period = dto.period,
                            year = dto.year
                        };
                        _dbcontext.NotifierLogs.Add(notifier_log);
                        _dbcontext.SaveChanges(false);
                    }
                    if(CallFormAdapter(new FormAdapterDTO() { formID = dto.form_id, localID = dto.locale_id, forms = dto.inputs }))
                    {
                        dbContextTransaction.Commit();
                        return true;
                    }
                    else
                    {
                        dbContextTransaction.Rollback();
                        return false;
                    }
                }
                catch (Exception e)
                {
                    dbContextTransaction.Rollback();
                    throw e;
                }
            };
        }
        public List<FormAttachmentDTO> GetAttachmentsByFormId(int formId)
        {
            try
            {
                var ents=_dbcontext.FormAttachments.Where(o => o.form_id == formId);
                var dtos = _fromAttachmentMapper.GetDTOs(ents.ToList());
                return dtos.OrderByDescending(o=>o.create_date).ToList();
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public bool SubmitAttachment(List<FormAttachmentDTO> dto)
        {

            try
            {
                List<T_FormAttachment> attachments = new List<T_FormAttachment>();
                foreach (var attach in dto)
                {
                    attachments.Add(_fromAttachmentMapper.GetEntity(attach, new T_FormAttachment()));
                }
                _dbcontext.FormAttachments.AddRange(attachments.ToArray());
                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public string GetBSIServerURL()
        {
            try
            {
                var bsiconf = _infomationAPI.GetConfiguration("be_bsi", "bsi_api_url");
                return bsiconf.Value;
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        
        public LoginResultDTO Login(string username,string password)
        {
            try
            {
                var usr = _dbcontext.CatalogUsers.FirstOrDefault(o => o.ca_bsi_account.ToLower()==username.ToLower());
                if (usr != null)
                {
                    var secret_key = _infomationAPI.GetConfiguration("be_restserver","secret_key");
                    
                    var db_password = sha256_hash(secret_key.Value + usr.password);
                    if (password == db_password)
                    {
                        var token = MD5Hash(usr.userid + DateTime.Now.Ticks);
                        //var res = _oracleAPI.GetUserIdLocaleIdByUserName(usr.ca_bsi_account);
                        var res = _dbcontext.TUsers.FirstOrDefault(u => u.user_id == usr.ca_bsi_user_id && u.user_status == "ACTIVE" );
                        if (res != null)
                        {
                            _dbcontext.Sessions.Add(new T_Session()
                            {
                                //user_id = res.Item1,
                                user_id = res.user_id,
                                user_name = usr.ca_bsi_account,
                                login_time = DateTime.Now,
                                session_token = token,
                                expire_time = DateTime.Now.AddMinutes(getSessionTimeOut())
                            });
                            _dbcontext.SaveChanges();
                            _cache.Remove("Permission_"+res.user_id);
                            var permissions=_infomationAPI.GetPermissionsByUserId(res.user_id).Select(o => o.Code).ToList();
                            _cache.GetOrCreate("Permission_"+res.user_id, entry => permissions);
                            return new LoginResultDTO()
                            {
                                Token = token,
                                UserID = res.user_id,
                                LocaleID = res.user_locale_id,
                                UserEmail= usr.mail,
                                UserName=usr.ca_bsi_account,
                                Permissions= permissions
                            };
                            
                        }
                    }
                }
                return null;
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public void Logout(string token)
        {
            try
            {
                var sesison=_dbcontext.Sessions.Single(o => o.session_token == token);
                sesison.login_time = DateTime.Now;
                _dbcontext.SaveChanges();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public bool ResetPassword(string username, string email)
        {
            try
            {
                var usr = _dbcontext.CatalogUsers.FirstOrDefault(o => o.ca_bsi_account == username && o.mail == email);
                if (usr != null)
                {
                    var randomPassword = RandomString(10);
                    usr.password = sha256_hash(randomPassword);
                    _dbcontext.SaveChanges();

                    List<string> listRecipients = new List<string>();
                    listRecipients.Add(email);
                    var emailSubject = "[KPI Management] Reset Password";
                    var emailBody = "<html>Nuova password: <b>" + randomPassword + "</b></html>";
                    return _smtpService.SendEmail(emailSubject, emailBody, listRecipients);
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            return false;
        }

        public int ArchiveKPIs(ArchiveKPIDTO dto)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();
                    var sp = @"save_record";
                    var command = new NpgsqlCommand(sp, con);
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue(":_name_kpi", dto.kpi_name);
                    command.Parameters.AddWithValue(":_interval_kpi", dto.kpi_interval);
                    command.Parameters.AddWithValue(":_value_kpi", dto.kpi_value);
                    command.Parameters.AddWithValue(":_ticket_id", dto.ticket_id);
                    command.Parameters.AddWithValue(":_close_timestamp_ticket", dto.ticket_close_timestamp);
                    command.Parameters.AddWithValue(":_archived", dto.isarchived);
                    command.Parameters.AddWithValue(":_raw_data_ids", dto.raw_data_ids);
                    var reader = (int)command.ExecuteScalar();
                    return reader;
                }
            }
            catch (Exception e)
            {
                throw e;
            }     
        }

        public bool AddArchiveRawData(int global_rule_id, string period, string tracking_period)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var query = @"select r.rule_id from t_rules r left join t_sla_versions sv on r.sla_version_id = sv.sla_version_id left join t_slas s on sv.sla_id = s.sla_id where sv.sla_status = 'EFFECTIVE' and s.sla_status = 'EFFECTIVE' and r.global_rule_id = :global_rule_id";
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":global_rule_id", global_rule_id);
                    using (var reader = command.ExecuteReader())
                    {
                        int rule_id = 0;
                        while (reader.Read())
                        {
                            rule_id = (reader.IsDBNull(reader.GetOrdinal("rule_id")) ? 0 : reader.GetInt32(reader.GetOrdinal("rule_id")));
                        }
                        if(rule_id == 0) { return false;  } // EXIT IF NO RULE_ID

                        List<EventResourceDTO> eventResource = GetEventResourceFromRule(rule_id);
                        string completewhereStatement = "";
                        var whereStatements = new List<string>();
                        foreach (var d in eventResource)
                        {
                            if (d.ResourceId == -1)
                            {
                                whereStatements.Add(string.Format("(event_type_id={0})", d.EventId));
                            }
                            else
                            {
                                whereStatements.Add(string.Format("(resource_id={0} AND event_type_id={1})", d.ResourceId, d.EventId));
                            }
                        }
                        if (eventResource.Any())
                        {
                            completewhereStatement = string.Format(" AND ({0})", string.Join(" OR ", whereStatements));
                        }else{ return false; } //EXIT IF NO eventResource
                        List<string> periods = new List<string>();
                        string month = period.Split('/').First();
                        string year = "20"+period.Split('/').Last();
                        switch (tracking_period)
                        {
                            case "TRIMESTRALE":
                                if (month == "03"){ periods.Add(year + "_01"); periods.Add(year + "_02"); periods.Add(year + "_03"); }
                                if (month == "06"){ periods.Add(year + "_04"); periods.Add(year + "_05"); periods.Add(year + "_06"); }
                                if (month == "09"){ periods.Add(year + "_07"); periods.Add(year + "_08"); periods.Add(year + "_09"); }
                                if (month == "12"){ periods.Add(year + "_10"); periods.Add(year + "_11"); periods.Add(year + "_12"); }
                                break;
                            case "QUADRIMESTRALE":
                                if (month == "04") { periods.Add(year + "_01"); periods.Add(year + "_02"); periods.Add(year + "_03"); periods.Add(year + "_04"); }
                                if (month == "08") { periods.Add(year + "_05"); periods.Add(year + "_06"); periods.Add(year + "_07"); periods.Add(year + "_08"); }
                                if (month == "12") { periods.Add(year + "_09"); periods.Add(year + "_10"); periods.Add(year + "_11"); periods.Add(year + "_12"); }
                                break;
                            case "SEMESTRALE":
                                if (month == "06") { periods.Add(year + "_01"); periods.Add(year + "_02"); periods.Add(year + "_03"); periods.Add(year + "_04"); periods.Add(year + "_05"); periods.Add(year + "_06"); }
                                if (month == "12") { periods.Add(year + "_07"); periods.Add(year + "_08"); periods.Add(year + "_09"); periods.Add(year + "_10"); periods.Add(year + "_11"); periods.Add(year + "_12"); }
                                break;
                            case "ANNUALE":
                                if (month == "12") { periods.Add(year + "_01"); periods.Add(year + "_02"); periods.Add(year + "_03"); periods.Add(year + "_04"); periods.Add(year + "_05"); periods.Add(year + "_06"); periods.Add(year + "_07"); periods.Add(year + "_08"); periods.Add(year + "_09"); periods.Add(year + "_10"); periods.Add(year + "_11"); periods.Add(year + "_12"); }
                                break;
                            default:
                                periods.Add(year + "_" + month);
                                break;
                        }

                        foreach(var tmp_period in periods)
                        {
                            using (var conOrig = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                            {
                                conOrig.Open();
                                var sp = @"insert into t_dt_de_archive_swap (created_by, event_type_id, reader_time_stamp, resource_id, time_stamp, data_source_id, raw_data_id, create_date, corrected_by, data, modify_date, reader_id, event_source_type_id, event_state_id, partner_raw_data_id, hash_data_key, global_rule_id) select created_by, event_type_id, reader_time_stamp, resource_id, time_stamp, data_source_id, raw_data_id, create_date, corrected_by, data, modify_date, reader_id, event_source_type_id, event_state_id, partner_raw_data_id, hash_data_key, " + global_rule_id + " as global_rule_id from t_dt_de_3_" + tmp_period + " WHERE 1=1 " + completewhereStatement;
                                var commandOrig = new NpgsqlCommand(sp, conOrig);
                                commandOrig.CommandType = CommandType.Text;
                                commandOrig.ExecuteScalar();
                                conOrig.Close();
                            }
                        }
                    }
                }
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public void AddArchiveKPI(ARulesDTO dto)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();
                    var sp = @"insert into a_rules (id_kpi,name_kpi,interval_kpi,value_kpi,ticket_id,close_timestamp_ticket,archived,customer_name,contract_name,kpi_name_bsi,rule_id_bsi,global_rule_id,tracking_period,symbol) values (:id_kpi,:name_kpi,:interval_kpi,:value_kpi,:ticket_id,:close_timestamp_ticket,:archived,:customer_name,:contract_name,:kpi_name_bsi,:rule_id_bsi,:global_rule_id,:tracking_period,:symbol)";
                    var command = new NpgsqlCommand(sp, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":id_kpi", dto.id_kpi);
                    command.Parameters.AddWithValue(":name_kpi", dto.name_kpi);
                    command.Parameters.AddWithValue(":interval_kpi", dto.interval_kpi);
                    command.Parameters.AddWithValue(":value_kpi", dto.value_kpi);
                    command.Parameters.AddWithValue(":ticket_id", dto.ticket_id);
                    command.Parameters.AddWithValue(":close_timestamp_ticket", dto.close_timestamp_ticket);
                    command.Parameters.AddWithValue(":archived", dto.archived);
                    command.Parameters.AddWithValue(":customer_name", dto.customer_name);
                    command.Parameters.AddWithValue(":contract_name", dto.contract_name);
                    command.Parameters.AddWithValue(":kpi_name_bsi", dto.kpi_name_bsi);
                    command.Parameters.AddWithValue(":rule_id_bsi", dto.rule_id_bsi);
                    command.Parameters.AddWithValue(":global_rule_id", dto.global_rule_id);
                    command.Parameters.AddWithValue(":tracking_period", dto.tracking_period);
                    command.Parameters.AddWithValue(":symbol", dto.symbol);
                    command.ExecuteScalar();
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<ARulesDTO> GetAllArchivedKPIs(string month, string year, string id_kpi,List<int> globalruleIds)
        {
            try
            {
                if (!globalruleIds.Any() || globalruleIds == null )
                {
                    return new List<ARulesDTO>();
                }
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();

                    var whereclause = " and (interval_kpi >=:interval_kpi and interval_kpi < (  :interval_kpi + interval '1 month') )";
                    var whereYear = " and (interval_kpi >=:interval_kpi and interval_kpi < (  :interval_kpi + interval '1 year') )";
                    var filterByKpiId = " and global_rule_id = :global_rule_id";
                    var sp = @"select * from a_rules where 1=1";
                    if ( (month != null && month != "00") && (year != null))
                    {
                        sp += whereclause;
                    }
                    if( (month == "00" || month == null) && (year != null))
                    {
                        sp += whereYear;
                    }
                    if (id_kpi != null )
                    {
                        sp += filterByKpiId;
                    }
                    sp += " and global_rule_id in (" +string.Join(',',globalruleIds) + ")";
                    sp += " order by close_timestamp_ticket desc";
                    var command = new NpgsqlCommand(sp, con);

                    if ((month != null && month != "00") && (year != null))
                    {
                        command.Parameters.AddWithValue(":interval_kpi", new NpgsqlTypes.NpgsqlDate(Int32.Parse(year), Int32.Parse(month), Int32.Parse("01")));
                    }
                    if ((month == "00" || month == null) && (year != null))
                    {
                        command.Parameters.AddWithValue(":interval_kpi", new NpgsqlTypes.NpgsqlDate(Int32.Parse(year), Int32.Parse("01"), Int32.Parse("01")));
                    }
                    if ((id_kpi != null))
                    {
                        command.Parameters.AddWithValue(":global_rule_id", Int32.Parse(id_kpi));
                    }
                    using (var reader = command.ExecuteReader())
                    {
                        List<ARulesDTO> list = new List<ARulesDTO>();
                        while (reader.Read())
                        {
                            ARulesDTO arules = new ARulesDTO();
                            arules.id_kpi = reader.GetString(reader.GetOrdinal("id_kpi"));
                            arules.name_kpi = reader.GetString(reader.GetOrdinal("name_kpi"));
                            arules.interval_kpi = reader.GetDateTime(reader.GetOrdinal("interval_kpi"));
                            arules.value_kpi = reader.GetString(reader.GetOrdinal("value_kpi"));
                            arules.ticket_id = reader.GetInt32(reader.GetOrdinal("ticket_id"));
                            arules.close_timestamp_ticket = reader.GetDateTime(reader.GetOrdinal("close_timestamp_ticket"));
                            arules.archived = reader.GetBoolean(reader.GetOrdinal("archived"));
                            arules.customer_name = reader.GetString(reader.GetOrdinal("customer_name"));
                            arules.contract_name = reader.GetString(reader.GetOrdinal("contract_name"));
                            arules.kpi_name_bsi = reader.GetString(reader.GetOrdinal("kpi_name_bsi"));
                            arules.rule_id_bsi = reader.GetInt32(reader.GetOrdinal("rule_id_bsi"));
                            arules.global_rule_id = reader.GetInt32(reader.GetOrdinal("global_rule_id"));
                            arules.tracking_period = reader.GetString(reader.GetOrdinal("tracking_period"));
                            arules.symbol = (reader.IsDBNull(reader.GetOrdinal("symbol")) ? null : reader.GetString(reader.GetOrdinal("symbol")));
                            list.Add(arules);
                        }
                        return list;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public CreateTicketDTO GetKPICredentialToCreateTicket(int Id)
        {
            try
            {
                var kpi = _dbcontext.CatalogKpi.Include(o=>o.PrimaryCustomer).Include(o=>o.SecondaryCustomer).FirstOrDefault(o => o.id == Id);
                var psl = _oracleAPI.GetPsl(DateTime.Now.AddMonths(-1).ToString("MM/yy"), kpi.global_rule_id_bsi, kpi.tracking_period);
                string contractPartyName = (kpi.SecondaryCustomer == null) ? kpi.PrimaryCustomer.customer_name : kpi.PrimaryCustomer.customer_name + string.Format(" ({0})", kpi.SecondaryCustomer.customer_name);
                return new CreateTicketDTO()
                {
                    Description = GenerateDiscriptionFromKPI(kpi, (psl != null)?psl.FirstOrDefault().result.Contains("[Non Calcolato]")?"[Non Calcolato]":psl.FirstOrDefault().provided_ce + " " + psl.FirstOrDefault().symbol + " " + psl.FirstOrDefault().result:"[Non Calcolato]"),
                    ID_KPI = kpi.id_kpi,
                    GroupCategoryId=kpi.primary_contract_party,
                    Period = DateTime.Now.AddMonths(-1).ToString("MM/yy"),
                    Reference1 = kpi.referent_1,
                    Reference2 = kpi.referent_2,
                    Reference3 = kpi.referent_3,
                    Summary=kpi.id_kpi+"|"+kpi.kpi_name_bsi+"|"+kpi.contract+"|"+ contractPartyName,
                    zz1_contractParties = kpi.primary_contract_party + "|" + (kpi.secondary_contract_party == null ? "" : kpi.secondary_contract_party.ToString()),
                    zz2_calcValue= 
                        (psl != null) ? 
                        psl.FirstOrDefault().result.Contains("[Non Calcolato]") ? "[Non Calcolato]"
                        : psl.FirstOrDefault().provided_ce + " " + psl.FirstOrDefault().symbol + " " + psl.FirstOrDefault().result 
                        :
                        "[Non Calcolato]",
                    zz3_KpiIds=kpi.id+"|"+kpi.global_rule_id_bsi
                };

            }
            catch (Exception e)
            {
                throw e;
            }

        }
        private string GenerateDiscriptionFromKPI(T_CatalogKPI kpi,string calc)
        {
            string skeleton = "INDICATORE: {0}\n" +
                "DESCRIZIONE: {1}\n" +
                "ESCALATION: {2}\n" +
                "TARGET: {3}\n" +
                "TIPILOGIA: {4}\n" +
                "VALORE: {5}\n" +
                "AUTORE: {6}\n" +
                "FREQUENZA: {7}";
            return string.Format(skeleton, kpi.kpi_name_bsi ?? "", kpi.kpi_description ?? "", kpi.escalation ?? "", kpi.target ?? "", kpi.kpi_type ?? "", calc, kpi.source_name ?? "", kpi.tracking_period ?? "");
        }

        public List<ATDtDeDTO> GetRawDataByKpiID(string id_kpi, string month, string year)
        {
            try
            {
                List<ATDtDeDTO> list = new List<ATDtDeDTO>();
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var query = @"select r.rule_id from t_rules r left join t_sla_versions sv on r.sla_version_id = sv.sla_version_id left join t_slas s on sv.sla_id = s.sla_id where sv.sla_status = 'EFFECTIVE' and s.sla_status = 'EFFECTIVE' and r.global_rule_id = :global_rule_id";
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":global_rule_id", Int32.Parse(id_kpi));
                    using (var readerTmp = command.ExecuteReader())
                    {
                        int rule_id = 0;
                        while (readerTmp.Read())
                        {
                            rule_id = (readerTmp.IsDBNull(readerTmp.GetOrdinal("rule_id")) ? 0 : readerTmp.GetInt32(readerTmp.GetOrdinal("rule_id")));
                        }
                        if (rule_id == 0) { return list; } // EXIT IF NO RULE_ID

                        List<EventResourceDTO> eventResource = GetEventResourceFromRule(rule_id);
                        string completewhereStatement = "";
                        var whereStatements = new List<string>();
                        foreach (var d in eventResource)
                        {
                            if (d.ResourceId == -1)
                            {
                                whereStatements.Add(string.Format("(event_type_id={0})", d.EventId));
                            }
                            else
                            {
                                whereStatements.Add(string.Format("(resource_id={0} AND event_type_id={1})", d.ResourceId, d.EventId));
                            }
                        }
                        if (eventResource.Any())
                        {
                            completewhereStatement = string.Format(" AND ({0})", string.Join(" OR ", whereStatements));
                        }
                        else { return list; } //EXIT IF NO eventResource



                        
                        using (var con2 = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                        {
                            con2.Open();
                            var tablename2 = "t_dt_de_3_" + year + "_" + month;
                            var sp2 = @"select * from " + tablename2 + " where 1=1 " + completewhereStatement + " order by modify_date desc ";
                            var command2 = new NpgsqlCommand(sp2, con2);
                            using (var reader = command2.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    ATDtDeDTO atdtde = new ATDtDeDTO();
                                    atdtde.created_by = reader.GetInt32(reader.GetOrdinal("created_by"));
                                    atdtde.event_type_id = reader.GetInt32(reader.GetOrdinal("event_type_id"));
                                    atdtde.reader_time_stamp = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("reader_time_stamp")));
                                    atdtde.resource_id = reader.GetInt32(reader.GetOrdinal("resource_id"));
                                    atdtde.time_stamp = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("time_stamp")));
                                    atdtde.data_source_id = (reader.IsDBNull(reader.GetOrdinal("data_source_id")) ? null : reader.GetString(reader.GetOrdinal("data_source_id")));
                                    atdtde.raw_data_id = reader.GetInt32(reader.GetOrdinal("raw_data_id"));
                                    atdtde.create_date = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("create_date")));
                                    atdtde.corrected_by = reader.GetInt32(reader.GetOrdinal("corrected_by"));
                                    atdtde.data = reader.GetString(reader.GetOrdinal("data"));
                                    atdtde.modify_date = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("modify_date")));
                                    atdtde.reader_id = reader.GetInt32(reader.GetOrdinal("reader_id"));
                                    atdtde.event_source_type_id = (reader.IsDBNull(reader.GetOrdinal("event_source_type_id")) ? null : reader.GetInt32(reader.GetOrdinal("event_source_type_id")).ToString());
                                    atdtde.event_state_id = reader.GetInt32(reader.GetOrdinal("event_state_id"));
                                    atdtde.partner_raw_data_id = reader.GetInt32(reader.GetOrdinal("partner_raw_data_id"));
                                    atdtde.hash_data_key = (reader.IsDBNull(reader.GetOrdinal("hash_data_key")) ? null : reader.GetString(reader.GetOrdinal("hash_data_key")));
                                    atdtde.id_kpi = id_kpi;//reader.GetInt32(reader.GetOrdinal("id_kpi"));
                                    list.Add(atdtde);
                                }
                            }
                        }
                    }
                }
                return list;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<ATDtDeDTO> GetArchivedRawDataByKpiID(string id_kpi, string month, string year)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();
                    List<ATDtDeDTO> list = new List<ATDtDeDTO>();
                    var tablename = "a_dt_de_" + year + "_" + month;
                    if (TableExists(tablename))
                    {
                    var sp = @"select * from " + tablename + " WHERE global_rule_id = :global_rule_id order by modify_date desc";
                    var command = new NpgsqlCommand(sp, con);
                    command.Parameters.AddWithValue(":global_rule_id", Int32.Parse(id_kpi));
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            ATDtDeDTO atdtde = new ATDtDeDTO();
                            atdtde.created_by = reader.GetInt32(reader.GetOrdinal("created_by"));
                            atdtde.event_type_id = reader.GetInt32(reader.GetOrdinal("event_type_id"));
                            atdtde.reader_time_stamp = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("reader_time_stamp")));
                            atdtde.resource_id = reader.GetInt32(reader.GetOrdinal("resource_id"));
                            atdtde.time_stamp = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("time_stamp")));
                            atdtde.data_source_id = (reader.IsDBNull(reader.GetOrdinal("data_source_id")) ? null : reader.GetString(reader.GetOrdinal("data_source_id")));
                            atdtde.raw_data_id = reader.GetInt32(reader.GetOrdinal("raw_data_id"));
                            atdtde.create_date = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("create_date")));
                            atdtde.corrected_by = reader.GetInt32(reader.GetOrdinal("corrected_by"));
                            atdtde.data = reader.GetString(reader.GetOrdinal("data"));
                            atdtde.modify_date = Convert.ToDateTime(reader.GetDateTime(reader.GetOrdinal("modify_date")));
                            atdtde.reader_id = reader.GetInt32(reader.GetOrdinal("reader_id"));
                            atdtde.event_source_type_id = (reader.IsDBNull(reader.GetOrdinal("event_source_type_id")) ? null : reader.GetInt32(reader.GetOrdinal("event_source_type_id")).ToString());
                            atdtde.event_state_id = reader.GetInt32(reader.GetOrdinal("event_state_id"));
                            atdtde.partner_raw_data_id = reader.GetInt32(reader.GetOrdinal("partner_raw_data_id"));
                            atdtde.hash_data_key = (reader.IsDBNull(reader.GetOrdinal("hash_data_key")) ? null : reader.GetString(reader.GetOrdinal("hash_data_key")));
                            atdtde.id_kpi = id_kpi;//reader.GetInt32(reader.GetOrdinal("id_kpi"));
                            list.Add(atdtde);
                        }
                    }
                    }
                    return list;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
 /*       public List<ATDtDeDTO> GetDetailsArchiveKPI(int idkpi, string month, string year) // NON USATA
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();
                    List<ATDtDeDTO> list = new List<ATDtDeDTO>();
                    var tablename = "a_t_dt_de_" + idkpi + "_" + year + "_" + month ;

                    if( TableExists(tablename))
                    {
                        var sp = @"select * from " + tablename;

                        var command = new NpgsqlCommand(sp, con);

                        using (var reader = command.ExecuteReader())
                        {
                            
                            while (reader.Read())
                            {
                                //created_by | event_type_id | reader_time_stamp | resource_id | time_stamp | data_source_id | raw_data_id | create_date | corrected_by | data | modify_date | reader_id | event_source_type_id | event_state_id | partner_raw_data_id | hash_data_key | id_kpi
                                ATDtDeDTO atdtde = new ATDtDeDTO();
                                atdtde.created_by = reader.GetInt32(reader.GetOrdinal("created_by"));
                                atdtde.event_type_id = reader.GetInt32(reader.GetOrdinal("event_type_id"));
                                atdtde.reader_time_stamp = reader.GetDateTime(reader.GetOrdinal("reader_time_stamp"));
                                atdtde.resource_id = reader.GetInt32(reader.GetOrdinal("resource_id"));
                                atdtde.time_stamp = reader.GetDateTime(reader.GetOrdinal("time_stamp"));
                                atdtde.data_source_id = reader.GetString(reader.GetOrdinal("data_source_id"));
                                atdtde.raw_data_id = reader.GetInt32(reader.GetOrdinal("raw_data_id"));
                                atdtde.create_date = reader.GetDateTime(reader.GetOrdinal("create_date"));
                                atdtde.corrected_by = reader.GetInt32(reader.GetOrdinal("corrected_by"));
                                atdtde.data = reader.GetString(reader.GetOrdinal("data"));
                                atdtde.modify_date = reader.GetDateTime(reader.GetOrdinal("modify_date"));
                                atdtde.reader_id = reader.GetInt32(reader.GetOrdinal("reader_id"));
                                atdtde.event_source_type_id = reader.GetInt32(reader.GetOrdinal("event_source_type_id")).ToString();
                                atdtde.event_state_id = reader.GetInt32(reader.GetOrdinal("event_state_id"));
                                atdtde.partner_raw_data_id = reader.GetInt32(reader.GetOrdinal("partner_raw_data_id"));
                                atdtde.hash_data_key = reader.GetString(reader.GetOrdinal("hash_data_key"));
                                atdtde.id_kpi = reader.GetString(reader.GetOrdinal("id_kpi"));

                                list.Add(atdtde);
                            }                     
                        }
                    }

                    return list;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        } */
        public List<FormAttachmentDTO> GetAttachmentsByKPIID(int kpiId)
        {
            try
            {
                var kpi = _dbcontext.CatalogKpi.Single(o => o.id == kpiId);
                var form= kpi.id_form;
                if (form==null || form == 0)
                {
                    return new List<FormAttachmentDTO>();
                }
                var attachments = _dbcontext.Forms.Include(o => o.Attachments).Single(p => p.form_id == form).Attachments;
                if (kpi.month != null)
                {
                    if (kpi.month.Split(',').Count() == 12)
                    {
                        attachments = attachments.Where(o =>o.create_date.Year==DateTime.Now.AddMonths(-1).Year && o.create_date.Month == DateTime.Now.AddMonths(-1).Month).ToList();
                    }
                    else if (kpi.month.Split(',').Count() == 4)
                    {
                        attachments = attachments.Where(o => o.create_date.Year == DateTime.Now.AddMonths(-1).Year && o.create_date.Month <= DateTime.Now.AddMonths(-1).Month && o.create_date.Month >= DateTime.Now.AddMonths(-4).Month).ToList();
                    }
                    else if(kpi.month.Split(',').Count() == 2)
                    {
                        attachments = attachments.Where(o => o.create_date.Year == DateTime.Now.AddMonths(-1).Year && o.create_date.Month <= DateTime.Now.AddMonths(-1).Month && o.create_date.Month >= DateTime.Now.AddMonths(-7).Month).ToList();
                    }
                }
                return _fromAttachmentMapper.GetDTOs(attachments.ToList()).OrderByDescending(o=>o.create_date).ToList();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<KeyValuePair<int,string>> GetKPITitolo(List<int> ids)
        {
            try
            {
                var form = _dbcontext.CatalogKpi.Where(o=>ids.Contains(o.id));
                return form.Select(o => new KeyValuePair<int, string>(o.id, o.short_name)).ToList();
              

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<EmailNotifierDTO> GetEmailNotifiers(string period)
        {
            try
            {
                var split = period.Split('/');
                var month = split[0];
                var year = split[1];
                var notifiers = month.Length > 0 ?
                        _dbcontext.EmailNotifiers.Include(o => o.Form).Where(p => p.notify_date.ToString("MM/yy") == period).ToList()
                    :   _dbcontext.EmailNotifiers.Include(o => o.Form).Where(p => p.notify_date.ToString("yy") == year).ToList();

                
                return notifiers.Select(o => new EmailNotifierDTO()
                {
                    email_body = o.email_body,
                    id = o.id,
                    form_name = o.Form.form_name,
                    notify_date = o.notify_date,
                    period = o.period,
                    recipient = o.recipient,
                    type = o.type,
                    user_domain = o.user_domain
                }).ToList();

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<TUserDTO> GetAllTUsers()
        {
            try
            {
                var usr = _dbcontext.TUsers.Where(o => o.in_catalog==false && (o.user_status == "ACTIVE" || o.user_status == "INACTIVE") && o.user_organization_name != "INTERNAL").OrderByDescending(o => o.user_create_date);
                var dtos = usr.Select(o => new TUserDTO()
                {
                    user_email = o.user_email,
                    user_id = o.user_id,
                    user_locale_id = o.user_locale_id,
                    user_name = o.user_name,
                    user_status = o.user_status,
                    user_organization_name = o.user_organization_name
                }).ToList();
                return dtos;

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<TRuleDTO> GetAllTRules()
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    List<TRuleDTO> list = new List<TRuleDTO>();

                    var sp = @"select r.rule_id, r.global_rule_id, r.rule_name, r.rule_description, r.sla_version_id, r.service_level_target, r.rule_create_date, r.rule_modify_date, sv.sla_id, s.sla_name, sv.version_number, s.customer_id as primary_contract_party_id, c.customer_name as primary_contract_party_name, s.additional_customer_id as secondary_contract_party_id, c2.customer_name as secondary_contract_party_name
                            from t_rules r
                            left join t_sla_versions sv on r.sla_version_id = sv.sla_version_id
                            left join t_global_rules gr on r.global_rule_id = gr.global_rule_id
                            left join t_slas s on sv.sla_id = s.sla_id
                            left join t_customers c on s.customer_id = c.customer_id
                            left join t_customers c2 on s.additional_customer_id = c2.customer_id
                            where sv.sla_status = 'EFFECTIVE' and r.is_effective = 'Y' and s.sla_status = 'EFFECTIVE' and gr.in_catalog = false order by s.sla_name, r.rule_name";
                    var command = new NpgsqlCommand(sp, con);
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        { 
                            TRuleDTO tRule = new TRuleDTO();
                            tRule.rule_id = reader.GetInt32(reader.GetOrdinal("rule_id"));
                            tRule.global_rule_id = reader.GetInt32(reader.GetOrdinal("global_rule_id"));
                            tRule.rule_name = reader.GetString(reader.GetOrdinal("rule_name"));
                            tRule.rule_description = (reader.IsDBNull(reader.GetOrdinal("rule_description")) ? null : reader.GetString(reader.GetOrdinal("rule_description")));
                            tRule.create_date = reader.GetDateTime(reader.GetOrdinal("rule_create_date"));
                            tRule.modify_date = reader.GetDateTime(reader.GetOrdinal("rule_modify_date"));
                            tRule.sla_version_id = reader.GetInt32(reader.GetOrdinal("sla_version_id"));
                            tRule.service_level_target = (reader.IsDBNull(reader.GetOrdinal("service_level_target")) ? 0 : reader.GetDouble(reader.GetOrdinal("service_level_target")));
                            tRule.sla_id = reader.GetInt32(reader.GetOrdinal("sla_id"));
                            tRule.sla_name = reader.GetString(reader.GetOrdinal("sla_name"));
                            tRule.version_number = reader.GetInt32(reader.GetOrdinal("version_number"));
                            tRule.primary_contract_party_id = reader.GetInt32(reader.GetOrdinal("primary_contract_party_id"));
                            tRule.primary_contract_party_name = reader.GetString(reader.GetOrdinal("primary_contract_party_name"));
                            tRule.secondary_contract_party_id = (reader.IsDBNull(reader.GetOrdinal("secondary_contract_party_id")) ? 0 : reader.GetInt32(reader.GetOrdinal("secondary_contract_party_id")));
                            tRule.secondary_contract_party_name = (reader.IsDBNull(reader.GetOrdinal("secondary_contract_party_name")) ? null : reader.GetString(reader.GetOrdinal("secondary_contract_party_name")));
                            list.Add(tRule);
                        }
                    }
                    return list;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        #region privateFunctions

 /*       private List<int> GetRawIdsFromResource(List<EventResourceDTO> dto, string period)
        {
            try
            {

                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var output = new List<int>();
                    var month = period.Split('/').FirstOrDefault();
                    var year = "20" + period.Split('/').LastOrDefault();
                    string completewhereStatement = "";
                    var whereStatements = new List<string>();
                    foreach (var d in dto)
                    {
                        if (d.ResourceId == -1)
                        {
                            whereStatements.Add(string.Format("(event_type_id={0})", d.EventId));
                        }
                        else
                        {
                            whereStatements.Add(string.Format("(resource_id={0} AND event_type_id={1})", d.ResourceId, d.EventId));
                        }

                    }
                    if (dto.Any())
                    {
                        completewhereStatement = string.Format(" AND ({0})", string.Join(" OR ", whereStatements));
                    }
                    var sp = string.Format("Select event_type_id,resource_id,raw_data_id from t_dt_de_3_{0}_{1} where 1=1 {2}", year, month, completewhereStatement);
                    var command = new NpgsqlCommand(sp, con);
                    using (var reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            output.Add(reader.GetInt32(reader.GetOrdinal("raw_data_id")));
                        }

                        return output;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }*/

        private bool CallFormAdapter(FormAdapterDTO dto)
        {
            using (var client = new HttpClient())
            {
                var con = GetBSIServerURL();
                var apiPath = "/api/FormAdapter/RunAdapter";
                var output = QuantisUtilities.FixHttpURLForCall(con, apiPath);
                client.BaseAddress = new Uri(output.Item1);
                var dataAsString = JsonConvert.SerializeObject(dto);
                var content = new StringContent(dataAsString);
                content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                var response =client.PostAsync(output.Item2, content).Result;
                if (response.IsSuccessStatusCode)
                {
                    var res = response.Content.ReadAsStringAsync().Result;
                    if ( res== "2" || res=="1" || res=="3")
                    {
                        return true;
                    }
                    else
                    {
                        throw new Exception("The return from Form Adapter is not valid value is:" +res);

                    }
                }
                else
                {
                    throw new Exception(string.Format("Call to form adapter has failed. BaseURL: {0} APIPath: {1} Data:{2}",output.Item1,output.Item2,dataAsString));
                }

            }
        }
        private int getSessionTimeOut()
        {
            var session = _infomationAPI.GetConfiguration("be_restserver","session_timeout");            
            if (session != null)
            {
                int value = Int32.Parse(session.Value);
                return value;
            }
            return 15;
        }
        private string MD5Hash(string input)
        {
            StringBuilder hash = new StringBuilder();
            MD5CryptoServiceProvider md5provider = new MD5CryptoServiceProvider();
            byte[] bytes = md5provider.ComputeHash(new UTF8Encoding().GetBytes(input));

            for (int i = 0; i < bytes.Length; i++)
            {
                hash.Append(bytes[i].ToString("x2"));
            }
            return hash.ToString();
        }
        private string RandomString(int size)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var stringChars = new char[size];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            var finalString = new String(stringChars);
            return finalString;
        }
        private string sha256_hash(string value)
        {
            StringBuilder Sb = new StringBuilder();
            using (var hash = SHA256.Create())
            {
                Encoding enc = Encoding.UTF8;
                Byte[] result = hash.ComputeHash(enc.GetBytes(value));

                foreach (Byte b in result)
                    Sb.Append(b.ToString("x2"));
            }
            return Sb.ToString();
        }


        private bool TableExists(string tableName)
        {
            string sql = "SELECT * FROM information_schema.tables WHERE table_name = '" + tableName + "'";
            using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
            {
                using (var cmd = new NpgsqlCommand(sql))
                {
                    if (cmd.Connection == null)
                        cmd.Connection = con;
                    if (cmd.Connection.State != ConnectionState.Open)
                        cmd.Connection.Open();

                    lock (cmd)
                    {
                        using (NpgsqlDataReader rdr = cmd.ExecuteReader())
                        {
                            try
                            {
                                if (rdr != null && rdr.HasRows)
                                    return true;
                                return false;
                            }
                            catch (Exception)
                            {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        private IQueryable<T_CatalogUser> CreateGetUserQuery(UserFilterDTO filter)
        {
            var users = _dbcontext.CatalogUsers as IQueryable<T_CatalogUser>;
            if (!string.IsNullOrEmpty(filter.SearchText))
            {
                users = users.Where(o => o.name.Contains(filter.SearchText) ||
                o.surname.Contains(filter.SearchText)||
                o.ca_bsi_account.Contains(filter.SearchText) ||
                o.organization.Contains(filter.SearchText) ||
                o.mail.Contains(filter.SearchText) ||
                o.manager.Contains(filter.SearchText));
            }
            if (!string.IsNullOrEmpty(filter.Name))
            {
                users = users.Where(o => o.name.Contains(filter.Name));
            }
            if (!string.IsNullOrEmpty(filter.Surname))
            {
                users = users.Where(o => o.surname.Contains(filter.Surname));
            }
            return users;
        }

        #endregion
    }
}

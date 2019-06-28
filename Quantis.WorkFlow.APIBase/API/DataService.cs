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
        public List<Tuple<int,int>> GetFormAttachmentCount(List<int> formids)
        {
            try
            {
                return _dbcontext.Forms.Include(p => p.Attachments).Where(o => formids.Contains(o.form_id)).Select(o => new Tuple<int, int>(o.form_id, o.Attachments.Count)).ToList();
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
        public bool AddUpdateKpi(CatalogKpiDTO dto)
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
                var kpis = _dbcontext.CatalogKpi.ToList();
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
                var kpi = _dbcontext.CatalogKpi.FirstOrDefault(o => o.id == Id);
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

        public KPIOnlyContractDTO GetKpiByFormId(int Id)
        {
            try
            {
                var kpi = _dbcontext.Forms.Include(o => o.CatalogKPI).Single(o => o.form_id == Id);
                if (kpi.CatalogKPI == null)
                {
                    return null;
                }
                var dto = new KPIOnlyContractDTO()
                {
                    contract = kpi.CatalogKPI.contract,
                    id_kpi = kpi.CatalogKPI.id_kpi,
                    global_rule_id = kpi.CatalogKPI.global_rule_id_bsi,
                    kpi_name_bsi = kpi.CatalogKPI.kpi_name_bsi,
                    target = kpi.CatalogKPI.target
                };
                return dto;

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
                var forms = _dbcontext.Forms.ToList();
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
                    var form=_dbcontext.Forms.Single(o => o.form_id == dto.form_id);
                    if (form != null)
                    {
                        form.modify_date = DateTime.Now;
                        _dbcontext.SaveChanges(false);
                    }
                    _dbcontext.FormLogs.Add(form_log);
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
                return dtos;
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
                        var res = _dbcontext.TUsers.FirstOrDefault(u => u.user_id == usr.ca_bsi_user_id);
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
                                IsAdmin = usr.user_admin,
                                IsSuperAdmin = usr.user_sadmin,
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
        
        public List<ARulesDTO> GetAllArchiveKPIs(string month, string year, int id_kpi)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlArchivedProvider")))
                {
                    con.Open();

                    var whereclause = " and (interval_kpi >=:interval_kpi and interval_kpi < (  :interval_kpi + interval '1 month') )";
                    var filterByKpiId = " and id_kpi = :id_kpi";
                    var sp = @"select * from a_rules where 1=1";
                    if ( (month != null) && (year != null))
                    {
                        sp += whereclause;
                    }
                    if (id_kpi > 0 )
                    {
                        sp += filterByKpiId;
                    }
                    sp += " order by interval_kpi asc";
                    var command = new NpgsqlCommand(sp, con);

                    if ((month != null) && (year != null))
                    {
                        command.Parameters.AddWithValue(":interval_kpi", new NpgsqlTypes.NpgsqlDate(Int32.Parse(year), Int32.Parse(month), Int32.Parse("01")));
                    }
                    if ((id_kpi > 0))
                    {
                        command.Parameters.AddWithValue(":id_kpi", id_kpi);
                    }
                    using (var reader = command.ExecuteReader())
                    {
                        List<ARulesDTO> list = new List<ARulesDTO>();
                        while (reader.Read())
                        {
                            //id_kpi | name_kpi |    interval_kpi     | value_kpi | ticket_id | close_timestamp_ticket | archived
                            ARulesDTO arules = new ARulesDTO();
                            arules.id_kpi = reader.GetInt32(reader.GetOrdinal("id_kpi"));
                            arules.name_kpi = reader.GetString(reader.GetOrdinal("name_kpi"));
                            arules.interval_kpi = reader.GetDateTime(reader.GetOrdinal("interval_kpi"));
                            arules.value_kpi = reader.GetDouble(reader.GetOrdinal("value_kpi"));
                            arules.ticket_id = reader.GetInt32(reader.GetOrdinal("ticket_id"));
                            arules.close_timestamp_ticket = reader.GetDateTime(reader.GetOrdinal("close_timestamp_ticket"));
                            arules.archived = reader.GetBoolean(reader.GetOrdinal("archived"));

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
                var kpi = _dbcontext.CatalogKpi.FirstOrDefault(o => o.id == Id);
                return new CreateTicketDTO()
                {
                    Description = kpi.kpi_description,
                    ID_KPI = kpi.id_kpi,
                    Group = kpi.group_type,
                    Period = DateTime.Now.AddMonths(-1).Month + "/" + DateTime.Now.AddMonths(-1).Year,
                    Reference1 = kpi.referent_1,
                    Reference2 = kpi.referent_2,
                    Reference3 = kpi.referent_3,
                    Summary=kpi.contract+"|"+kpi.id_kpi,
                    primary_contract_party=kpi.primary_contract_party,
                    secondary_contract_party=kpi.secondary_contract_party
                };

            }
            catch (Exception e)
            {
                throw e;
            }

        }


        public List<ATDtDeDTO> GetRawDataByKpiID(int id_kpi, string month, string year)
        {
            try
            {
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    List<ATDtDeDTO> list = new List<ATDtDeDTO>();
                    var tablename = "t_dt_de_3_" + year + "_" + month;
                    //if (TableExists(tablename))
                    //{
                        var sp = @"select * from " + tablename + " where event_type_id = 1684 LIMIT 100";
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
                                atdtde.data_source_id = null;//reader.GetString(reader.GetOrdinal("data_source_id"));
                                atdtde.raw_data_id = reader.GetInt32(reader.GetOrdinal("raw_data_id"));
                                atdtde.create_date = reader.GetDateTime(reader.GetOrdinal("create_date"));
                                atdtde.corrected_by = reader.GetInt32(reader.GetOrdinal("corrected_by"));
                                atdtde.data = reader.GetString(reader.GetOrdinal("data"));
                                atdtde.modify_date = reader.GetDateTime(reader.GetOrdinal("modify_date"));
                                atdtde.reader_id = reader.GetInt32(reader.GetOrdinal("reader_id"));
                                atdtde.event_source_type_id = reader.GetInt32(reader.GetOrdinal("event_source_type_id"));
                                atdtde.event_state_id = reader.GetInt32(reader.GetOrdinal("event_state_id"));
                                atdtde.partner_raw_data_id = reader.GetInt32(reader.GetOrdinal("partner_raw_data_id"));
                                atdtde.hash_data_key = reader.GetString(reader.GetOrdinal("hash_data_key"));
                                atdtde.id_kpi = id_kpi;//reader.GetInt32(reader.GetOrdinal("id_kpi"));


                                list.Add(atdtde);
                            }
                        }
                    //}
                    return list;
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public List<ATDtDeDTO> GetDetailsArchiveKPI(int idkpi, string month, string year)
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
                                atdtde.event_source_type_id = reader.GetInt32(reader.GetOrdinal("event_source_type_id"));
                                atdtde.event_state_id = reader.GetInt32(reader.GetOrdinal("event_state_id"));
                                atdtde.partner_raw_data_id = reader.GetInt32(reader.GetOrdinal("partner_raw_data_id"));
                                atdtde.hash_data_key = reader.GetString(reader.GetOrdinal("hash_data_key"));
                                atdtde.id_kpi = reader.GetInt32(reader.GetOrdinal("id_kpi"));


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
        public List<FormAttachmentDTO> GetAttachmentsByKPIID(int kpiId)
        {
            try
            {
                var form=_dbcontext.CatalogKpi.Single(o=>o.id==kpiId).id_form;
                if (form == 0)
                {
                    throw new Exception("No form Available for KPI " + kpiId);
                }
                var attachments = _dbcontext.Forms.Include(o => o.Attachments).Single(p => p.form_id == form).Attachments;
                return _fromAttachmentMapper.GetDTOs(attachments.ToList());

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
                var usr = _dbcontext.TUsers.Where(o => o.in_catalog==false && o.user_status == "ACTIVE" && o.user_organization_name != "INTERNAL").OrderByDescending(o => o.user_create_date);
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
        #region privateFunctions

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


        public List<FormConfigurationDTO> GetFormConfiguration()
        {
            string str = "<DataLoadingForms><ControlsXml><Xml>*securestring*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</Xml></ControlsXml></DataLoadingForms>";
            try
            {
                using (var client = new HttpClient())
                {
                    //List<string> data = new List<string>() { dto.primary_contract_party + "", dto.secondary_contract_party + "", dto.contract_name, dto.kpi_name, dto.id_ticket, dto.period, dto.ticket_status };
                    var output = QuantisUtilities.FixHttpURLForCall(GetBSIServerURL(), "/home/APIToWorkflowSample");
                    client.BaseAddress = new Uri(output.Item1);
                    var dataAsString = JsonConvert.SerializeObject(str);
                    var content = new StringContent(dataAsString);
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var response = client.GetAsync(output.Item2).Result;
                    //var response = client.PostAsync(output.Item2, content).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        //if (response.Content.ReadAsStringAsync().Result == "True")
                        //string x = response.Content.ReadAsStringAsync().Result;
                        string xml = response.Content.ReadAsStringAsync().Result;
                        string xml2 = HttpUtility.HtmlEncode(xml);
                        string xml3 = HttpUtility.HtmlDecode(xml);
                        string xml4 = HttpUtility.UrlEncode(xml);
                        string xml5 = HttpUtility.UrlDecode(xml);
                        XDocument xdoc = XDocument.Parse(xml3);
                        var lists = from uoslist in xdoc.Element("DataLoadingForms").Element("ControlsXml").Element("Xml").Element("Controls").Elements("Control") select uoslist;
                        //var labelList = new List<FormConfigurationDTO>();
                        var labelList = lists.Where(o=>o.Attribute("type").Value == "DLFLabel").Select(l => new{
                            a_id = l.Attribute("id").Value,
                            a_top = l.Attribute("top").Value,
                            a_left = l.Attribute("left").Value,
                            a_width = l.Attribute("width").Value,
                            a_height = l.Attribute("height").Value,
                            text = l.Element("text").Value,
                            a_isMandatoryLabel = l.Attribute("isMandatoryLabel").Value,
                            a_type = l.Attribute("type").Value
                        }).ToList();
                        var formfields = lists.Where(o => o.Attribute("type").Value != "DLFLabel").Select(l => new
                        {
                            a_id = l.Attribute("id").Value,
                            //useless a_name = l.Attribute("name").Value,
                            a_top = l.Attribute("top").Value,
                            a_left = l.Attribute("left").Value,
                            a_width = l.Attribute("width").Value,
                            a_height = l.Attribute("height").Value,
                            a_type = l.Attribute("type").Value,
                            a_dataType = l.Attribute("dataType").Value,
                            name = l.Element("name").Value,                             
                            text = (l.Attribute("type").Value == "DLFLabel") ? l.Element("text").Value
                                          : (l.Attribute("type").Value == "DLFCheckBox") ? l.Element("text").Value : null,

                            a_isMandatoryLabel = (l.Attribute("type").Value == "DLFLabel") ? l.Attribute("isMandatoryLabel").Value : null,

                            a_controllerDataType = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("controllerDataType").Value
                                                         : (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("controllerDataType").Value : null,

                            defaultValue = (l.Attribute("defaultValue")!=null) ? l.Element("defaultValue").Value: null,

                            a_maxLength = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("maxLength").Value : null,
                            a_isMandatory = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("isMandatory").Value
                                                  : (l.Attribute("type").Value == "DLFDatePicker") ? l.Attribute("isMandatory").Value : null,

                            a_labelId = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("labelId").Value
                                              : (l.Attribute("type").Value == "DLFDatePicker") ? l.Attribute("labelId").Value : null,

                            //a_checkedStatus = (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("checkedStatus").Value : null,
                            a_checkedValue = (l.Attribute("checkedValue") != null) ? l.Element("checkedValue").Value : null,
                            a_unCheckedValue = (l.Attribute("unCheckedValue") != null) ? l.Element("unCheckedValue").Value : null,
                        });
                        //foreach (var l in lists)
                        //{
                        //    if (l.Attribute("type").Value == "DLFLabel")
                        //    {
                        //        labelList.Add(new FormConfigurationDTO()
                        //        {
                        //            a_id = l.Attribute("id").Value,
                        //            a_top = l.Attribute("top").Value,
                        //            a_left = l.Attribute("left").Value,
                        //            a_width = l.Attribute("width").Value,
                        //            a_height = l.Attribute("height").Value,
                        //            text = l.Element("text").Value,
                        //            a_isMandatoryLabel = l.Attribute("isMandatoryLabel").Value,
                        //            a_type = l.Attribute("type").Value
                        //        }
                        //        );
                        //    }
                        //    else
                        //    {
                        //        formfields.Add(new FormConfigurationDTO()
                        //        {
                        //            a_id = l.Attribute("id").Value,
                        //            //useless a_name = l.Attribute("name").Value,
                        //            a_top = l.Attribute("top").Value,
                        //            a_left = l.Attribute("left").Value,
                        //            a_width = l.Attribute("width").Value,
                        //            a_height = l.Attribute("height").Value,
                        //            a_type = l.Attribute("type").Value,
                        //            //useless a_fontColor = l.Attribute("fontColor").Value,
                        //            //useless a_fontFamily = l.Attribute("fontFamily").Value,
                        //            //useless a_fontWeight = l.Attribute("fontWeight").Value,
                        //            //useless a_fontItalic = l.Attribute("fontItalic").Value,
                        //            //useless a_textDecoration = l.Attribute("textDecoration").Value,
                        //            //useless a_fontSize = l.Attribute("fontSize").Value,
                        //            //useless a_backgrounColor = l.Attribute("backgroundColor").Value,
                        //            //useless a_isDefaultFontColor = l.Attribute("isDefaultFontColor").Value,
                        //            //useless a_isDefaultBGColor = l.Attribute("isDefaultBGColor").Value,
                        //            //useless a_text = (l.Attribute("type").Value == "DLFLabel") ? l.Attribute("text").Value : null,

                        //            a_dataType = l.Attribute("dataType").Value,
                        //            name = l.Element("name").Value,
                        //            text = (l.Attribute("type").Value == "DLFLabel") ? l.Element("text").Value
                        //                  : (l.Attribute("type").Value == "DLFCheckBox") ? l.Element("text").Value : null,

                        //            a_isMandatoryLabel = (l.Attribute("type").Value == "DLFLabel") ? l.Attribute("isMandatoryLabel").Value : null,

                        //            a_controllerDataType = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("controllerDataType").Value
                        //                                 : (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("controllerDataType").Value : null,

                        //            a_defaultValue = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("defaultValue").Value
                        //                           : (l.Attribute("type").Value == "DLFDatePicker") ? l.Attribute("defaultValue").Value : null,

                        //            a_maxLength = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("maxLength").Value : null,
                        //            a_isMandatory = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("isMandatory").Value
                        //                          : (l.Attribute("type").Value == "DLFDatePicker") ? l.Attribute("isMandatory").Value : null,

                        //            a_labelId = (l.Attribute("type").Value == "DLFTextBox") ? l.Attribute("labelId").Value
                        //                      : (l.Attribute("type").Value == "DLFDatePicker") ? l.Attribute("labelId").Value : null,

                        //            a_checkedStatus = (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("checkedStatus").Value : null,
                        //            a_checkedValue = (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("checkedValue").Value : null,
                        //            a_unCheckedValue = (l.Attribute("type").Value == "DLFCheckBox") ? l.Attribute("unCheckedValue").Value : null,



                        //            /*if (a_type == "DLFLabel"){
                        //                  a_text = l.Attribute("text").Value,
                        //                  a_isMandatoryLabel = l.Attribute("isMandatoryLabel").Value,
                        //              }
                        //              if (a_type == "DLFTextBox") {
                        //                  a_controllerDataType = l.Attribute("controllerDataType").Value,
                        //                  a_defaultValue = l.Attribute("defaultValue").Value,
                        //                  a_maxLength = l.Attribute("maxLength").Value,
                        //                  a_isMandatory = l.Attribute("isMandatory").Value,
                        //                  a_labelId = l.Attribute("labelId").Value,
                        //               }
                        //               if (a_type == "DLFDatePicker"){
                        //                  a_defaultValue = l.Attribute("defaultValue").Value,
                        //                  a_showLegend = l.Attribute("showLegend").Value,
                        //                  a_isMandatory = l.Attribute("isMandatory").Value,
                        //                  a_labelId = l.Attribute("labelId").Value,
                        //                }
                        //                if (a_type == "DLFCheckBox"){
                        //                  a_text = l.Attribute("text").Value,
                        //                  a_controllerDataType = l.Attribute("controllerDataType").Value,
                        //                  a_checkedStatus = l.Attribute("checkedStatus").Value,
                        //                  a_checkedValue = l.Attribute("checkedValue").Value,
                        //                  a_unCheckedValue = l.Attribute("unCheckedValue").Value,
                        //                } */


                        //        });
                        //    }


                        //}
                        var outputs = new List<FormConfigurationDTO>();
                        formfields = formfields.OrderBy(o=>Int32.Parse (o.a_top)).ToList();
                        foreach (var f in formfields)
                        {
                            var fields = new FormConfigurationDTO()
                            {
                                a_dataType = f.a_dataType,
                                a_isMandatory = f.a_isMandatory,
                                name = f.name,
                                a_type=f.a_type,
                                defaultValue=f.defaultValue,
                                
                            };
                            if (fields.a_type == "DLFCheckBox")
                            {
                                fields.Extras.Add("a_checkedValue", f.a_checkedValue);
                                fields.Extras.Add("a_unCheckedValue", f.a_unCheckedValue);
                            }

                            var label = labelList.FirstOrDefault(o => o.a_id == f.a_labelId ||
                            (
                            (Int32.Parse(o.a_top) + Int32.Parse(o.a_height)) >= Int32.Parse(f.a_top) &&
                            Int32.Parse(o.a_top) <= (Int32.Parse(f.a_top) + Int32.Parse(f.a_height))
                            ));
                            if (label != null)
                            {

                                fields.text = label.text;
                                labelList.Remove(label);
                            }
                            outputs.Add(fields);

                        }

                        outputs.AddRange(labelList.Select(o=>new FormConfigurationDTO() {
                            a_type=o.a_type,
                            text=o.text
                        }));
                        return outputs;
                    }

                    throw new Exception(string.Format("Call to API has failed. BaseURL: {0} APIPath: {1} Data:{2}", output.Item1, output.Item2, dataAsString));

                }
            }
            catch (Exception e)
            {
                throw e;
            }

        }
        #endregion
    }
}

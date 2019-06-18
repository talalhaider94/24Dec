﻿using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Net.Http.Headers;

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
                var entity = new T_FormRule();
                if (dto.form_id > 0)
                {
                    entity = _dbcontext.FormRules.FirstOrDefault(o => o.form_id == dto.form_id);
                }
                entity = _formRuleMapper.GetEntity(dto, entity);  
                if(dto.form_id == 0)
                {
                    _dbcontext.FormRules.Add(entity);
                }
                _dbcontext.SaveChanges();
                return true;
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<FormAttachmentDTO> GetAttachmentsByFormID(int formId)
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
                var usr = _dbcontext.CatalogUsers.FirstOrDefault(o => o.ca_bsi_account==username);
                if (usr != null)
                {
                    var secret_key = _infomationAPI.GetConfiguration("be_restserver","secret_key");
                    
                    var db_password = sha256_hash(secret_key.Value + usr.password);
                    if (password == db_password)
                    {
                        var token = MD5Hash(usr.userid + DateTime.Now.Ticks);
                        var res = _oracleAPI.GetUserIdLocaleIdByUserName(usr.ca_bsi_account);
                        if (res != null)
                        {
                            _dbcontext.Sessions.Add(new T_Session()
                            {
                                user_id = res.Item1,
                                user_name = usr.ca_bsi_account,
                                login_time = DateTime.Now,
                                session_token = token,
                                expire_time = DateTime.Now.AddMinutes(getSessionTimeOut())
                            });
                            _dbcontext.SaveChanges();
                            _cache.Remove(res.Item1);
                            var permissions=_infomationAPI.GetPermissionsByUserId(res.Item1).Select(o => o.Code).ToList();
                            _cache.GetOrCreate("Permission_"+res.Item1, entry => permissions);
                            return new LoginResultDTO()
                            {
                                IsAdmin = usr.user_admin,
                                IsSuperAdmin = usr.user_sadmin,
                                Token = token,
                                UserID = res.Item1,
                                LocaleID = res.Item2,
                                UserEmail= usr.mail,
                                UserName=usr.ca_bsi_account
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
                    var emailSubject = "[DashBoard] Reset Password";
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
                    if ((filterByKpiId != null))
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
                var apiPath = "api/FormAdapter/RunAdapter";
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
                        return false;

                    }
                }
                else
                {                    
                    return false;
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
        #endregion
    }
}

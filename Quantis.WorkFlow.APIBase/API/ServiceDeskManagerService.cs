using Microsoft.Extensions.Logging;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using System.Xml.Linq;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
using Microsoft.Extensions.Configuration;
using Quantis.WorkFlow.Services.DTOs.API;
using System.Net.Http;
using System.Xml;
using System.Net;
using System.IO;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Quantis.WorkFlow.Services.Framework;
using Quantis.WorkFlow.Models.SDM;

namespace Quantis.WorkFlow.APIBase.API
{
    public class ServiceDeskManagerService : IServiceDeskManagerService
    {
        private readonly SDM.USD_WebServiceSoapClient _sdmClient = null;
        private readonly SDMExt.USD_R11_ExtSoapClient _sdmExtClient = null;
        private int _sid {get;set; }
        private readonly string _username;
        private readonly string _password;
        private readonly List<SDM_TicketGroup> _groupMapping;
        private readonly List<SDM_TicketStatus> _statusMapping;
        private readonly IDataService _dataService;
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private readonly IInformationService _infomationAPI;
        private void LogIn()
        {
            try
            {
                if (_sid == -1)
                {
                    var login_a = _sdmClient.loginAsync(_username, _password);
                    login_a.Wait();
                    _sid = login_a.Result.loginReturn;
                }
            }
            catch (Exception e)
            {
                throw e;
            }            
            
        }
        private void LogOut()
        {
            try
            {
                if (_sid != -1)
                {
                    try
                    {
                        _sdmClient.logoutAsync(_sid).Wait();
                        _sid = -1;
                    }
                    catch (Exception e)
                    {
                        throw e;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public ServiceDeskManagerService(WorkFlowPostgreSqlContext context, IDataService dataService, IInformationService infomationAPI)
        {
            _dbcontext = context;
            _infomationAPI = infomationAPI;
            _groupMapping = _dbcontext.SDMTicketGroup.ToList();
            _statusMapping = _dbcontext.SDMTicketStatus.OrderBy(o=>o.step).ToList();

            if (_sdmClient == null)
            {
                _sdmClient = new SDM.USD_WebServiceSoapClient();
            }
            if (_sdmExtClient == null)
            {
                _sdmExtClient = new SDMExt.USD_R11_ExtSoapClient(SDMExt.USD_R11_ExtSoapClient.EndpointConfiguration.USD_R11_ExtSoap);
            }
            _dataService = dataService;
            var usernameObj = _infomationAPI.GetConfiguration("be_sdm","username");
            var passObj = _infomationAPI.GetConfiguration("be_sdm","password");
            if (usernameObj == null || passObj == null)
            {
                var exp = new Exception("Cannot get SDM login Properties");                
                throw exp;
            }
            else
            {
                _sid = -1;
                _username = usernameObj.Value;
                _password = passObj.Value;
            }
        }
        public List<SDMTicketLVDTO> GetAllTickets()
        {
            List<SDMTicketLVDTO> ret = null;
            LogIn();
            try
            {                
                var select_a = _sdmClient.doSelectAsync(_sid, "cr", "", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                select_a.Wait();
                var select_result = select_a.Result.doSelectReturn;
                ret= parseTickets(select_result);
            }
            catch (Exception e)
            {
                throw e;            
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        public List<SDMAttachmentDTO> GetAttachmentsByTicket(int ticketId)
        {
            List<SDMAttachmentDTO> ret = null;
            LogIn();
            try
            {
                var selecta = _sdmClient.doSelectAsync(_sid, "lrel_attachments_requests", "cr='cr:" + ticketId + "'", 99999, new string[] { "attmnt", "attmnt.attmnt_name", "last_mod_dt" });
                selecta.Wait();
                var sel = selecta.Result.doSelectReturn;
                ret = parseAttachments(sel);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        public byte[] DownloadAttachment(string attachmentHandle)
        {
            byte[] ret = null;
            LogIn();
            try
            {
                var select_a = _sdmExtClient.downloadAttachmentAsync(_sid, "attmnt:"+attachmentHandle);

                select_a.Wait();
                var select_result = select_a.Result.Body.downloadAttachmentResult;
                ret= select_result;
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        public SDMTicketLVDTO GetTicketByID(int Id)
        {
            LogIn();
            try
            {
                var select_a = _sdmClient.doSelectAsync(_sid, "cr", "id=" + Id+"", 1, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                select_a.Wait();
                var select_result = select_a.Result.doSelectReturn;
                return parseTickets(select_result).FirstOrDefault();
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
        }
        public SDMTicketLVDTO CreateTicket(CreateTicketDTO dto)
        {
            SDMTicketLVDTO ret = null;
            LogIn();
            try
            {
                if (string.IsNullOrEmpty(dto.Status))
                {
                    dto.Status = _statusMapping.FirstOrDefault().handle;
                }
                dto.Group = _groupMapping.Where(o=>o.category_id==dto.GroupCategoryId).OrderBy(o=>o.step).First().handle;
                string newRequestHandle = "";
                string newRequestNumber = "";
                var ticket=_sdmClient.createRequestAsync(new SDM.createRequestRequest(_sid, "",
                    new string[34]
                    {"type",
                      "crt:180",
                      "customer",
                      "cnt:9FF6A914066D09479BACC3736FBFFD21",
                      "zz_svc",
                      "zsvc:401021",
                      "category",
                      "pcat:148400475",
                      "summary",
                      dto.Summary,
                      "description",
                      dto.Description,
                      "status",
                      dto.Status,
                      "priority",
                      "pri:500",
                      "urgency",
                      "urg:1100",
                      "severity",
                      "sev:800",
                      "impact",
                      "imp:1603",
                      "group",
                      dto.Group,
                      "zz_mgnote",
                      dto.ID_KPI,
                      "zz_cned_string1",
                      dto.Reference1,
                      "zz_cned_string2",
                      dto.Reference2,
                      "zz_cned_string3",
                      dto.Reference3,
                      "zz_cned_string4",
                      dto.Period,
                    }, new string[0], "", new string[0], newRequestHandle, newRequestNumber)).Result.createRequestReturn;

                ret= parseNewTicket(ticket);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }

        public SDMTicketLVDTO CreateTicketByKPIID(int Id)
        {
            SDMTicketLVDTO ret = null;
            LogIn();
            try
            {
                var dto = _dataService.GetKPICredentialToCreateTicket(Id);
                if (string.IsNullOrEmpty(dto.Status))
                {
                    dto.Status = _statusMapping.FirstOrDefault().handle;
                }
                dto.Group = _groupMapping.Where(o => o.category_id == dto.GroupCategoryId).OrderBy(o => o.step).First().handle;
                string newRequestHandle = "";
                string newRequestNumber = "";
                var ticket = _sdmClient.createRequestAsync(new SDM.createRequestRequest(_sid, "",
                    new string[34]
                    {"type",
                      "crt:180",
                      "customer",
                      "cnt:9FF6A914066D09479BACC3736FBFFD21",
                      "zz_svc",
                      "zsvc:401021",
                      "category",
                      "pcat:148400475",
                      "summary",
                      dto.Summary,
                      "description",
                      dto.Description,
                      "status",
                      dto.Status,
                      "priority",
                      "pri:500",
                      "urgency",
                      "urg:1100",
                      "severity",
                      "sev:800",
                      "impact",
                      "imp:1603",
                      "group",
                      dto.Group,
                      "zz_mgnote",
                      dto.ID_KPI,
                      "zz_cned_string1",
                      dto.Reference1,
                      "zz_cned_string2",
                      dto.Reference2,
                      "zz_cned_string3",
                      dto.Reference3,
                      "zz_cned_string4",
                      dto.Period
                    }, new string[0], "", new string[0], newRequestHandle, newRequestNumber)).Result.createRequestReturn;

                ret = parseNewTicket(ticket);
                var attachments = _dataService.GetAttachmentsByKPIID(Id);
                foreach(var att in attachments)
                {
                    Dictionary<string, string> param = new Dictionary<string, string>();
                    param.Add("sid", _sid + "");
                    param.Add("repositoryHandle", "doc_rep:1002");
                    param.Add("objectHandle", "cr:"+ ret.Id);
                    param.Add("description", att.doc_name);
                    param.Add("fileName", att.doc_name);
                    SendSOAPRequest(_sdmClient.InnerChannel.RemoteAddress.ToString(), "createAttachment", param, att.content);
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        public string UploadAttachmentToTicket(SDMUploadAttachmentDTO dto)
        {
            string ret = null;
            LogIn();
            try
            {
                Dictionary<string, string> param = new Dictionary<string, string>();
                param.Add("sid", _sid + "");
                param.Add("repositoryHandle", "doc_rep:1002");
                param.Add("objectHandle", "cr:" + dto.TicketId);
                param.Add("description", dto.AttachmentName);
                param.Add("fileName", dto.AttachmentName);
                SendSOAPRequest(_sdmClient.InnerChannel.RemoteAddress.ToString(), "createAttachment", param, dto.AttachmentContent);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        public List<SDMTicketLVDTO> GetTicketsVerificationByUser(HttpContext context,string period)
        {
            List<SDMTicketLVDTO> ret = null;
            LogIn();
            try
            {
                var user=context.User as AuthUser;
                if (user == null)
                {
                    throw new Exception("No user Login to Get Tickets by user");
                }
                var userid = _dataService.GetUserIdByUserName(user.UserName);
                if (userid != null)
                {
                    List<SDMTicketLVDTO> tickets = new List<SDMTicketLVDTO>();
                    userid = userid.Split('\\')[1];

                    var select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='"+ _statusMapping.ElementAt(0).code+ "' and zz_cned_string1 LIKE '%"+ userid + "%' and zz_cned_string4='"+ period + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    var select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));

                    select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='" + _statusMapping.ElementAt(1).code + "' and zz_cned_string2 LIKE '%" + userid + "%' and zz_cned_string4='" + period + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));

                    select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='" + _statusMapping.ElementAt(2).code + "' and zz_cned_string3 LIKE '%" + userid + "%' and zz_cned_string4='" + period + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));
                    ret = tickets.ToList();

                }
            }
            catch(Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;

        }

        public List<SDMTicketLVDTO> GetTicketsRicercaByUser(HttpContext context)
        {
            List<SDMTicketLVDTO> ret = null;
            
            try
            {
                var user = context.User as AuthUser;
                if (user == null)
                {
                    throw new Exception("No user Login to Get Tickets by user");
                }
                var userid = _dataService.GetUserIdByUserName(user.UserName);
                if (userid != null)
                {
                    List<SDMTicketLVDTO> tickets = new List<SDMTicketLVDTO>();
                    userid = userid.Split('\\')[1];
                    var contractparties=_infomationAPI.GetContractPartyByUser(user.UserId);
                    string filterstring = "";
                    var groups=_dbcontext.SDMTicketGroup.Where(o => contractparties.Contains(o.category_id)).Select(p=>p.handle.Substring(4)).ToList();
                    if (!groups.Any())
                    {
                        return tickets;
                    }
                    var filters = groups.Select(o => string.Format(" group.id=U'{0}' ", o));
                    filterstring=string.Join("OR", filters);
                    LogIn();
                    var select_a = _sdmClient.doSelectAsync(_sid, "cr", filterstring, 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    var select_result = select_a.Result.doSelectReturn;
                    return parseTickets(select_result);//.Where(o=>groups.Contains(o.Group)).ToList();


                }
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;

        }
        public ChangeStatusDTO TransferTicketByID(int id, string status,string description)
        {
            var dto = new ChangeStatusDTO();
            var ticket = GetTicketByID(id);
            if (ticket.Status != status)
            {
                _dbcontext.LogInformation("Status is equation to previous Status");
                return dto;
            }
            LogIn();
            try
            {
                if (ticket.Status == _statusMapping.OrderBy(o => o.step).First().name || ticket.Status == _statusMapping.OrderBy(o => o.step).Last().name || !_statusMapping.Any(o => o.name == ticket.Status))
                {
                    _dbcontext.LogInformation("Ticket Status not in configuration");
                    return dto;
                }
                int step = _statusMapping.FirstOrDefault(o => o.name == ticket.Status).step;
                step--;
                var newstatus = _statusMapping.FirstOrDefault(o => o.step == step).handle;
                string newgroup = "";
                foreach (var g in _groupMapping.GroupBy(o => o.category_id))
                {
                    if (g.Any(o => o.name == ticket.Group))
                    {
                        newgroup = g.FirstOrDefault(o => o.step == step).handle;
                    }
                }
                var bsiticketdto = new BSIKPIUploadDTO()
                {
                    kpi_name = ticket.ID_KPI,
                    contract_name = ticket.Summary.Split('|')[0],
                    id_ticket = ticket.ref_num,
                    period = ticket.Period,
                    primary_contract_party = int.Parse(string.IsNullOrEmpty(ticket.primary_contract_party) ? "0" : ticket.primary_contract_party),
                    secondary_contract_party = int.Parse(string.IsNullOrEmpty(ticket.secondary_contract_party) ? "0" : ticket.secondary_contract_party),
                    ticket_status = status
                };               
                string tickethandle = "cr:" + id;
                var esca = _sdmClient.transferAsync(_sid, "", tickethandle, description, false, "", true, newgroup, false, "");
                esca.Wait();

                var statusa = _sdmClient.changeStatusAsync(_sid, "", tickethandle, description, newstatus);
                statusa.Wait();
                LogOut();
                dto.IsSDMStatusChanged = true;
                if (CallUploadKPI(bsiticketdto))
                {
                    dto.IsBSIStatusChanged = true;
                }
                return dto;
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
        }
        public ChangeStatusDTO EscalateTicketbyID(int id, string status,string description)
        {
            var dto = new ChangeStatusDTO();
            var ticket = GetTicketByID(id);
            status= _statusMapping.FirstOrDefault(o => o.name == status).code;
            if (ticket.Status != status)
            {
                _dbcontext.LogInformation("Status is equation to previous Status");
                return dto;
            }
            LogIn();
            try
            {
                if (ticket.Status == _statusMapping.OrderBy(o=>o.step).Last().name || !_statusMapping.Any(o=>o.name== ticket.Status))
                {
                    _dbcontext.LogInformation("Ticket Status not in configuration");
                    return dto;
                }
                int step = _statusMapping.FirstOrDefault(o => o.name == ticket.Status).step;
                step++;
                var newstatus= _statusMapping.FirstOrDefault(o=>o.step== step).handle;
                string newgroup = "";
                foreach(var g in _groupMapping.GroupBy(o=>o.category_id))
                {
                    if (g.Any(o => o.name == ticket.Group))
                    {
                        newgroup = g.FirstOrDefault(o=>o.step==step).handle;
                    }
                };
                var bsiticketdto = new BSIKPIUploadDTO()
                {
                    kpi_name = ticket.ID_KPI,
                    contract_name = ticket.Summary.Split('|')[0],
                    id_ticket = ticket.ref_num,
                    period = ticket.Period,
                    primary_contract_party = int.Parse(string.IsNullOrEmpty(ticket.primary_contract_party)?"0": ticket.primary_contract_party),
                    secondary_contract_party = int.Parse(string.IsNullOrEmpty(ticket.secondary_contract_party) ? "0" : ticket.secondary_contract_party),
                    ticket_status = status
                };
                
                string tickethandle = "cr:" + id;
                var esca=_sdmClient.escalateAsync(_sid, "", tickethandle, description, false, "", true, newgroup, false, "", false, "");
                esca.Wait();

                var statusa= _sdmClient.changeStatusAsync(_sid, "", tickethandle, description, newstatus);
                statusa.Wait();
                LogOut();
                dto.IsSDMStatusChanged = true;
                if (CallUploadKPI(bsiticketdto))
                {
                    dto.IsBSIStatusChanged = true;
                }
                return dto;

            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
        }

        public List<SDMTicketLogDTO> GetTicketHistory(int ticketId)
        {
            List<SDMTicketLogDTO> ret = null;
            LogIn();
            try
            {
                var selecta = _sdmClient.doSelectAsync(_sid, "alg", "call_req_id='cr:"+ ticketId + "'", 99999, new string[0]);
                selecta.Wait();
                var sel = selecta.Result.doSelectReturn;
                ret = parseLogs(sel);
            }
            catch (Exception e)
            {
                throw e;
            }
            finally
            {
                LogOut();
            }
            return ret;
        }
        private bool CallUploadKPI(BSIKPIUploadDTO dto)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    UploadKPIDTO data = new UploadKPIDTO() { arguments = new List<string>() { dto.primary_contract_party + "", dto.secondary_contract_party + "", dto.contract_name, dto.kpi_name, dto.id_ticket, dto.period, dto.ticket_status } };
                    var output = QuantisUtilities.FixHttpURLForCall(_dataService.GetBSIServerURL(), "/api/UploadKPI/UploadKPI");
                    client.BaseAddress = new Uri(output.Item1);
                    var dataAsString = JsonConvert.SerializeObject(data);
                    var content = new StringContent(dataAsString);
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var response = client.PostAsync(output.Item2, content).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        string res = response.Content.ReadAsStringAsync().Result;
                        if (res=="True")
                        {
                            return true;
                        }
                        else
                        {
                            _dbcontext.LogInformation("Message from Upload KPI: " + res);
                            return false;
                        }
                    }
                    else
                    {
                        _dbcontext.LogInformation(string.Format("Call to Upload KPI has failed. BaseURL: {0} APIPath: {1} Data:{2}", output.Item1, output.Item2, dataAsString));
                        return false;
                    }

                }
            }
            catch(Exception e)
            {
                throw e;
            }
            
        }
        private SDMTicketLVDTO parseNewTicket(string ticket)
        {
            var dtos = new List<SDMTicketLVDTO>();
            XDocument xdoc = XDocument.Parse(ticket);
            var attributes = xdoc.Element("UDSObject").Element("Attributes").Elements("Attribute");
            SDMTicketLVDTO dto = new SDMTicketLVDTO();
            dto.Id = xdoc.Element("UDSObject").Element("Handle").Value.Substring(3);
            dto.ref_num = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "ref_num").Element("AttrValue").Value;
            dto.Description = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "description").Element("AttrValue").Value;
            dto.Group = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "group").Element("AttrValue").Value;
            dto.Summary = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "summary").Element("AttrValue").Value;
            dto.Status = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "status").Element("AttrValue").Value;
            dto.ID_KPI = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_mgnote").Element("AttrValue").Value;
            dto.Reference1 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string1").Element("AttrValue").Value;
            dto.Reference2 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string2").Element("AttrValue").Value;
            dto.Reference3 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string3").Element("AttrValue").Value;
            dto.Period = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string4").Element("AttrValue").Value;
            //dto.primary_contract_party = (attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_primary_contract_party")==null)?"":attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_primary_contract_party").Element("AttrValue").Value;
            //dto.secondary_contract_party = (attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_secondary_contract_party")==null)?"":attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_secondary_contract_party").Element("AttrValue").Value;

            if (_groupMapping.Any(o => o.handle.Substring(4) == dto.Group))
            {
                dto.Group = _groupMapping.FirstOrDefault(o => o.handle.Substring(4) == dto.Group).name;
            }
            return dto;

        }
        private List<SDMTicketLVDTO> parseTickets(string tickets)
        {
            var dtos = new List<SDMTicketLVDTO>();
            XDocument xdoc = XDocument.Parse(tickets);
            var lists = from uoslist in xdoc.Element("UDSObjectList").Elements("UDSObject") select uoslist;
            foreach (var l in lists)
            {
                var attributes = l.Element("Attributes").Elements("Attribute");
                SDMTicketLVDTO dto = new SDMTicketLVDTO();
                dto.Id = l.Element("Handle").Value.Substring(3);
                dto.ref_num = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "ref_num").Element("AttrValue").Value;
                dto.Description = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "description").Element("AttrValue").Value;
                dto.Group = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "group").Element("AttrValue").Value;
                dto.Summary = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "summary").Element("AttrValue").Value;
                dto.Status = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "status").Element("AttrValue").Value;
                dto.ID_KPI = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_mgnote").Element("AttrValue").Value;
                dto.Reference1 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string1").Element("AttrValue").Value;
                dto.Reference2 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string2").Element("AttrValue").Value;
                dto.Reference3 = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string3").Element("AttrValue").Value;
                dto.Period = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_cned_string4").Element("AttrValue").Value;
                var summary = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "summary");
                if (summary == null)
                {
                    dto.primary_contract_party = "";
                    dto.secondary_contract_party = "";
                }
                else
                {
                    var val = summary.Element("AttrValue").Value.Split("|");
                    if (val.Length >= 4)
                    {
                        dto.primary_contract_party = val[2];
                        dto.secondary_contract_party = val[3];
                    }
                    else
                    {
                        dto.primary_contract_party = "";
                        dto.secondary_contract_party = "";
                    }
                }
                if (_groupMapping.Any(o => o.handle.Substring(4) == dto.Group))
                {
                    dto.Group = _groupMapping.FirstOrDefault(o => o.handle.Substring(4) == dto.Group).name;
                }
                if (_statusMapping.Any(o => o.code == dto.Status))
                {
                    var st = dto.Status;
                    dto.Status = _statusMapping.FirstOrDefault(o => o.code == dto.Status).name;
                    if(_statusMapping.First(o => o.code == st).step == 3)
                    {
                        dto.IsClosed = true;
                    }
                    else
                    {
                        dto.IsClosed = false;
                    }
                }
                dtos.Add(dto);
            }
            return dtos;
        }
        private List<SDMTicketLogDTO> parseLogs(string logs)
        {
            var dtos = new List<SDMTicketLogDTO>();
            XDocument xdoc = XDocument.Parse(logs);
            var lists = from uoslist in xdoc.Element("UDSObjectList").Elements("UDSObject") select uoslist;
            foreach (var l in lists)
            {
                var attributes = l.Element("Attributes").Elements("Attribute");
                SDMTicketLogDTO dto = new SDMTicketLogDTO();
                dto.LogId = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "id").Element("AttrValue").Value;
                dto.MsgBody = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "msg_body").Element("AttrValue").Value;
                dto.TicketHandler = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "call_req_id").Element("AttrValue").Value;
                dto.TicketStatus = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "cr_status").Element("AttrValue").Value;
                dto.TimeStamp = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "time_stamp").Element("AttrValue").Value;
                dto.ActionDescription = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "action_desc").Element("AttrValue").Value;
                dto.Description = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "description").Element("AttrValue").Value;
                dtos.Add(dto);
            }
            return dtos;
        }
        private List<SDMAttachmentDTO> parseAttachments(string logs)
        {
            var dtos = new List<SDMAttachmentDTO>();
            XDocument xdoc = XDocument.Parse(logs);
            var lists = from uoslist in xdoc.Element("UDSObjectList").Elements("UDSObject") select uoslist;
            foreach (var l in lists)
            {
                var attributes = l.Element("Attributes").Elements("Attribute");
                SDMAttachmentDTO dto = new SDMAttachmentDTO();
                dto.AttachmentHandle = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "attmnt").Element("AttrValue").Value;
                dto.AttachmentName = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "attmnt.attmnt_name").Element("AttrValue").Value;
                dto.LastModifiedDate = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "last_mod_dt").Element("AttrValue").Value;
                dtos.Add(dto);
            }
            return dtos;
        }

        private string SendSOAPRequest(string url, string action, Dictionary<string, string> parameters,byte[] fileData)
        {
            MultipartFormDataContent multiContent = new MultipartFormDataContent();
            XmlDocument soapEnvelopeXml = new XmlDocument();
            var xmlStr = @"<soapenv:Envelope xmlns:soapenv=""http://schemas.xmlsoap.org/soap/envelope/"" xmlns:ser=""http://www.ca.com/UnicenterServicePlus/ServiceDesk"">
                    <soapenv:Header/>
                    <soapenv:Body>
                    <ser:{0}>
                    {1}
                    </ser:{0}>
                    </soapenv:Body>
                    </soapenv:Envelope>";
            string parms = string.Join(string.Empty, parameters.Select(kv => String.Format("<{0}>{1}</{0}>", kv.Key, kv.Value)).ToArray());
            var s = String.Format(xmlStr, action, parms);
            soapEnvelopeXml.LoadXml(s);
            // Create the web request
            string boundary = "=" + DateTime.Now.Ticks.ToString("x");
            HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(url);
            webRequest.Headers.Add("Content-Type", string.Format("multipart/related; type=\"text/xml\"; start=\"<rootpart@soapui.org> \"; boundary=\"{0}\"", boundary));
            webRequest.Headers.Add("Accept-Encoding", "gzip,deflate");
            webRequest.Headers.Add("SOAPAction", "");
            webRequest.Headers.Add("MIME-Version", "1.0");
            webRequest.Accept = "application/xml";
            webRequest.Method = "POST";
            // Insert SOAP envelope
            using (Stream stream = webRequest.GetRequestStream())
            {
                string topBoundry = "--" + boundary + Environment.NewLine + "Content-Type: text/xml; charset=UTF-8" + Environment.NewLine + "Content-Transfer-Encoding: 8bit" + Environment.NewLine + "Content-ID: <rootpart@soapui.org>" + Environment.NewLine + Environment.NewLine;
                byte[] topBoundryBytes = Encoding.UTF8.GetBytes(topBoundry);
                stream.Write(topBoundryBytes, 0, topBoundryBytes.Length);
                soapEnvelopeXml.Save(stream);

                var filename = parameters["fileName"];
                string fileHeaderTemplate = Environment.NewLine + "--" + boundary + Environment.NewLine + "Content-Type: text/plain; charset=us-ascii; name={0}" + Environment.NewLine + "Content-Transfer-Encoding: 7bit" + Environment.NewLine + "Content-ID: <{0}>" + Environment.NewLine + "Content-Disposition: attachment; name=\"{0}\"; filename=\"{0}\"" + Environment.NewLine;
                fileHeaderTemplate = string.Format(fileHeaderTemplate, filename);
                byte[] fileHeaderBytes = Encoding.UTF8.GetBytes(fileHeaderTemplate + Environment.NewLine);
                stream.Write(fileHeaderBytes, 0, fileHeaderBytes.Length);
                stream.Write(fileData, 0, fileData.Length);
                byte[] fileHeaderBytes2 = Encoding.UTF8.GetBytes(Environment.NewLine + "--" + boundary + "--" + Environment.NewLine);
                stream.Write(fileHeaderBytes2, 0, fileHeaderBytes2.Length);

            }

            // Send request and retrieve result
            string result = null;
            using (WebResponse response = webRequest.GetResponse())
            {
                using (StreamReader rd = new StreamReader(response.GetResponseStream()))
                {
                    result = rd.ReadToEnd();
                }
            }
            XDocument xdoc = XDocument.Parse(result);
            var ret = xdoc.DescendantNodes().Last().ToString();
            return ret;
        }
        ~ServiceDeskManagerService()
        {
            LogOut();
        }
    }
}

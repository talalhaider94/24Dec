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

namespace Quantis.WorkFlow.APIBase.API
{
    public class ServiceDeskManagerService : IServiceDeskManagerService
    {
        private readonly SDM.USD_WebServiceSoapClient _sdmClient = null;
        private readonly SDMExt.USD_R11_ExtSoapClient _sdmExtClient = null;
        private int _sid {get;set; }
        private readonly string _username;
        private readonly string _password;
        private readonly List<SDMGroupDTO> _groupMapping;
        private readonly List<KeyValuePair<string,string>> _statusMapping;
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
            _groupMapping = new List<SDMGroupDTO>()
            {
                new SDMGroupDTO("cnt:D3D5EE53E8F26A46B1B8DF358EC30065","IMEL_Referenti_OP","IM"),
                new SDMGroupDTO("cnt:36EBDF755A37104E9DCB0CFE6398EA91","IMEL_Referenti_SER_CERT","IM"),
                new SDMGroupDTO("cnt:460E863B3E003042BB1C4E887CDACBB2","IMEL_Resp_Contratto","IM"),
                new SDMGroupDTO("cnt:532AE6B2B61CA34496EE7BD6FBC7C620","BP_Resp_Contratto","BP"),
                new SDMGroupDTO("cnt:D5D36A81F203AB4F8C078FA8ACA31C99","BP_Resp_Contratto","BP"),
                new SDMGroupDTO("cnt:7FF46C26EA8DB6429C9C9E075975ECB5","BP_Resp_Contratto","BP"),

            };
            _statusMapping = new List<KeyValuePair<string, string>>() {
                new KeyValuePair<string, string>("crs:134676940","BSIVROP"),
                new KeyValuePair<string, string>("crs:134676941","BSIVRSER"),
                new KeyValuePair<string, string>("crs:134676942","BSIVRECONT"),
                new KeyValuePair<string, string>("CLCERT","CLCERT"),

            };
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
                var selecta = _sdmClient.doSelectAsync(_sid, "lrel_attachments_requests", "cr='cr:" + ticketId + "'", 99999, new string[0]);
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
                var select_a = _sdmExtClient.downloadAttachmentAsync(_sid, attachmentHandle);

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
        public SDMTicketLVDTO GetTicketByKPIID(int Id)
        {
            LogIn();
            try
            {
                var select_a = _sdmClient.doSelectAsync(_sid, "cr", "zz_mgnote='" + Id+"'", 1, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
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
                    dto.Status = _statusMapping[1].Key;
                }
                dto.Group = _groupMapping.Where(o=>o.GroupCatagory==dto.Group).First().GroupHandler;
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

                ret= parseTickets(ticket).FirstOrDefault();
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
                    dto.Status = _statusMapping[1].Key;
                }
                dto.Group = _groupMapping.Where(o => o.GroupCatagory == dto.Group).First().GroupHandler;
                string newRequestHandle = "";
                string newRequestNumber = "";
                var ticket = _sdmClient.createRequestAsync(new SDM.createRequestRequest(_sid, "",
                    new string[38]
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
                      "zz_primary_contract_party",
                      dto.primary_contract_party+"",
                      "zz_secondary_contract_party",
                      dto.secondary_contract_party+""
                    }, new string[0], "", new string[0], newRequestHandle, newRequestNumber)).Result.createRequestReturn;

                ret= parseTickets(ticket).FirstOrDefault();
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
        public string UploadAttachmentToTicket(int ticketId,string docName,byte[] docContent)
        {
            string ret = null;
            LogIn();
            try
            {
                Dictionary<string, string> param = new Dictionary<string, string>();
                param.Add("sid", _sid + "");
                param.Add("repositoryHandle", "doc_rep:1002");
                param.Add("objectHandle", "cr:" + ticketId);
                param.Add("description", docName);
                param.Add("fileName", docName);
                SendSOAPRequest(_sdmClient.InnerChannel.RemoteAddress.ToString(), "createAttachment", param, docContent);
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
        public List<SDMTicketLVDTO> GetTicketDescrptionByUser(string username)
        {
            List<SDMTicketLVDTO> ret = null;
            LogIn();
            try
            {
                var userid = _dataService.GetUserIdByUserName(username);
                if (userid != null)
                {
                    List<SDMTicketLVDTO> tickets = new List<SDMTicketLVDTO>();
                    userid = userid.Split('\\')[1];
                    var select_al = _sdmClient.doSelectAsync(_sid, "cr","", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_al.Wait();
                    var select_resultl = select_al.Result.doSelectReturn;


                    var select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='"+ _statusMapping[0].Value+ "' and zz_cned_string1='"+ userid + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    var select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));

                    select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='" + _statusMapping[1].Value + "' and zz_cned_string2='" + userid + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));

                    select_a = _sdmClient.doSelectAsync(_sid, "cr", "status='" + _statusMapping[2].Value + "' and zz_cned_string3='" + userid + "'", 99999, new string[] { "ref_num", "description", "group", "summary", "status", "zz_mgnote", "zz_cned_string1", "zz_cned_string2", "zz_cned_string3", "zz_cned_string4" });
                    select_a.Wait();
                    select_result = select_a.Result.doSelectReturn;
                    tickets.AddRange(parseTickets(select_result));
                    ret= tickets;
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
        public SDMTicketLVDTO TransferTicketByKPIID(int id, string status,string description)
        {
            var ticket = GetTicketByKPIID(id);
            if (ticket.Status != status)
            {
                return ticket;
            }
            LogIn();
            try
            {
                if (ticket.Status == _statusMapping.First().Value || ticket.Status == _statusMapping.Last().Value || !_statusMapping.Any(o => o.Value == ticket.Status))
                {
                    return null;
                }
                int index = _statusMapping.Select(o => o.Value).ToList().IndexOf(ticket.Status);
                index--;
                var newstatus = _statusMapping[index].Key;
                string newgroup = "";
                foreach (var g in _groupMapping.GroupBy(o => o.GroupCatagory))
                {
                    if (g.Any(o => o.GroupName == ticket.Group))
                    {
                        newgroup = g.ElementAt(index).GroupHandler;
                    }
                }
                var kpi = _dataService.GetKpiById(id);
                var bsiticketdto = new BSIKPIUploadDTO()
                {
                    kpi_name = kpi.id_kpi,
                    contract_name = kpi.contract,
                    id_ticket = ticket.ref_num,
                    period = ticket.Period,
                    primary_contract_party = kpi.primary_contract_party,
                    secondary_contract_party = kpi.secondary_contract_party,
                    ticket_status = status
                };
                if (!CallUploadKPI(bsiticketdto))
                {
                    LogOut();
                    return null;
                }
                string tickethandle = "cr:" + ticket.ref_num;
                var esca = _sdmClient.transferAsync(_sid, "", tickethandle, description, false, "", true, newgroup, false, "");
                esca.Wait();

                var statusa = _sdmClient.changeStatusAsync(_sid, "", tickethandle, description, newstatus);
                statusa.Wait();
                LogOut();
                return GetTicketByKPIID(id);
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
        public SDMTicketLVDTO EscalateTicketbyKPIID(int id, string status,string description)
        {
            var ticket = GetTicketByKPIID(id);
            if (ticket.Status != status)
            {
                return ticket;
            }
            LogIn();
            try
            {
                if (ticket.Status == _statusMapping.Last().Value || !_statusMapping.Any(o=>o.Value== ticket.Status))
                {
                    return null;
                }
                int index = _statusMapping.Select(o => o.Value).ToList().IndexOf(ticket.Status);
                index++;
                var newstatus= _statusMapping[index].Key;
                string newgroup = "";
                foreach(var g in _groupMapping.GroupBy(o=>o.GroupCatagory))
                {
                    if (g.Any(o => o.GroupName == ticket.Group))
                    {
                        newgroup = g.ElementAt(index).GroupHandler;
                    }
                }
                var kpi = _dataService.GetKpiById(id);
                var bsiticketdto = new BSIKPIUploadDTO()
                {
                    kpi_name = kpi.id_kpi,
                    contract_name = kpi.contract,
                    id_ticket = ticket.ref_num,
                    period = ticket.Period,
                    primary_contract_party = kpi.primary_contract_party,
                    secondary_contract_party = kpi.secondary_contract_party,
                    ticket_status = status
                };
                if (!CallUploadKPI(bsiticketdto))
                {
                    LogOut();
                    return null;
                }
                string tickethandle = "cr:" + ticket.ref_num;
                var esca=_sdmClient.escalateAsync(_sid, "", tickethandle, description, false, "", true, newgroup, false, "", false, "");
                esca.Wait();

                var statusa= _sdmClient.changeStatusAsync(_sid, "", tickethandle, description, newstatus);
                statusa.Wait();
                LogOut();
                return GetTicketByKPIID(id);
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
                    List<string> data = new List<string>() { dto.primary_contract_party+"", dto.secondary_contract_party+"", dto.contract_name, dto.kpi_name, dto.id_ticket, dto.period, dto.ticket_status };
                    client.BaseAddress = new Uri(_dataService.GetBSIServerURL());
                    var dataAsString = JsonConvert.SerializeObject(data);
                    var content = new StringContent(dataAsString);
                    content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
                    var response = client.PostAsync("api/UploadKPI/UploadKPI", content).Result;
                    //var response = client.PostAsJsonAsync("api/UploadKPI/UploadKPI", data).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        if (response.Content.ReadAsStringAsync().Result=="True")
                        {
                            return true;
                        }
                        else
                        {
                            throw new Exception("Form Adapter returned with :" + response.ToString());

                        }
                    }
                    else
                    {
                        throw new Exception("Connection to form adaptor cannot be created");
                    }

                }
            }
            catch(Exception e)
            {
                throw e;
            }
            
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
                dto.Id = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "id").Element("AttrValue").Value;
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
                dto.primary_contract_party = (attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_primary_contract_party")==null)?"":attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_primary_contract_party").Element("AttrValue").Value;
                dto.secondary_contract_party = (attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_secondary_contract_party")==null)?"":attributes.FirstOrDefault(o => o.Element("AttrName").Value == "zz_secondary_contract_party").Element("AttrValue").Value;

                if (_groupMapping.Any(o => o.GroupHandler == dto.Group))
                {
                    dto.Group = _groupMapping.FirstOrDefault(o => o.GroupHandler == dto.Group).GroupName;
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
                dto.AttachmentHandle = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "persistent_id").Element("AttrValue").Value;
                dto.AttachmentName = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "attmnt_name").Element("AttrValue").Value;
                dto.TicketHandle = attributes.FirstOrDefault(o => o.Element("AttrName").Value == "attached_persid").Element("AttrValue").Value;
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

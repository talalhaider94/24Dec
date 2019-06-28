using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.BusinessLogic;

namespace Quantis.WorkFlow.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class SDMController : ControllerBase
    {
        private IServiceDeskManagerService _sdmAPI;
        public SDMController(IServiceDeskManagerService sdmAPI)
        {
            _sdmAPI = sdmAPI;
        }
        [HttpGet("GetTicketsVerificationByUser")]
        public List<SDMTicketLVDTO> GetTicketsVerificationByUser(string period)
        {
            return _sdmAPI.GetTicketsVerificationByUser(HttpContext,period);
        }
        [HttpGet("GetTicketsSearchByUser")]
        public List<SDMTicketLVDTO> GetTicketsSearchByUser()
        {
            return _sdmAPI.GetTicketsRicercaByUser(HttpContext);
        }
        [HttpGet("GetAllTickets")]
        public List<SDMTicketLVDTO> GetAllTickets()
        {
            return _sdmAPI.GetAllTickets();
        }
        [HttpGet("TransferTicketByID")]
        public SDMTicketLVDTO TransferTicketByID(int id, string status, string description)
        {
            return _sdmAPI.TransferTicketByID(id,status, description);
        }

        [HttpGet("EscalateTicketbyID")]
        public SDMTicketLVDTO EscalateTicketbyID(int id, string status, string description)
        {
            return _sdmAPI.EscalateTicketbyID(id,status, description);
        }

        [HttpGet("CreateTicketByKPIID")]
        public SDMTicketLVDTO CreateTicketByKPIID(int id)
        {
            return _sdmAPI.CreateTicketByKPIID(id);
        }
        [HttpGet("GetTicketHistory")]
        public List<SDMTicketLogDTO> GetTicketHistory(int ticketId)
        {
            return _sdmAPI.GetTicketHistory(ticketId);
        }
        [HttpGet("GetAttachmentsByTicket")]
        public List<SDMAttachmentDTO> GetAttachmentsByTicket(int ticketId)
        {
            return _sdmAPI.GetAttachmentsByTicket(ticketId);
        }
        [HttpGet("DownloadAttachment")]
        public byte[] DownloadAttachment(string attachmentHandle)
        {
            return _sdmAPI.DownloadAttachment(attachmentHandle);
        }
        [HttpPost("UploadAttachmentToTicket")]
        public string UploadAttachmentToTicket([FromBody]SDMUploadAttachmentDTO dto)
        {
            return _sdmAPI.UploadAttachmentToTicket(dto);
        }
    }
}
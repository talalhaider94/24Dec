﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services;
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
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_KPI_VERIFICA)]
        [HttpGet("GetTicketsVerificationByUser")]
        public List<SDMTicketLVDTO> GetTicketsVerificationByUser(string period)
        {
            return _sdmAPI.GetTicketsVerificationByUser(HttpContext,period);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_RICERCA)]
        [HttpGet("GetTicketsSearchByUser")]
        public List<SDMTicketLVDTO> GetTicketsSearchByUser(string period)
        {
            return _sdmAPI.GetTicketsRicercaByUser(HttpContext, period);
        }
        [HttpGet("GetAllTickets")]
        public List<SDMTicketLVDTO> GetAllTickets()
        {
            return _sdmAPI.GetAllTickets();
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_KPI_VERIFICA)]
        [HttpGet("TransferTicketByID")]
        public ChangeStatusDTO TransferTicketByID(int id, string status, string description)
        {
            return _sdmAPI.TransferTicketByID(id,status, description);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_KPI_VERIFICA)]
        [HttpGet("EscalateTicketbyID")]
        public ChangeStatusDTO EscalateTicketbyID(int id, string status, string description)
        {
            return _sdmAPI.EscalateTicketbyID(id,status, description);
        }

        [HttpGet("CreateTicketByKPIID")]
        public SDMTicketLVDTO CreateTicketByKPIID(int id)
        {
            return _sdmAPI.CreateTicketByKPIID(id);
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetTicketHistory")]
        public List<SDMTicketLogDTO> GetTicketHistory(int ticketId)
        {
            return _sdmAPI.GetTicketHistory(ticketId);
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("GetAttachmentsByTicket")]
        public List<SDMAttachmentDTO> GetAttachmentsByTicket(int ticketId)
        {
            return _sdmAPI.GetAttachmentsByTicket(ticketId);
        }
        [Authorize(WorkFlowPermissions.BASIC_LOGIN)]
        [HttpGet("DownloadAttachment")]
        public byte[] DownloadAttachment(string attachmentHandle)
        {
            return _sdmAPI.DownloadAttachment(attachmentHandle);
        }
        [Authorize(WorkFlowPermissions.VIEW_WORKFLOW_KPI_VERIFICA)]
        [HttpPost("UploadAttachmentToTicket")]
        [DisableRequestSizeLimit]
        public string UploadAttachmentToTicket([FromBody]SDMUploadAttachmentDTO dto)
        {
            return _sdmAPI.UploadAttachmentToTicket(dto);
        }
    }
}
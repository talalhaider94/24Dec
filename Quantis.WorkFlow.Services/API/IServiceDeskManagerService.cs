using Quantis.WorkFlow.Services.DTOs.BusinessLogic;
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Http;
namespace Quantis.WorkFlow.Services.API
{
    public interface IServiceDeskManagerService
    {
        List<SDMTicketLVDTO> GetAllTickets();
        List<SDMTicketLVDTO> GetTicketsByUser(HttpContext context, bool filerOnPeriod);
        SDMTicketLVDTO CreateTicket(CreateTicketDTO dto);
        SDMTicketLVDTO CreateTicketByKPIID(int Id);
        SDMTicketLVDTO GetTicketByID(int Id);
        SDMTicketLVDTO TransferTicketByID(int id,string status, string description);
        SDMTicketLVDTO EscalateTicketbyID(int id, string status,string description);
        string UploadAttachmentToTicket(SDMUploadAttachmentDTO dto);

        byte[] DownloadAttachment(string attachmentHandle);
        List<SDMAttachmentDTO> GetAttachmentsByTicket(int ticketId);
        List<SDMTicketLogDTO> GetTicketHistory(int ticketId);
    }
}

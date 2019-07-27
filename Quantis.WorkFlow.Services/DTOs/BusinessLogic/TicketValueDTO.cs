using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BusinessLogic
{
    public class TicketValueDTO
    {
        public int TicketId { get; set; }
        public int NewValue { get; set; }
        public string Note { get; set; }
    }
}

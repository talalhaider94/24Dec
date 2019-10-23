using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class CreateBookletDTO
    {
        public List<int> ContractIds { get; set; }
        public string BookletDocumentId { get; set; }
        public string RecipientEmail { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BusinessLogic
{
    public class CreateTicketDTO
    {
        public string Summary { get; set; }
        public string Description { get; set; }
        
        public string Status { get; set; }
        public int GroupCategoryId { get; set; }
        public string Group { get; set; }
        public string ID_KPI { get; set; }
        public string Reference1 { get; set; }
        public string Reference2 { get; set; }
        public string Reference3 { get; set; }
        public string Period { get; set; }
        public int primary_contract_party { get; set; }
        public int? secondary_contract_party { get; set; }
    }
}

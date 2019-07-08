using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BusinessLogic
{
    public class SDMTicketLVDTO
    {
        public string Id { get; set; }
        public string ref_num { get; set; }
        public string Summary { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Group { get; set; }
        public string ID_KPI { get; set; }
        public string Reference1 { get; set; }
        public string Reference2 { get; set; }
        public string Reference3 { get; set; }
        public string Period { get; set; }
        public string primary_contract_party { get; set; }
        public string secondary_contract_party { get; set; }
        public bool IsClosed { get; set; }
    }
}

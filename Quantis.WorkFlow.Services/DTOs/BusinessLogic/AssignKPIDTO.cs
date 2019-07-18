using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BusinessLogic
{
    public class AssignKPIDTO
    {
        public int userId { get; set; }
        public int contractId { get; set; }
        public List<int> kpiIds { get; set; }
    }
}

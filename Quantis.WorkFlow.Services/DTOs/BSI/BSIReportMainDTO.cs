using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BSI
{
    public class BSIReportMainDTO
    {
        public string Name { get; set; }
        public string ResultType { get; set; }
        public List<BSIReportDetailDTO> Reports { get; set; }
    }
}

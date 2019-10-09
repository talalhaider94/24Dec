using Quantis.WorkFlow.Services.DTOs.API;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.OracleAPI
{
    public class BSIFreeFormReportDTO
    {
        public BSIFreeFormReportDTO()
        {
            Parameters = new List<KeyValuePairDTO>();
        }
        public int ReportId { get; set; }
        public string ReportName { get; set; }
        public string ReportDescription { get; set; }
        public string Query { get; set; }
        public List<KeyValuePairDTO> Parameters { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; }

    }
}

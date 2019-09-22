using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class ReportQueryDetailDTO
    {
        public int Id { get; set; }
        public string QueryName { get; set; }
        public string QueryText { get; set; }
        public List<KeyValuePair<string,string>> Parameters { get; set; }
    }
}

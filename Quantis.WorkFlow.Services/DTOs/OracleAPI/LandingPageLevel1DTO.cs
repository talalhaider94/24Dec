using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.OracleAPI
{
    public class LandingPageLevel1DTO : LandingPageContractDTO
    {
        public List<LandingPageKPIDTO> BestKPIs { get; set; }
        public List<LandingPageKPIDTO> WorstKPIs { get; set; }
    }
}

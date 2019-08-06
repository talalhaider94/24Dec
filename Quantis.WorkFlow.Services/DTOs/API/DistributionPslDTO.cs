using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class DistributionPslDTO
    {
        public PslResultDTO previousPeriod { get; set; }
        public PslResultDTO currentPeriod { get;set; }
    }
}

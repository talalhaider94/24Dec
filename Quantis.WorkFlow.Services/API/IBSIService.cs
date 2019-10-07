using Quantis.WorkFlow.Services.DTOs.BSI;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IBSIService
    {
        List<BSIReportLVDTO> GetMyNormalReports(string userName);
        List<BSIReportLVDTO> GetAllNormalReports(string userName);
        BSIReportMainDTO GetReportDetail(string userName, int reportId);
    }
}

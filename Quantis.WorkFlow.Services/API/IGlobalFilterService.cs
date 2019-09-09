using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.API
{
    public interface IGlobalFilterService
    {
        BaseWidgetDTO MapBaseWidget(WidgetParametersDTO props);
        WidgetwithAggOptionDTO MapAggOptionWidget(WidgetParametersDTO props);
        string GetDefualtDateRange();
        List<HierarchicalNameCodeDTO> GetOrganizationHierarcy(int globalFilterId, int userId);

        List<KeyValuePair<int, string>> GetContractParties(int globalFilterId, int userId);
        List<KeyValuePair<int, string>> GetContracts(int globalFilterId, int userId, int contractpartyId);
        List<KeyValuePair<int, string>> GetKPIs(int globalFilterId, int userId, int contractId);
    }
}

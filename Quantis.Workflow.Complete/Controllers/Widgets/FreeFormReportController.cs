using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    public class FreeFormReportController : BaseWidgetController
    {
        private IDataService _dataService { get; set; }
        public FreeFormReportController(IDataService dataService)
        {
            _dataService = dataService;
        }
        internal override void FillWidgetParameters(WidgetViewModel vm)
        {
            vm.ShowMeasure = true;
            vm.ShowOrganization = false;
            var selfqueries=_dataService.GetOwnedReportQueries(GetUserId());
            var assignedQueries = _dataService.GetAssignedReportQueries(GetUserId());
            foreach(var q in selfqueries)
            {
                vm.Measures.Add(q.Id, q.QueryName);
            }
            foreach (var q in selfqueries)
            {
                vm.Measures.Add(q.Id, q.QueryName);
            }
        }

        internal override object GetData(WidgetParametersDTO props)
        {
            var queryId = Int32.Parse(props.Properties["measure"]);
            var queryDetail=_dataService.GetReportQueryDetailByID(queryId,GetUserId());
            var parameters=props.Properties["parameters"];
            queryDetail.Parameters = JsonConvert.DeserializeObject<List<KeyValuePairDTO>>(parameters);            
            var result=_dataService.ExecuteReportQuery(queryDetail);
            return result;
        }
    }
}

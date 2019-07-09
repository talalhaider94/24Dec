using Microsoft.Extensions.DependencyInjection;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Quantis.WorkFlow.Jobs.Jobs
{
    [DisallowConcurrentExecution]
    public class CreateTicketsJob:IJob
    {
        private readonly IServiceProvider _provider;
        public CreateTicketsJob(IServiceProvider provider)
        {
            _provider = provider;
        }
        public Task Execute(IJobExecutionContext context)
        {
            using (var scope = _provider.CreateScope())
            {
                // Resolve the Scoped service
                var sdmservice = scope.ServiceProvider.GetService<IServiceDeskManagerService>();
                var informationservice = scope.ServiceProvider.GetService<IInformationService>();
                var dbcontext = scope.ServiceProvider.GetService<WorkFlowPostgreSqlContext>();
                var dayworkflow= informationservice.GetConfiguration("be_restserver", "day_workflow");
                dbcontext.LogInformation("Create Ticket Job Running");
                if (dayworkflow!=null)
                {
                    int Idayworkflow = int.Parse(dayworkflow.Value);
                    if (DateTime.Now.Day == Idayworkflow)
                    {
                        string month = DateTime.Now.Month.ToString();
                        var kpis=dbcontext.CatalogKpi.Where(o => !string.IsNullOrEmpty(o.month)).ToList();
                        kpis = kpis.Where(o => o.month.Split(',').ToList().Contains(month)).ToList();
                        dbcontext.LogInformation("Create Ticket Job Running: KPIS ids are "+string.Join(',',kpis.Select(o=>o.id)));
                        foreach(var k in kpis)
                        {
                            sdmservice.CreateTicketByKPIID(k.id);
                        }
                    }
                }

            }

            return Task.CompletedTask;
        }
    }
}

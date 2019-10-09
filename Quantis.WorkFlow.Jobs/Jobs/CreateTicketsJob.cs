using Microsoft.Extensions.DependencyInjection;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quartz;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Quantis.WorkFlow.Jobs.Jobs
{
    [DisallowConcurrentExecution]
    public class CreateTicketsJob : IJob
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
                var dayworkflow = informationservice.GetConfiguration("be_restserver", "day_workflow");
                dbcontext.LogInformation("Create Ticket Job Running");
                if (dayworkflow != null)
                {
                    int Idayworkflow = int.Parse(dayworkflow.Value);
                    if (DateTime.Now.Day == Idayworkflow)
                    {
                        string month = DateTime.Now.Month.ToString();
                        var kpis = dbcontext.CatalogKpi.Where(o => !string.IsNullOrEmpty(o.month) && o.enable_wf).ToList();
                        kpis = kpis.Where(o => o.month.Split(',').ToList().Contains(month)).ToList();
                        foreach (var k in kpis)
                        {
                            try
                            {
                                if (dbcontext.SDMTicketFact.Any(o => o.global_rule_id == k.global_rule_id_bsi))
                                {
                                    var lastPeriod = dbcontext.SDMTicketFact.Where(o => o.global_rule_id == k.global_rule_id_bsi).Max(p => p.created_on);
                                    if (lastPeriod.Month + (lastPeriod.Year * 12) != DateTime.Now.Month + (DateTime.Now.Year * 12))
                                    {
                                        var tic = sdmservice.CreateTicketByKPIID(k.id);
                                        dbcontext.LogInformation("Create Ticket Job(YES): Ticket created with kpiId: " + k.id + " ticket ref: " + tic.ref_num);
                                    }
                                }
                                else
                                {
                                    var tic = sdmservice.CreateTicketByKPIID(k.id);
                                    dbcontext.LogInformation("Create Ticket Job(YES): Ticket created with kpiId: " + k.id + " ticket ref: " + tic.ref_num);
                                }


                            }
                            catch (Exception e)
                            {
                                dbcontext.LogInformation("Create Ticket Job(NO): Ticket creation failed with kpiId: " + k.id + " with msg: " + e.Message);
                            }

                        }


                    }
                }

            }

            return Task.CompletedTask;
        }
    }
}

using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quartz;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Quantis.WorkFlow.Jobs
{
    [DisallowConcurrentExecution]
    public class HelloWorldJob : IJob
    {
        private readonly IServiceProvider _provider;
        public HelloWorldJob(IServiceProvider provider)
        {
            _provider = provider;
        }

        public Task Execute(IJobExecutionContext context)
        {
            using (var scope = _provider.CreateScope())
            {
                // Resolve the Scoped service
                var service = scope.ServiceProvider.GetService<IInformationService>();
                var dbcontext= scope.ServiceProvider.GetService<WorkFlowPostgreSqlContext>();
                var val = service.GetConfiguration("be_scheduler", "slave_1");
                string f = string.Format("java -jar {0}", val.Value);
                var res=f.Bash();
                dbcontext.LogInformation("Job Executed: The command is: " + f + " and result is: " + res);
            }

            return Task.CompletedTask;
        }
    }
}

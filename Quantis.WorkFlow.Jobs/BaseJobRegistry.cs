using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Jobs
{
    public static class BaseJobRegistry
    {
        public static void RegisterServices(IServiceCollection services, IConfiguration conf)
        {
            
            if (conf["SchedularEnable"] == "True")
            {
                services.AddSingleton<IJobFactory, SingletonJobFactory>();
                services.AddSingleton<ISchedulerFactory, StdSchedulerFactory>();

                string exp = conf["CronJob1Expression"];
                services.AddSingleton<HelloWorldJob>();
                services.AddSingleton(new JobSchedule(
                    jobType: typeof(HelloWorldJob),
                    cronExpression: exp)); // run every 5 seconds


                services.AddHostedService<QuartzHostedService>();
            }
                        
        }
    }
}

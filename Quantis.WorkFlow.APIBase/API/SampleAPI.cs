using Quantis.WorkFlow.Services.API;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class SampleAPI : ISampleAPI
    {
        public string GetSampleString()
        {
            return "Hello from Sample API";
        }
    }
}

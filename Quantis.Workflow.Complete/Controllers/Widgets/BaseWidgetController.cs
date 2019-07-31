using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;

namespace Quantis.Workflow.Complete.Controllers.Widgets
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public abstract class BaseWidgetController : ControllerBase
    {
        [HttpPost("Index")]
        public object Index(WidgetParametersDTO props)
        {
            return GetData(props);
        }
        [HttpGet("GetWidgetParameters")]
        public WidgetViewModel GetWidgetParameters()
        {
            var vm = new WidgetViewModel();
            FillWidgetParameters(vm);
            return vm;
        }

        internal abstract void FillWidgetParameters(WidgetViewModel vm);
        internal abstract object GetData(WidgetParametersDTO props);

    }
}
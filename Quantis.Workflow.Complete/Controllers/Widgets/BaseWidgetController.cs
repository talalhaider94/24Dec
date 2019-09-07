using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using Quantis.WorkFlow.Services.Framework;

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
            props.UserId = GetUserId();
            return GetData(props);
        }
        [HttpGet("GetWidgetParameters")]
        public WidgetViewModel GetWidgetParameSters()
        {
            var vm = new WidgetViewModel();
            FillDateTypes(vm);
            FillWidgetParameters(vm);
            return vm;
        }

        internal abstract void FillWidgetParameters(WidgetViewModel vm);
        internal abstract object GetData(WidgetParametersDTO props);
        private void FillDateTypes(WidgetViewModel vm)
        {
            vm.DateTypes.Add(0, "Custom");
            vm.DateTypes.Add(1, "Last Month");
            vm.DateTypes.Add(2, "Last 2 Months");
            vm.DateTypes.Add(3, "Last 3 Months");
            vm.DateTypes.Add(4, "Last 6 Months");
        }

        private int GetUserId()
        {
            var usr = HttpContext.User as AuthUser;
            if (usr == null)
            {
                return -1;
            }
            return usr.UserId;
        }

    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.API;

namespace Quantis.Workflow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class BSIController : ControllerBase
    {
        private IBSIService _bsiAPI { get; set; }
        public BSIController (IBSIService bsiAPI)
        {
            _bsiAPI = bsiAPI;
        }
        [HttpGet("Sample")]
        public int Sample()
        {
            return _bsiAPI.Sample();
        }
    }
}
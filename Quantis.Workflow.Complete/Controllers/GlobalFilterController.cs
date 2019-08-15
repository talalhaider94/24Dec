using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Information;

namespace Quantis.Workflow.Complete.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowOrigin")]
    public class GlobalFilterController : ControllerBase
    {
        private IGlobalFilterService _globalfilterService;
        public GlobalFilterController(IGlobalFilterService globalfilterService)
        {
            _globalfilterService = globalfilterService;
        }

        [HttpGet("GetOrganizationHierarcy")]
        public List<HierarchicalNameCodeDTO> GetOrganizationHierarcy(int globalFilterId)
        {
            return _globalfilterService.GetOrganizationHierarcy(globalFilterId);
        }
    }
}
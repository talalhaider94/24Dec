using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quantis.WorkFlow.Services.Framework;

namespace Quantis.WorkFlow.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private ISMTPService iSMTPService;

        public TestController(ISMTPService iSMTPService)
        {
            this.iSMTPService = iSMTPService;
        }

        [HttpGet("testemail")] 
        public bool testEmail()
        {
            List<string> listRecipients = new List<string>();

            listRecipients.Add("marco.costa@quantis.it");

            return iSMTPService.SendEmail("my subject", "my body", listRecipients);
        }
    }
}
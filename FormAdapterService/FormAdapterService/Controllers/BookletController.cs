using EventForm.bcfed9e1.Class5;
using FormAdapterService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace FormAdapterService.Controllers
{
    public class BookletController : ApiController
    {
        [HttpPost]
        public string CreateBooklet([FromBody]CreateBookletDTO dto)
        {
            try
            {
                Class5 class5 = new Class5(dto.MainPath);
                int result = class5.CreateBooklet(dto.ListContract, dto.UserId, dto.BookletDocumentId, dto.MailSetup);
                return result+"";
            }
            catch(Exception e)
            {
                return e.Message;
            }
            
        }
    }
}

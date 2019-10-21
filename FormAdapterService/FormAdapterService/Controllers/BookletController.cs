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
        public int CreateBooklet(CreateBookletDTO dto)
        {
            Class5 class5 = new Class5(dto.MainPath);
            int result=class5.CreateBooklet(dto.ListContract, dto.UserId, dto.BookletDocumentId, dto.MailSetup);
            return result;
        }
    }
}

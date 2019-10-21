using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FormAdapterService.Models
{
    public class CreateBookletDTO
    {
        public string MainPath { get; set; }
        public Dictionary<string,string> ListContract { get; set; }
        public int UserId { get; set; }
        public string BookletDocumentId { get; set; }
        public List<string> MailSetup { get; set; }
    }
}
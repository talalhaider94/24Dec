using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CreateBookletConsole
{
    public class CreateBookletDTO
    {
        public string MainPath { get; set; }
        public Dictionary<string, string> ListContract { get; set; }
        public int UserId { get; set; }
        public string BookletDocumentId { get; set; }
        public List<string> MailSetup { get; set; }
    }
}

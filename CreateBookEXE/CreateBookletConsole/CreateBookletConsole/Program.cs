using EventForm.bcfed9e1.Class5;
using Newtonsoft.Json;

namespace CreateBookletConsole
{
    class Program
    {
        static int Main(string[] args)
        {
            string path = args[0];
            string text=System.IO.File.ReadAllText(path);
            var dto=JsonConvert.DeserializeObject<CreateBookletDTO>(text);
            var class5 = new Class5(dto.MainPath);
            return class5.CreateBooklet(dto.ListContract, dto.UserId, dto.BookletDocumentId, dto.MailSetup);
        }
    }
}

using System;
using System.Threading;
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
            int totalNumbers = dto.ListContract.Count;
            int currentNumber = 1;
            foreach (var key in dto.ListContract.Keys)
            {
                try
                {
                    currentNumber++;
                    var intKey = int.Parse(key);
                    var value = dto.ListContract[key];
                    class5.CreateSingleBooklet(intKey, value, dto.UserId, dto.BookletDocumentId, dto.MailSetup, currentNumber, totalNumbers);
                }
                catch (Exception e)
                {

                }

            }

            return 1;
            //return class5.CreateBooklet(dto.ListContract, dto.UserId, dto.BookletDocumentId, dto.MailSetup);
        }
    }
}

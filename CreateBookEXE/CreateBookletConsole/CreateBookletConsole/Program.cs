using System;
using System.Threading;
using System.Threading.Tasks;
using EventForm.bcfed9e1.Class5;
using Newtonsoft.Json;

namespace CreateBookletConsole
{
    class Program
    {
        private static volatile int currentNumber = 1;
        static int Main(string[] args)
        {
            string path = args[0];
            string text=System.IO.File.ReadAllText(path);
            var dto=JsonConvert.DeserializeObject<CreateBookletDTO>(text);
            var class5 = new Class5(dto.MainPath);
            int totalNumbers = dto.ListContract.Count;
            string requestId = DateTime.Now.ToString("dd-MM-yyyy HH-mm-ss");
            Parallel.ForEach(dto.ListContract.Keys, (key) =>
            {
                try
                {
                    var intKey = int.Parse(key);
                    var value = dto.ListContract[key];
                    class5.CreateSingleBooklet(intKey, value, dto.UserId, dto.BookletDocumentId, dto.MailSetup, currentNumber, totalNumbers, requestId);
                }
                catch (Exception e)
                {

                }
                finally
                {
                    currentNumber++;
                }
            });

            return 1;
            //return class5.CreateBooklet(dto.ListContract, dto.UserId, dto.BookletDocumentId, dto.MailSetup);
        }
    }
}

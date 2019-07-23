using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.Framework
{
    public interface ISMTPService
    {
        bool SendEmail(string subject, string body, List<string> recipients);
    }
}

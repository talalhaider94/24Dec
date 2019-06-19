using Quantis.WorkFlow.Services.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class UserFilterDTO:PagingInfo
    {
        public string SearchText { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
    }
}

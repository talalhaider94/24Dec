using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.BusinessLogic
{
    public class ChangeStatusDTO
    {
        public bool IsSDMStatusChanged { get; set; }
        public bool IsBSIStatusChanged { get; set; }
        public ChangeStatusDTO()
        {
            IsSDMStatusChanged = false;
            IsBSIStatusChanged = false;
        }
    }
}

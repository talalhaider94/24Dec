﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Dashboard
{
    public class DashboardDTO: BaseIdNameDTO
    {   
        public string Owner { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
    }
}

﻿using System;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class ReportQueryLVDTO
    {
        public int Id { get; set; }
        public string QueryName { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; }
        public int ParameterCount { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
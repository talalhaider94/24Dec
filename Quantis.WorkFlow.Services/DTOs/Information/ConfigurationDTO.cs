using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Information
{
    public class ConfigurationDTO
    {
        public string Owner { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
        public bool IsEnable { get; set; }
        public string Description { get; set; }
    }
}

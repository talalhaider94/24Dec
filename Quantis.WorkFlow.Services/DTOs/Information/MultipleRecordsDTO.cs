using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Information
{
    public class MultipleRecordsDTO
    {
        public int Id { get; set; }
        public List<int> Ids { get; set; }
    }
}

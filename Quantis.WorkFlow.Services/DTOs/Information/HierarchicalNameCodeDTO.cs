using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Information
{
    public class HierarchicalNameCodeDTO :BaseNameCodeDTO
    {
        public HierarchicalNameCodeDTO(int id, string name, string code) : base(id, name, code)
        {
            Children = null;
        }
        public IList<HierarchicalNameCodeDTO> Children { get; set; }
    }
}

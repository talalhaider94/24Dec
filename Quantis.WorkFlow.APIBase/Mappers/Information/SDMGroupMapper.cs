using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models.SDM;
using Quantis.WorkFlow.Services.DTOs.Information;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.Mappers.Information
{
    public class SDMGroupMapper : MappingService<SDMGroupDTO, SDM_TicketGroup>
    {
        public override SDMGroupDTO GetDTO(SDM_TicketGroup e)
        {
            return new SDMGroupDTO()
            {
                name = e.name,
                handle = e.handle,
                id = e.id,
                step = e.step,
                category=e.category
            };
        }

        public override SDM_TicketGroup GetEntity(SDMGroupDTO o, SDM_TicketGroup e)
        {
            e.name = o.name;
            e.handle = o.handle;
            e.step = o.step;
            e.category = o.category;
            return e;

        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models.SDM
{
    public class SDM_TicketStatus
    {
        public int id { get; set; }
        public string handle { get; set; }
        public string name { get; set; }
        public int step { get; set; }
    }
    public class SDM_TicketStatus_Configuration : IEntityTypeConfiguration<SDM_TicketStatus>
    {
        public void Configure(EntityTypeBuilder<SDM_TicketStatus> builder)
        {
            builder.ToTable("sdm_ticket_status");
            builder.HasKey(o => o.id);
        }
    }
}

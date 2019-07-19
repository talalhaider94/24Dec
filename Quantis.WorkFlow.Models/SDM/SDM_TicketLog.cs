using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models.SDM
{
    public class SDM_TicketLog
    {
        public int id { get; set; }
        public int ticket_id { get; set; }
        public string period { get; set; }
        public int global_rule_id { get; set; }
        public DateTime create_timestamp { get; set; }
    }
    public class SDM_TicketLog_Configuration : IEntityTypeConfiguration<SDM_TicketLog>
    {
        public void Configure(EntityTypeBuilder<SDM_TicketLog> builder)
        {
            builder.ToTable("sdm_ticket_logs");
            builder.HasKey(o => o.id);
        }
    }
}

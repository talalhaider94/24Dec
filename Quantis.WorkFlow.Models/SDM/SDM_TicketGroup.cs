﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models.SDM
{
    public class SDM_TicketGroup
    {
        public int id { get; set; }
        public string handle { get; set; }
        public string name { get; set; }
        public string category { get; set; }
        public int step { get; set; }
    }
    public class SDM_TicketGroup_Configuration : IEntityTypeConfiguration<SDM_TicketGroup>
    {
        public void Configure(EntityTypeBuilder<SDM_TicketGroup> builder)
        {
            builder.ToTable("sdm_ticket_group");
            builder.HasKey(o => o.id);
        }
    }
}

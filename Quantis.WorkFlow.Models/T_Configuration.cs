﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models
{
    public class T_Configuration
    {
        public int id { get; set; }
        public string owner { get; set; }
        public string key { get; set; }
        public string value { get; set; }
        public bool enable { get; set; }
    }
    public class T_Configuration_Configuration : IEntityTypeConfiguration<T_Configuration>
    {
        public void Configure(EntityTypeBuilder<T_Configuration> builder)
        {
            builder.ToTable("t_configuration");
            builder.HasKey(o => o.id);
        }
    }
}

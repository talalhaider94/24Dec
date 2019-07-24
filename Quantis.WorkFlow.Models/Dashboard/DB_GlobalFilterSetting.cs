using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models.Dashboard
{
    public class DB_GlobalFilterSetting
    {
        public int Id { get; set; }
        public string FilterKey { get; set; }
        public string FilterValue { get; set; }
        public int GlobalFilterId { get; set; }
        public virtual DB_GlobalFilter GlobalFilter { get; set; }
    }
    public class DB_GlobalFilterSetting_Configuration : IEntityTypeConfiguration<DB_GlobalFilterSetting>
    {
        public void Configure(EntityTypeBuilder<DB_GlobalFilterSetting> builder)
        {
            builder.ToTable("DB_GlobalFilterSettings");
            builder.HasKey(o => o.Id);
            builder.HasOne(o => o.GlobalFilter).WithMany(o => o.GlobalFilterSettings).HasForeignKey(o => o.GlobalFilterId);
        }
    }
}

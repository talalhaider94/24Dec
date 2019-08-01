using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Models.Dashboard
{
    public class DB_Dashboard
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string UserId { get; set; }
        public DateTime CreatedOn { get; set; }
        public bool IsActive { get; set; }
        public virtual List<DB_DashboardWidget> DashboardWidgets {get;set;}
    }
    public class DB_Dashboard_Configuration : IEntityTypeConfiguration<DB_Dashboard>
    {
        public void Configure(EntityTypeBuilder<DB_Dashboard> builder)
        {
            builder.ToTable("db_dashboards");
            builder.HasKey(o => o.Id);
            builder.HasMany(o => o.DashboardWidgets).WithOne(o => o.Dashboard).HasForeignKey(o => o.DashboardId);
        }
    }
}

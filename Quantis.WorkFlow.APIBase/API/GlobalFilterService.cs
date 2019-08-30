using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Dashboard;
using Quantis.WorkFlow.Services.DTOs.Information;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class GlobalFilterService: IGlobalFilterService
    {
        private readonly IInformationService _infoService;
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private readonly IConfiguration _configuration;
        private string defaultDateRange = "06/2019-08/2019";
        public GlobalFilterService(IInformationService infoService,WorkFlowPostgreSqlContext dbcontext, IConfiguration configuration)
        {
            _infoService = infoService;
            _dbcontext = dbcontext;
            _configuration = configuration;
            var val=_infoService.GetConfiguration("defaultdaterange", "dashboard");
            if (val != null)
            {
                defaultDateRange = val.Value;
            }
        }
        public string GetDefualtDateRange()
        {
            return defaultDateRange;
        }
        public BaseWidgetDTO MapBaseWidget(WidgetParametersDTO props)
        {
            var dto = new BaseWidgetDTO();
            if (props.Filters.ContainsKey("daterange"))
            {
                var daterange = props.Filters["daterange"];
                var range = daterange.Split('-');
                dto.DateRange = new Tuple<DateTime, DateTime>(DateTime.Parse(range[0]), DateTime.Parse(range[1]));
            }
            else
            {
                var daterange = defaultDateRange;
                var range = daterange.Split('-');
                dto.DateRange = new Tuple<DateTime, DateTime>(DateTime.Parse(range[0]), DateTime.Parse(range[1]));
            }
            if (props.Filters.ContainsKey("date"))
            {
                var range = props.Filters["date"];
                dto.Date = DateTime.ParseExact(range, "MM/yy", CultureInfo.InvariantCulture);
            }
            else
            {
                dto.Date = DateTime.Now.AddMonths(-1);
            }
            if (props.Properties.ContainsKey("measure"))
            {
                dto.Measures = new List<Measures>() { (Measures)Int32.Parse(props.Properties["measure"]) };
            }
            else
            {
                dto.Measures = new List<Measures>();
            }
            dto.KPIs = new List<int>();
            return dto;
        }
        public WidgetwithAggOptionDTO MapAggOptionWidget(WidgetParametersDTO props)
        {
            var map = MapBaseWidget(props);
            var dto = new WidgetwithAggOptionDTO()
            {
                DateRange=map.DateRange,
                KPIs=map.KPIs,
                Measures=map.Measures,
            };
            if (props.Properties.ContainsKey("aggregationoption"))
            {
                dto.AggregationOption = props.Properties["aggregationoption"];                
            }
            else
            {
                dto.AggregationOption = "";
            }
            return dto;
        }

        public List<HierarchicalNameCodeDTO> GetOrganizationHierarcy(int globalFilterId,int userId)
        {
            try
            {
                var res = new List<UserKPIDTO>();
                string query = @"select m.sla_id,m.sla_name,c.customer_name,c.customer_id 
                                from t_sla_versions s
                                left join t_slas m on m.sla_id = s.sla_id
                                left join t_customers c on m.customer_id = c.customer_id
                                left join t_rules r on r.sla_version_id = s.sla_version_id
                                left join t_user_kpis uk on r.global_rule_id = uk.global_rule_id
                                where s.sla_status = 'EFFECTIVE'
                                AND m.sla_status = 'EFFECTIVE'
                                and uk.user_id = :user_id
                                group by m.sla_id,m.sla_name,c.customer_name,c.customer_id ";
                using (var con = new NpgsqlConnection(_configuration.GetConnectionString("DataAccessPostgreSqlProvider")))
                {
                    con.Open();
                    var command = new NpgsqlCommand(query, con);
                    command.CommandType = CommandType.Text;
                    command.Parameters.AddWithValue(":user_id", userId);
                    command.CommandText = query;
                    using (var result = command.ExecuteReader())
                    {
                        while (result.Read())
                        {
                            res.Add(new UserKPIDTO()
                            {
                                Sla_Id = Decimal.ToInt32((Decimal)result[0]),
                                Sla_Name = (string)result[1],
                                Customer_name = (string)result[2],
                                Customer_Id = (int)result[3],
                            });
                        }
                    }
                    var ret=res.GroupBy(o => new { o.Customer_name, o.Customer_Id }).Select(p => new HierarchicalNameCodeDTO(p.Key.Customer_Id, p.Key.Customer_name, p.Key.Customer_name)
                    {
                        Children = p.Select(q => new HierarchicalNameCodeDTO(q.Sla_Id, q.Sla_Name, q.Sla_Name)).ToList()
                    }).ToList();
                    return ret;

                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }

    }
}

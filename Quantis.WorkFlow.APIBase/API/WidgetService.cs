using Oracle.ManagedDataAccess.Client;
using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Services.API;
using Quantis.WorkFlow.Services.DTOs.Widgets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.API
{
    public class WidgetService : IWidgetService
    {
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        private static string _connectionstring = null;
        public WidgetService(WorkFlowPostgreSqlContext dbcontext){
            _dbcontext = dbcontext;
            if (_connectionstring == null)
            {
                _connectionstring = QuantisUtilities.GetOracleConnectionString(_dbcontext);
            }
        }
        public List<XYDTO> GetKPICountTrend(WidgetwithAggOptionDTO dto)
        {
            var result = new List<XYDTO>();
            var facts= _dbcontext.SDMTicketFact.Where(o => o.period_month >= dto.DateRange.Item1.Month && o.period_year >= dto.DateRange.Item1.Year && o.period_month <= dto.DateRange.Item2.Month && o.period_year <= dto.DateRange.Item2.Year);
            if (dto.KPIs.Any())
            {
                facts = facts.Where(o => dto.KPIs.Contains(o.global_rule_id));
            }
            if (dto.Measures.FirstOrDefault() == Measures.Number_of_ticket_in_KPI_in_Verifica)
            {
                if (dto.AggregationOption == AggregationOption.ANNAUL.Key)
                {
                    result = facts.GroupBy(o => o.period_year).Select(p => new XYDTO()
                    {
                        XValue = p.Key + "",
                        YValue = p.Count(r=>(p.Key == r.period_year ? true : false))  //was p.Count() @SHAHZAD pls check this, it was not working "exception near AS"
                    }).OrderBy(o => o.XValue).ToList();
                }
                else
                {
                    result = facts.GroupBy(o => new { o.period_year,o.period_month }).Select(p => new XYDTO()
                    {
                        XValue = p.Key.period_month + "/"+p.Key.period_year,
                        YValue = p.Count()
                    }).ToList();
                }
            }
            else if (dto.Measures.FirstOrDefault() == Measures.Number_of_ticket_of_KPI_Compliant)
            {
                if (dto.AggregationOption == AggregationOption.ANNAUL.Key)
                {
                    result = facts.GroupBy(o => o.period_year).Select(p => new XYDTO()
                    {
                        XValue = p.Key + "",
                        YValue = p.Count(r=>r.complaint)
                    }).OrderBy(o => o.XValue).ToList();
                }
                else
                {
                    result = facts.GroupBy(o => new { o.period_year, o.period_month }).Select(p => new XYDTO()
                    {
                        XValue = p.Key.period_month + "/" + p.Key.period_year,
                        YValue = p.Count(r => r.complaint)
                    }).ToList();
                }
            }
            else if (dto.Measures.FirstOrDefault() == Measures.Number_of_ticket_of_KPI_Non_Calcolato)
            {
                if (dto.AggregationOption == AggregationOption.ANNAUL.Key)
                {
                    result = facts.GroupBy(o => o.period_year).Select(p => new XYDTO()
                    {
                        XValue = p.Key + "",
                        YValue = p.Count(r => r.notcalculated)
                    }).OrderBy(o => o.XValue).ToList();
                }
                else
                {
                    result = facts.GroupBy(o => new { o.period_year, o.period_month }).Select(p => new XYDTO()
                    {
                        XValue = p.Key.period_month + "/" + p.Key.period_year,
                        YValue = p.Count(r => r.notcalculated)
                    }).ToList();
                }
            }
            else if (dto.Measures.FirstOrDefault() == Measures.Number_of_ticket_of_KPI_Non_Compliant)
            {
                if (dto.AggregationOption == AggregationOption.ANNAUL.Key)
                {
                    result = facts.GroupBy(o => o.period_year).Select(p => new XYDTO()
                    {
                        XValue = p.Key + "",
                        YValue = p.Count(r => r.notcomplaint)
                    }).OrderBy(o => o.XValue).ToList();
                }
                else
                {
                    result = facts.GroupBy(o => new { o.period_year, o.period_month }).Select(p => new XYDTO()
                    {
                        XValue = p.Key.period_month + "/" + p.Key.period_year,
                        YValue = p.Count(r => r.notcomplaint)
                    }).ToList();
                }
            }
            else if(dto.Measures.FirstOrDefault() == Measures.Number_of_Total_KPI_compliant || dto.Measures.FirstOrDefault() == Measures.Number_of_Total_KPI_not_compliant)
            {
                string signcomplaint = "<";
                if(dto.Measures.FirstOrDefault() == Measures.Number_of_Total_KPI_not_compliant)
                {
                    signcomplaint = ">";
                }
                string query = @"select 
                                psl.end_period,
                                count(1)
                                from 
                                (
                                  select  
                                  temp.global_rule_id, 
                                  temp.time_stamp as timestamp, 
                                  temp.time_stamp_utc as end_period, 
                                  temp.begin_time_stamp_utc as start_period, 
                                  temp.sla_id, 
                                  temp.rule_id, 
                                  temp.time_unit,
                                  temp.interval_length, 
                                  temp.is_period, 
                                  temp.service_level_target, 
                                  temp.service_level_target_ce, 
                                  temp.provided_ce, 
                                  temp.deviation_ce, 
                                  temp.complete_record,
                                  temp.sla_version_id, 
                                  temp.metric_type_id, 
                                  temp.domain_category_id, 
                                  temp.service_domain_id,
                                  case 
                                    when deviation_ce > 0 then 'non compliant'
                                    when deviation_ce < 0 then 'compliant'
                                    else 'nc'
                                  end as resultPsl
                                  from 
                                  (
                                    select * 
                                    from t_psl_0_month pm
                                    union all
                                    select * 
                                    from t_psl_0_quarter pq
                                    union all
                                    select * 
                                    from t_psl_0_year py
                                    union all
                                    select * 
                                    from t_psl_1_all pa
                                  ) temp
                                  where provided is not null 
                                  and service_level_target is not null
                                ) psl 
                                left join t_rules r on  psl.rule_id = r.rule_id
                                left join t_sla_versions sv on r.sla_version_id = sv.sla_version_id
                                left join t_slas s on sv.sla_id = s.sla_id
                                where r.is_effective = 'Y' AND s.sla_status = 'EFFECTIVE'
                                and psl.time_unit='MONTH'
                                and psl.complete_record=1
                                and psl.start_period >= TO_DATE(:start_period,'yyyy-mm-dd')
                                and psl.end_period <= TO_DATE(:end_period,'yyyy-mm-dd')
                                and psl.global_rule_id in ({0})
                                and psl.deviation_ce {1} 0
                                group by psl.end_period";
                query = string.Format(query, string.Join(',', dto.KPIs),signcomplaint);
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("start_period", dto.DateRange.Item1.AddDays(-1).ToString("yyyy-MM-dd"));
                        OracleParameter param2 = new OracleParameter("end_period", dto.DateRange.Item2.AddMonths(1).AddDays(-1).ToString("yyyy-MM-dd"));
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        while (reader.Read())
                        {
                            result.Add(new XYDTO()
                            {
                                XValue = ((DateTime)reader[0]).ToString("MM/yy"),
                                YValue = (long)reader[1]
                            });
                        }
                    }
                }
                if (dto.AggregationOption == AggregationOption.ANNAUL.Key)
                {
                    result=result.GroupBy(o => o.XValue.Split('/')[1]).Select(p => new XYDTO() { XValue = p.Key, YValue = p.Sum(q => q.YValue) }).ToList();
                }
            }
            return result;


        }
        public XYDTO GetCatalogPendingCount()
        {
            return new XYDTO()
            {
                XValue = "",
                YValue = 2
            };
        }
        public List<XYDTO> GetDistributionByVerifica(BaseWidgetDTO dto)
        {
            var res = new List<XYDTO>();
            res.Add(new XYDTO() { XValue = "Compliant", YValue = 30 });
            res.Add(new XYDTO() { XValue = "Non Compliant", YValue = 20 });
            res.Add(new XYDTO() { XValue = "Non Calculato", YValue = 25 });
            res.Add(new XYDTO() { XValue = "Refused", YValue = 25 });
            return res;
        }
        public List<XYDTO> GetKPICountByOrganization(WidgetwithAggOptionDTO dto)
        {
            var res = new List<XYDTO>();
            res.Add(new XYDTO() { XValue = "BP", YValue = 30 });
            res.Add(new XYDTO() { XValue = "Poste Pay", YValue = 20 });
            res.Add(new XYDTO() { XValue = "Quantis", YValue = 25 });
            res.Add(new XYDTO() { XValue = "Poste Service", YValue = 22 });
            return res;
        }
        public XYDTO GetKPICountSummary(BaseWidgetDTO dto)
        {
            return new  XYDTO() { XValue = "", YValue = 30 };

        }
        public List<XYDTO> GetNotificationTrend(WidgetwithAggOptionDTO dto)
        {
            var res = new List<XYDTO>();
            res.Add(new XYDTO() { XValue = "04/2019", YValue = 26 });
            res.Add(new XYDTO() { XValue = "05/2019", YValue = 20 });
            res.Add(new XYDTO() { XValue = "06/2019", YValue = 25 });
            res.Add(new XYDTO() { XValue = "07/2019", YValue = 22 });
            return res;
        }
        public List<XYDTO> GetKPIReportTrend(BaseWidgetDTO dto)
        {
            var res = new List<XYDTO>();
            res.Add(new XYDTO() { XValue = "04/2019", YValue = 26 });
            res.Add(new XYDTO() { XValue = "05/2019", YValue = 20 });
            res.Add(new XYDTO() { XValue = "06/2019", YValue = 25 });
            res.Add(new XYDTO() { XValue = "07/2019", YValue = 22 });
            return res;
        }
    }
}

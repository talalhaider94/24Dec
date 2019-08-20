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
        public WidgetService(WorkFlowPostgreSqlContext dbcontext){
            _dbcontext = dbcontext;
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
    }
}

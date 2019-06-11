using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Services.DTOs.API;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Quantis.WorkFlow.APIBase.Mappers
{
    public class CatalogKpiMapper : MappingService<CatalogKpiDTO, T_CatalogKPI>
    {
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        public CatalogKpiMapper(WorkFlowPostgreSqlContext dbcontext)
        {
            _dbcontext = dbcontext;
        }
        public override CatalogKpiDTO GetDTO(T_CatalogKPI e)
        {
            return new CatalogKpiDTO()
            {
                id = e.id,
                short_name = e.short_name,
                group_type = e.group_type,
                id_kpi = e.id_kpi,
                id_alm = e.id_alm,
                id_form = e.id_form,
                kpi_description = e.kpi_description,
                kpi_computing_description = e.kpi_computing_description,
                source_type = e.source_type,
                computing_variable = e.computing_variable,
                computing_mode = e.computing_mode,
                tracking_period = e.tracking_period,
                measure_unit = e.measure_unit,
                kpi_type = e.kpi_type,
                escalation = e.escalation,
                target = e.target,
                penalty_value = e.penalty_value,
                source_name = e.source_name,
                organization_unit = e.organization_unit,
                id_booklet = e.id_booklet,
                file_name = e.file_name,
                file_path = e.file_path,
                referent = e.referent,
                referent_1 = e.referent_1,
                referent_2 = e.referent_2,
                referent_3 = e.referent_3,
                referent_4 = e.referent_4,
                frequency = e.frequency,
                month = e.month,
                day = e.day,
                daytrigger = e.daytrigger,
                monthtrigger = e.monthtrigger,
                enable = e.enable,
                enable_wf = e.enable_wf,
                enable_rm = e.enable_rm,
                contract = e.contract,
                wf_last_sent = e.wf_last_sent,
                rm_last_sent = e.rm_last_sent,
                supply = e.supply,
                primary_contract_party=e.primary_contract_party,
                secondary_contract_party=e.secondary_contract_party
            };
        }

        public override T_CatalogKPI GetEntity(CatalogKpiDTO o, T_CatalogKPI e)
        {
            e.short_name = o.short_name;
            e.group_type = o.group_type;
            e.id_kpi = o.id_kpi;
            e.id_alm = o.id_alm;
            e.id_form = o.id_form;
            e.kpi_description = o.kpi_description;
            e.kpi_computing_description = o.kpi_computing_description;
            e.source_type = o.source_type;
            e.computing_variable = o.computing_variable;
            e.computing_mode = o.computing_mode;
            e.tracking_period = o.tracking_period;
            e.measure_unit = o.measure_unit;
            e.kpi_type = o.kpi_type;
            e.escalation = o.escalation;
            e.target = o.target;
            e.penalty_value = o.penalty_value;
            e.source_name = o.source_name;
            e.organization_unit = o.organization_unit;
            e.id_booklet = o.id_booklet;
            e.file_name = o.file_name;
            e.file_path = o.file_path;
            e.referent = o.referent;
            e.referent_1 = o.referent_1;
            e.referent_2 = o.referent_2;
            e.referent_3 = o.referent_3;
            e.referent_4 = o.referent_4;
            e.frequency = o.frequency;
            e.month = o.month;
            e.day = o.day;
            e.daytrigger = o.daytrigger;
            e.monthtrigger = o.monthtrigger;
            e.enable = o.enable;
            e.enable_wf = o.enable_wf;
            e.enable_rm = o.enable_rm;
            e.contract = o.contract;
            e.wf_last_sent = o.wf_last_sent;
            e.rm_last_sent = o.rm_last_sent;
            e.supply = o.supply;
            e.primary_contract_party = o.primary_contract_party;
            e.secondary_contract_party = o.secondary_contract_party;
            if (e.id == 0)
            {
                var bsikpi = _dbcontext.ViewCatalogKPI.Single(p => p.global_rule_id_bsi == o.global_rule_id_bsi);
                if (bsikpi != null)
                {
                    e.kpi_name_bsi = bsikpi.kpi_name_bsi;
                    e.global_rule_id_bsi = bsikpi.global_rule_id_bsi;
                    e.sla_id_bsi = bsikpi.sla_id_bsi;
                }
            }
            return e;
        }
    }
}

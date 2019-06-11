using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Services.DTOs.API;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.Mappers
{
    public class CatalogKPILVMapper : MappingService<CatalogKPILVDTO, vw_CatalogKPI>
    {
        public override CatalogKPILVDTO GetDTO(vw_CatalogKPI e)
        {
            return new CatalogKPILVDTO()
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
                primary_contract_party = e.primary_contract_party,
                secondary_contract_party = e.secondary_contract_party,
                global_rule_id_bsi=e.global_rule_id_bsi,
                kpi_name_bsi=e.kpi_name_bsi,
                sla_id_bsi=e.sla_id_bsi,
                sla_version_id=e.sla_version_id
            };
        }

        public override vw_CatalogKPI GetEntity(CatalogKPILVDTO o, vw_CatalogKPI e)
        {

            return e;
        }
    }
}

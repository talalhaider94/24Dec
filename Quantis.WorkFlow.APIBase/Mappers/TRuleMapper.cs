using Quantis.WorkFlow.APIBase.Framework;
using Quantis.WorkFlow.Models;
using Quantis.WorkFlow.Services.DTOs.API;
using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.APIBase.Mappers
{
    public class truleMapper : MappingService<TRuleDTO, T_Rule>
    {
        public override TRuleDTO GetDTO(T_Rule e)
        {
            return new TRuleDTO()
            {
                rule_id = e.rule_id,
                status = e.status,
                prev_status = e.prev_status,
                formula_id = e.formula_id,
                rule_name = e.rule_name,
                rule_description = e.rule_description,
                sla_version_id = e.sla_version_id,
                application_id = e.application_id,
                compound_ts_id = e.compound_ts_id,
                domain_category_id = e.domain_category_id,
                service_level_target = e.service_level_target,
                rule_period_time_unit = e.rule_period_time_unit,
                rule_period_interval_length = e.rule_period_interval_length,
                is_effective = e.is_effective,
                is_clustered = e.is_clustered,
                is_all_items = e.is_all_items,
                cluster_id = e.cluster_id,
                locale_id = e.locale_id,
                global_rule_id = e.global_rule_id,
                hour_tu_calc_status = e.hour_tu_calc_status,
                day_tu_calc_status = e.day_tu_calc_status,
                week_tu_calc_status = e.week_tu_calc_status,
                month_tu_calc_status = e.month_tu_calc_status,
                quarter_tu_calc_status = e.quarter_tu_calc_status,
                year_tu_calc_status = e.year_tu_calc_status,
                psl_rule_id = e.psl_rule_id,
                rule_create_date = e.rule_create_date,
                rule_modify_date = e.rule_modify_date,
                objective_statement = e.objective_statement,
                is_os_compiled = e.is_os_compiled,
                is_param_compiled = e.is_param_compiled,
                objective_statement_text = e.objective_statement_text,
                parent_rule_id = e.parent_rule_id,
                metric_type_id = e.metric_type_id,
                main_indicator = e.main_indicator,
                is_shadow_id = e.is_shadow_id,
                unit_id = e.unit_id,
                section_id = e.section_id,
                is_target_dynamic = e.is_target_dynamic,
                unit_of_consumption_id = e.unit_of_consumption_id,
                is_forecaster = e.is_forecaster,
                is_registrations_compiled = e.is_registrations_compiled,
                is_cluster_recursive = e.is_cluster_recursive,
                is_use_all_nodes = e.is_use_all_nodes,
                is_mandatory = e.is_mandatory,
                measurability_status = e.measurability_status,
                is_dirty = e.is_dirty,
                is_parameters_dirty = e.is_parameters_dirty,
                in_catalog = e.in_catalog,
                global_rule_in_catalog=e.GlobalRule.in_catalog
            };
        }

        public override T_Rule GetEntity(TRuleDTO o, T_Rule e)
        {
            e.rule_id = o.rule_id;
            e.status = o.status;
            e.prev_status = o.prev_status;
            e.formula_id = o.formula_id;
            e.rule_name = o.rule_name;
            e.rule_description = o.rule_description;
            e.sla_version_id = o.sla_version_id;
            e.application_id = o.application_id;
            e.compound_ts_id = o.compound_ts_id;
            e.domain_category_id = o.domain_category_id;
            e.service_level_target = o.service_level_target;
            e.rule_period_time_unit = o.rule_period_time_unit;
            e.rule_period_interval_length = o.rule_period_interval_length;
            e.is_effective = o.is_effective;
            e.is_clustered = o.is_clustered;
            e.is_all_items = o.is_all_items;
            e.cluster_id = o.cluster_id;
            e.locale_id = o.locale_id;
            e.global_rule_id = o.global_rule_id;
            e.hour_tu_calc_status = o.hour_tu_calc_status;
            e.day_tu_calc_status = o.day_tu_calc_status;
            e.week_tu_calc_status = o.week_tu_calc_status;
            e.month_tu_calc_status = o.month_tu_calc_status;
            e.quarter_tu_calc_status = o.quarter_tu_calc_status;
            e.year_tu_calc_status = o.year_tu_calc_status;
            e.psl_rule_id = o.psl_rule_id;
            e.rule_create_date = o.rule_create_date;
            e.rule_modify_date = o.rule_modify_date;
            e.objective_statement = o.objective_statement; 
            e.is_os_compiled = o.is_os_compiled;
            e.is_param_compiled = o.is_param_compiled;
            e.objective_statement_text = o.objective_statement_text;
            e.parent_rule_id = o.parent_rule_id;
            e.metric_type_id = o.metric_type_id;
            e.main_indicator = o.main_indicator;
            e.is_shadow_id = o.is_shadow_id;
            e.unit_id = o.unit_id;
            e.section_id = o.section_id;
            e.is_target_dynamic = o.is_target_dynamic;
            e.unit_of_consumption_id = o.unit_of_consumption_id;
            e.is_forecaster = o.is_forecaster;
            e.is_registrations_compiled = o.is_registrations_compiled;
            e.is_cluster_recursive = o.is_cluster_recursive;
            e.is_use_all_nodes = o.is_use_all_nodes;
            e.is_mandatory = o.is_mandatory;
            e.measurability_status = o.measurability_status;
            e.is_dirty = o.is_dirty;
            e.is_parameters_dirty = o.is_parameters_dirty;
            e.in_catalog = o.in_catalog;
            return e;
        }
    }
}

using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;
using Quantis.WorkFlow.Services.API;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.Data;
using Quantis.WorkFlow.Services.DTOs.OracleAPI;
using System.Xml.Linq;
using Quantis.WorkFlow.APIBase.Framework;
using Microsoft.Extensions.Logging;
using Quantis.WorkFlow.Services.DTOs.API;
using System.Net.Http;
using Newtonsoft.Json;
using System.Text.RegularExpressions;

namespace Quantis.WorkFlow.APIBase.API
{
    
    public class OracleDataService:IOracleDataService
    {
        private static string _connectionstring=null;
        private readonly WorkFlowPostgreSqlContext _dbcontext;
        public OracleDataService(WorkFlowPostgreSqlContext context)
        {
            _dbcontext = context;
            if (_connectionstring == null)
            {
                _connectionstring = getConnectionString();
            }
        }
        public List<OracleBookletDTO> GetBooklets()
        {
            try
            {
                string query = @"select document_name, document_id from T_DOCUMENT_REPOSITORY where document_file_type='docx' and document_type_id='2' order by document_name desc";                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleDataReader reader = cmd.ExecuteReader();
                        List<OracleBookletDTO> res = new List<OracleBookletDTO>();
                        while (reader.Read())
                        {
                            res.Add(new OracleBookletDTO()
                            {
                                DocumentName = (string)reader[0],
                                DocumentId = (long)reader[1]
                            });
                        }
                        return res.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        public List<OracleCustomerDTO> GetCustomer(int id,string name)
        {
            try
            {
                string query = @"select c.customer_id,c.customer_name,s.sla_id,s.sla_name from t_customers c left join t_slas s on s.customer_id = c.customer_id left join t_sla_versions v on s.sla_id = v.sla_id where s.sla_status = 'EFFECTIVE' and v.status = 'EFFECTIVE'";
                if (!string.IsNullOrEmpty(name))
                {
                    query += " and LOWER(c.customer_name) LIKE LOWER('%' || :customer_name || '%')";
                }
                if (id != 0)
                {
                    query += " and c.customer_id = :customer_id";
                }

                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("customer_id", id);
                        OracleParameter param2 = new OracleParameter("customer_name", name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.GroupBy(o => new { customer_id = o[0], customer_name = o[1] }).Select(p => new OracleCustomerDTO()
                        {
                            customer_id = Decimal.ToInt32((Decimal)p.Key.customer_id),
                            customer_name = (string)p.Key.customer_name,
                            slas = p.Select(q => new CustomerSLA()
                            {
                                sla_id = Decimal.ToInt32((Decimal)q[2]),
                                sla_name = (string)q[3]
                            }).ToList()

                        });
                        return values.ToList();
                    }
                }
            }
            catch(Exception e)
            {
                throw e;
            }
            
        }

        //public List<PslDTO> GetPsl(string period, string sla_name, string rule_name, string tracking_period)
        public List<PslDTO> GetPsl(string period, int global_rule_id, string tracking_period)
        {
            try
            {
                var period_table = "t_psl_0_month";
                switch (tracking_period)
                {
                    case "MENSILE":
                        period_table = "t_psl_0_month";
                        break;
                    case "TRIMESTRALE":
                        period_table = "t_psl_0_quarter";
                        break;
                    case "QUADRIMESTRALE":
                        period_table = "t_psl_0_month";
                        break;
                    case "SEMESTRALE":
                        period_table = "t_psl_0_month";
                        break;
                    case "ANNUALE":
                        period_table = "t_psl_0_year";
                        break;
                }
                
                string query = @"select s.sla_id, r.rule_id, ROUND(p.provided, 2), ROUND(p.provided_c, 2), ROUND(p.provided_e, 2), ROUND(p.provided_ce, 2), time_stamp_utc, d.domain_category_relation, r.service_level_target from t_rules r left join t_sla_versions v on r.SLA_VERSION_ID = v.SLA_VERSION_ID left join t_global_rules gr on gr.global_rule_id = :global_rule_id left join t_slas s on v.sla_id = s.SLA_ID left join t_domain_categories d on r.domain_category_id = d.domain_category_id left join ";
                query += period_table;
                query += " p on p.rule_id = r.rule_id and r.is_effective = 'Y' and CONCAT(CONCAT(to_char(time_stamp_utc, 'MM'), '/'), to_char(time_stamp_utc, 'YY')) = :period where r.rule_name = gr.global_rule_name and p.time_stamp_utc is not null";
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("period", period);
                        OracleParameter param2 = new OracleParameter("global_rule_id", global_rule_id);
                        //OracleParameter param2 = new OracleParameter("sla_name", sla_name);
                        //OracleParameter param3 = new OracleParameter("rule_name", rule_name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        //cmd.Parameters.Add(param3);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.Select(o => new PslDTO()
                        {

                            sla_id = Decimal.ToInt32((Decimal)o[0]),
                            rule_id = Decimal.ToInt32((Decimal)o[1]),
                            provided = (o[2] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[2]),
                            provided_c = (o[3] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[3]),
                            provided_e = (o[4] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[4]),
                            provided_ce = (o[5] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[5]),
                            time_stamp_utc = (DateTime)o[6],
                            result = (o[7].ToString() == "NLT") ? 
                                ((((o[5] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[5])) < (Decimal)o[8]) ? "[Non Compliant]" : "[Compliant]")
                                :
                                ((((o[5] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[5])) < (Decimal)o[8]) ? "[Compliant]" : "[Non Compliant]"),
                            target = (o[8] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[8]),
                            relation = o[7].ToString()
                        });
                        return values.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        /*       public List<PslDTO> GetPslValue(int global_rule_id, string period)
               {
                   try
                   {
                       var period_table = "";
                       switch (tracking_period)
                       {
                           case "MENSILE":
                               period_table = "t_psl_0_month";
                               break;
                           case "TRIMESTRALE":
                               period_table = "t_psl_0_quarter";
                               break;
                           case "QUADRIMESTRALE":
                               period_table = "t_psl_0_month";
                               break;
                           case "SEMESTRALE":
                               period_table = "t_psl_0_month";
                               break;
                           case "ANNUALE":
                               period_table = "t_psl_0_year";
                               break;
                       }
                       //string query = @"select s.sla_name, r.rule_name, ROUND(p.provided_ce,2), time_stamp_utc from t_rules r left join t_sla_versions v on r.SLA_VERSION_ID = v.SLA_VERSION_ID left join t_slas s on v.sla_id = s.SLA_ID left join " + period_table +
                       // " p on p.rule_id = r.rule_id and r.is_effective = 'Y' and CONCAT(CONCAT(to_char(time_stamp_utc, 'MM'), '/'),to_char(time_stamp_utc, 'YY')) = :period where s.sla_name = :sla_name and r.rule_name = :rule_name and p.time_stamp_utc is not null";
                       string pre = @"select * from t_rules r where r.global_rule_id = :global_rule_id and";
                       string query = @"select s.sla_id, r.rule_id, ROUND(p.provided, 2), ROUND(p.provided_c, 2), ROUND(p.provided_e, 2), ROUND(p.provided_ce, 2), time_stamp_utc from t_rules r left join t_sla_versions v on r.SLA_VERSION_ID = v.SLA_VERSION_ID left join t_slas s on v.sla_id = s.SLA_ID left join ";
                       query += period_table;
                       query += " p on p.rule_id = r.rule_id and r.is_effective = 'Y' and CONCAT(CONCAT(to_char(time_stamp_utc, 'MM'), '/'), to_char(time_stamp_utc, 'YY')) = :period where s.sla_name = :sla_name and r.rule_name = :rule_name and p.time_stamp_utc is not null";
                       using (OracleConnection con = new OracleConnection(_connectionstring))
                       {
                           using (OracleCommand cmd = con.CreateCommand())
                           {
                               con.Open();
                               cmd.BindByName = true;
                               cmd.CommandText = query;
                               OracleParameter param1 = new OracleParameter("period", period);
                               OracleParameter param2 = new OracleParameter("sla_name", sla_name);
                               OracleParameter param3 = new OracleParameter("rule_name", rule_name);
                               cmd.Parameters.Add(param1);
                               cmd.Parameters.Add(param2);
                               cmd.Parameters.Add(param3);
                               OracleDataReader reader = cmd.ExecuteReader();
                               DataTable dt = new DataTable();
                               dt.Load(reader);
                               List<DataRow> list = dt.AsEnumerable().ToList();
                               var values = list.Select(o => new PslDTO()
                               {
                                   sla_id = (Decimal)o[0],
                                   rule_id = (Decimal)o[1],
                                   provided = (Decimal)o[2],
                                   provided_c = (Decimal)o[3],
                                   provided_e = (Decimal)o[4],
                                   provided_ce = (Decimal)o[5],
                                   time_stamp_utc = (DateTime)o[6],

                               });
                               return values.ToList();
                           }
                       }
                   }
                   catch (Exception e)
                   {
                       throw e;
                   }

               }*/
        public List<OracleFormDTO> GetForm(int id, int userid)
        {
            try
            {
                string query = "select f.form_id, f.form_name,f.form_description, f.reader_id,f.form_owner_id,f.create_date, f.modify_date,	ug.user_group_id,ug.user_group_name from t_forms f left join t_forms_permitted_users fpu on fpu.form_id = f.form_id left join t_user_groups ug on fpu.user_group_id = ug.user_group_id where 1 = 1 ";
                //string query = "select f.form_id, f.form_name,f.form_description, f.reader_id,f.form_owner_id,f.create_date, f.modify_date, r.reader_configuration,	ug.user_group_id,ug.user_group_name from t_forms f left join t_readers r on f.reader_id = r.reader_id left join t_forms_permitted_users fpu on fpu.form_id = f.form_id left join t_user_groups ug on fpu.user_group_id = ug.user_group_id where 1 = 1 ";
                bool getConfigurations = false;
                if (userid != 0)
                {
                    query += " and ug.user_group_id = :userid";
                }
                if (id != 0)
                {
                    //query = "select f.form_id, f.form_name,f.form_description, f.reader_id,f.form_owner_id,f.create_date, f.modify_date, r.reader_configuration,	ug.user_group_id,ug.user_group_name from t_forms f left join t_readers r on f.reader_id = r.reader_id left join t_forms_permitted_users fpu on fpu.form_id = f.form_id left join t_user_groups ug on fpu.user_group_id = ug.user_group_id where 1 = 1 ";
                    query = "select f.form_id, f.form_name,f.form_description, f.reader_id,f.form_owner_id,f.create_date, f.modify_date, r.reader_configuration from t_forms f left join t_readers r on f.reader_id = r.reader_id where 1 = 1 ";

                    query += " and f.form_id = :form_id";
                    getConfigurations = true;
                }
                var day_cutoffValue = _dbcontext.Configurations.FirstOrDefault(o => o.owner == "be_restserver" && o.key == "day_cutoff");
                //per comodità prendo il cutoff dalla t_configurations e non dalla t_catalog_kpi
                string todayDayValue = DateTime.Now.ToString("dd");
                int todayDay = Int32.Parse(todayDayValue);
                int day_cutoff = Int32.Parse(day_cutoffValue.value);
                bool cutoff_result;
                if (todayDay < day_cutoff) { cutoff_result = false; } else { cutoff_result = true; }

                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("form_id", id);
                        OracleParameter param2 = new OracleParameter("userid", userid);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();

                        if (getConfigurations)
                        {
                            var result = list.Select(o => new OracleFormDTO()
                            {
                                form_id = Decimal.ToInt32((Decimal)o[0]),
                                form_name = (string)o[1],
                                form_description = (o[2] == DBNull.Value) ? string.Empty : (string)o[2],
                                reader_id = Decimal.ToInt32((Decimal)o[3]),
                                form_owner_id = Decimal.ToInt32((Decimal)o[4]),
                                create_date = (DateTime)o[5],
                                modify_date = (DateTime)o[6],
                                reader_configuration = GetFormAdapterConfiguration((string)o[7]),
                                user_group_id = 0,//(o[8] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[8]),
                                user_group_name = string.Empty, //(o[9] == DBNull.Value) ? string.Empty : (string)o[9],
                                day_cutoff = day_cutoff,
                                cutoff = (bool)cutoff_result,
                                latest_input_date = _dbcontext.FormLogs.Any(p => p.id_form == id) ? _dbcontext.FormLogs.Where(q => q.id_form == id).Max(r => r.time_stamp) : new DateTime(0)
                            });
                            return result.ToList();
                        }
                        else
                        {
                            var result = list.Select(o => new OracleFormDTO()
                            {
                                form_id = Decimal.ToInt32((Decimal)o[0]),
                                form_name = (string)o[1],
                                form_description = (o[2] == DBNull.Value) ? string.Empty : (string)o[2],
                                reader_id = Decimal.ToInt32((Decimal)o[3]),
                                form_owner_id = Decimal.ToInt32((Decimal)o[4]),
                                create_date = (DateTime)o[5],
                                modify_date = (DateTime)o[6],
                                reader_configuration = null,
                                user_group_id = (o[7] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)o[7]),
                                user_group_name = (o[8] == DBNull.Value) ? string.Empty : (string)o[8],
                                day_cutoff = day_cutoff,
                                cutoff = (bool)cutoff_result,
                                latest_input_date = _dbcontext.FormLogs.Any(p => p.id_form == id) ? _dbcontext.FormLogs.Where(q => q.id_form == id).Max(r => r.time_stamp) : new DateTime(0)
                            });
                            return result.ToList();
                        }


                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        private ReaderConfiguration GetFormAdapterConfiguration(string xml)
        {
            XDocument xdoc = XDocument.Parse(xml);
            var lists = from uoslist in xdoc.Element("AdapterConfiguration").Element("InputFormatCollection").Element("InputFormat").Element("InputFormatFields").Elements("InputFormatField") select uoslist;
            var formfields = new List<FormField>();
            foreach (var l in lists)
            {
                formfields.Add(new FormField()
                {
                    name = l.Attribute("Name").Value,
                    type = l.Attribute("Type").Value,
                    source = l.Attribute("Source").Value
                });

            }
            return new ReaderConfiguration() { inputformatfield = formfields };
        }

        public List<OracleGroupDTO> GetGroup(int id,string name)
        {
            try
            {
                string query = @"select ug.user_group_id,ug.user_group_name,u.user_id, u.user_name,u.user_email from t_user_groups ug left join t_user_group_members ugm on ug.user_group_id = ugm.user_group_id left join t_users u on ugm.user_id = u.user_id where 1=1";
                if (!string.IsNullOrEmpty(name))
                {
                    query += "and LOWER(ug.user_group_name) LIKE LOWER('%' || :user_group_name || '%')";
                }
                if (id != 0)
                {
                    query += "and ug.user_group_id = :user_group_id";
                }
                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("user_group_id", id);
                        OracleParameter param2 = new OracleParameter("user_group_name", name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.GroupBy(o => new { group_id = o[0], group_name = o[1] }).Select(p => new OracleGroupDTO()
                        {
                            user_group_id = Decimal.ToInt32((Decimal)p.Key.group_id),
                            user_group_name = (string)p.Key.group_name,
                            users = p.Select(q => new OracleGroupUserDTO()
                            {
                                user_id = Decimal.ToInt32((Decimal)q[2]),
                                user_name = (string)q[3],
                                user_email = (q[4] == DBNull.Value) ? string.Empty : (string)q[4]

                            }).ToList()

                        });
                        return values.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
            
        }

        public List<OracleSlaDTO> GetSla(int id, string name)
        {
            try
            {
                string query = @"select f.sla_id, f.sla_name, r.sla_version_id, MAX (f.sla_versions) as last_version, f.sla_status, f.sla_valid_from, f.sla_valid_to, s.customer_id, s.customer_name from t_slas f left join t_customers s on f.customer_id = s.customer_id left join t_sla_versions r on f.sla_id = r.sla_id where f.sla_status = 'EFFECTIVE' AND r.status ='EFFECTIVE'";
                if (!string.IsNullOrEmpty(name))
                {
                    query += " and LOWER(r.sla_name) LIKE LOWER('%' || :sla_name || '%')";
                }
                if (id != 0)
                {
                    query += " and f.sla_id = :sla_id";
                }
                query += " group by f.sla_name,f.sla_id, f.sla_status, f.sla_valid_from, f.sla_valid_to, s.customer_name, s.customer_id, r.sla_version_id order by f.sla_id ASC";
                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("sla_id", id);
                        OracleParameter param2 = new OracleParameter("sla_name", name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.Select(o => new OracleSlaDTO()
                        {
                            sla_id = Decimal.ToInt32((Decimal)o[0]),
                            sla_name = (String)o[1],
                            sla_version_id = Decimal.ToInt32((Decimal)o[2]),
                            last_version = Decimal.ToInt32((Decimal)o[3]),
                            sla_status = (String)o[4],
                            sla_valid_from = (DateTime)o[5],
                            sla_valid_to = (DateTime)o[6],
                            customer_id = Decimal.ToInt32((Decimal)o[7]),
                            customer_name = (String)o[8],

                        });
                        return values.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public List<OracleRuleDTO> GetRule(int id, string name)
        {
            try
            {
                string query = @"select r.rule_id,
                                r.rule_name,
                                r.global_rule_id,
                                m.sla_id,
                                m.sla_name,
                                r.service_level_target,
                                trf.yellow_thr as ESCALATION,
                                h.DOMAIN_CATEGORY_RELATION AS RELATION,
                                r.RULE_PERIOD_TIME_UNIT,
                                r.RULE_PERIOD_INTERVAL_LENGTH,
                                h.DOMAIN_CATEGORY_ID,
                                h.DOMAIN_CATEGORY_NAME,
                                r.HOUR_TU_CALC_STATUS,
                                r.DAY_TU_CALC_STATUS,
                                r.WEEK_TU_CALC_STATUS,
                                r.MONTH_TU_CALC_STATUS,
                                r.QUARTER_TU_CALC_STATUS,
                                r.YEAR_TU_CALC_STATUS
                                from t_rules r left join t_sla_versions s on r.sla_version_id = s.sla_version_id
                                left join t_slas m on m.sla_id = s.sla_id
                                left join T_DOMAIN_CATEGORIES h on r.DOMAIN_CATEGORY_ID = h.DOMAIN_CATEGORY_ID
                                left join t_report_threshold_rules_flat trf on r.global_rule_id = trf.global_rule_id
                                where s.status ='EFFECTIVE' AND m.sla_status ='EFFECTIVE'
                                ";
                if (!string.IsNullOrEmpty(name))
                {
                    query += "and LOWER(r.rule_name) LIKE LOWER('%' || :rule_name || '%')";
                }
                if (id != 0)
                {
                    query += "and r.rule_id = :rule_id";
                }
                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("rule_id", id);
                        OracleParameter param2 = new OracleParameter("rule_name", name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.Select(p => new OracleRuleDTO()
                        {
                            rule_id = Decimal.ToInt32((Decimal)p[0]),
                            rule_name = (string)p[1],
                            global_rule_id = Decimal.ToInt32((Decimal)p[2]),
                            sla_id = Decimal.ToInt32((Decimal)p[3]),
                            sla_name = (string)p[4],
                            service_level_target = (p[5] == DBNull.Value) ? (int?)null : Decimal.ToInt32((Decimal)p[5]),
                            escalation = (p[6] == DBNull.Value) ? (int?)null : Decimal.ToInt32((Decimal)p[6]),
                            relation = (string)p[7],
                            rule_period_time_unit = (string)p[8],
                            rule_period_interval_length = (p[9] == DBNull.Value) ? (int?)null : (int)(long)p[9],
                            domain_category_id = (p[10] == DBNull.Value) ? 0 : Decimal.ToInt32((Decimal)p[10]),
                            domain_category_name = (string)p[11],
                            granularity = new OracleRuleGranularityDTO()
                            {
                                hour_tu_calc_status = (string)p[12],
                                day_tu_calc_status = (string)p[13],
                                week_tu_calc_status = (p[14] == DBNull.Value) ? string.Empty : (string)p[14],
                                month_tu_calc_status = (string)p[15],
                                quarter_tu_calc_status = (string)p[16],
                                year_tu_calc_status = (string)p[17]

                            }

                        });
                        return values.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public List<OracleUserDTO> GetUser(int id, string name)
        {
            try
            {
                string query = @"select
                                user_id,
                                user_name,
                                user_email,
                                user_group_id,
                                user_group_name
                                from t_users
                                left join t_user_group_members using (user_id)
                                left join t_user_groups using (user_group_id)
                                where 1=1
                                ";
                if (!string.IsNullOrEmpty(name))
                {
                    query += " and LOWER(user_name) LIKE LOWER('%' || :user_name || '%')";
                }
                if (id != 0)
                {
                    query += " and user_id = :user_id";
                }
                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param1 = new OracleParameter("user_id", id);
                        OracleParameter param2 = new OracleParameter("user_name", name);
                        cmd.Parameters.Add(param1);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        DataTable dt = new DataTable();
                        dt.Load(reader);
                        List<DataRow> list = dt.AsEnumerable().ToList();
                        var values = list.GroupBy(o => new { user_id = o[0], user_name = o[1], user_email = o[2] }).Select(p => new OracleUserDTO()
                        {
                            user_id = Decimal.ToInt32((Decimal)p.Key.user_id),
                            user_name = (string)p.Key.user_name,
                            user_email = (p.Key.user_email == DBNull.Value) ? string.Empty : (string)p.Key.user_email,
                            groups = p.Select(q =>
                            (q[3] == DBNull.Value)? null :
                            new OracleUserGroupsDTO()
                            {
                                user_group_id = (q[3] == DBNull.Value) ? (int?)null : Decimal.ToInt32((Decimal)q[3]),
                                user_group_name = (q[4] == DBNull.Value) ? string.Empty : (string)q[4]
                            }).ToList()
                            
                    });
                        

                        return values.ToList();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }

        }

        public Tuple<int,int> GetUserIdLocaleIdByUserName(string username)
        {
            try
            {
                string query = @"SELECT USER_ID, USER_LOCALE_ID FROM T_Users Where USER_NAME = :user_name AND USER_STATUS = 'ACTIVE'";
                
                using (OracleConnection con = new OracleConnection(_connectionstring))
                {
                    using (OracleCommand cmd = con.CreateCommand())
                    {
                        con.Open();
                        cmd.BindByName = true;
                        cmd.CommandText = query;
                        OracleParameter param2 = new OracleParameter("user_name", username);
                        cmd.Parameters.Add(param2);
                        OracleDataReader reader = cmd.ExecuteReader();
                        Tuple<int, int> res=new Tuple<int, int>(0,0);
                        if (reader.Read())
                        {
                            res= new Tuple<int, int>(Decimal.ToInt32((Decimal)reader["USER_ID"]), Decimal.ToInt32((Decimal)reader["USER_LOCALE_ID"]));
                        }
                        return res;
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        private string getConnectionString()
        {
            try
            {
                Dictionary<string, string> config = null;
                var bsiconf = _dbcontext.Configurations.FirstOrDefault(o => o.owner == "be_bsi" && o.key == "bsi_api_url");
                var oracleconf = _dbcontext.Configurations.FirstOrDefault(o => o.owner == "be_oracle" && o.key == "con_str");
                if (bsiconf == null || oracleconf == null)
                {
                    var e = new Exception("Configuration of BSI or Oracle does not exist");
                    throw e;
                }
                using (var client = new HttpClient())
                {
                    string basePath = bsiconf.value;
                    string apiPath = "/api/OracleCon/GetOracleConnection";
                    var output = QuantisUtilities.FixHttpURLForCall(basePath, apiPath);
                    client.BaseAddress = new Uri(output.Item1);
                    var response = client.GetAsync(output.Item2).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        
                        config = JsonConvert.DeserializeObject<Dictionary<string, string>>(response.Content.ReadAsStringAsync().Result);
                    }
                    else
                    {
                        var e = new Exception(string.Format("Connection to retrieve Orcle credentials cannot be created: basePath: {0} apipath: {1}",basePath,apiPath));
                        throw e;
                    }

                }
                string finalconfig = string.Format(oracleconf.value, config["datasource"], config["username"], config["password"]);
                return finalconfig;
            }
            catch(Exception e)
            {
                throw e;
            }
            
            

        }
    }
}

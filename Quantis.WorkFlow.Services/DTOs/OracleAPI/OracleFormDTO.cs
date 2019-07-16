using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.OracleAPI
{
    public class OracleFormDTO
    {
        public int form_id { get; set; }
        public string form_name { get; set; }
        public string form_description { get; set; }
        public int reader_id { get; set; }
        public int form_owner_id { get; set; }
        public DateTime create_date { get; set; }
        public DateTime modify_date { get; set; }
        public ReaderConfiguration reader_configuration { get; set; }
        public int user_group_id { get; set; }
        public string user_group_name { get; set; }
        public int day_cutoff { get; set; }
        public bool cutoff { get; set; }
        public DateTime latest_input_date { get; set; }
    }
    public class ReaderConfiguration
    {
        public List<FormField> inputformatfield { get; set; }
    }
    public class FormField
    {
        public string name { get; set; }
        public string type { get; set; }
        public string source { get; set; }
        public string label { get; set; }
        public string mandatory { get; set; }
        public string defaultValue { get; set; }
    }
}

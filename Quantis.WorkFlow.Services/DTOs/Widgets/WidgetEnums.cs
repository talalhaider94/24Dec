using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.Widgets
{
    //Always add new enum at the end never in the middle
    public enum Measures :int
    {
        [Description("Number of ticket in KPI in Verifica")]
        Number_of_ticket_in_KPI_in_Verifica,
        [Description("Number of ticket of KPI Compliant")]
        Number_of_ticket_of_KPI_Compliant,
        [Description("Number of ticket of KPI Non Compliant")]
        Number_of_ticket_of_KPI_Non_Compliant,
        [Description("Number of ticket of KPI Non Calcolato")]
        Number_of_ticket_of_KPI_Non_Calcolato,
        [Description("Number of ticket refused")]
        Number_of_ticket_refused,
        [Description("Number of contract party assigned to the user")]
        Number_of_contract_party_assigned_to_the_user,
        [Description("Number of contracts assigned to the user")]
        Number_of_contracts_assigned_to_the_user,
        [Description("Number of kpis assigned to the user")]
        Number_of_kpis_assigned_to_the_user,
        [Description("Number of Total KPI not compliant")]
        Number_of_Total_KPI_not_compliant,
        [Description("Number of Total KPI compliant")]
        Number_of_Total_KPI_compliant,
        [Description("Number of Total KPI in escalation")]
        Number_of_Total_KPI_in_escalation,
        [Description("Number of reminder received")]
        Number_of_reminder_received,
        [Description("Number of escalation type 1 received")]
        Number_of_escalation_type_1_received,
        [Description("Number of escalation type 2 received")]
        Number_of_escalation_type_2_received,

    }
    public static class ChartType
    {
        public static KeyValuePair<string,string> LINE = new KeyValuePair<string, string>("line","Line");
        public static KeyValuePair<string, string> BAR = new KeyValuePair<string, string>("bar", "Bar");
        public static KeyValuePair<string, string> TABLE = new KeyValuePair<string, string>("table", "Table");
    }
    public static class AggregationOption
    {
        public static KeyValuePair<string, string> PERIOD = new KeyValuePair<string, string>("period", "Period");
        public static KeyValuePair<string, string> ANNAUL = new KeyValuePair<string, string>("annual", "Annual");

        public static KeyValuePair<string, string> KPI = new KeyValuePair<string, string>("kpi", "KPI");
        public static KeyValuePair<string, string> CONTRACT = new KeyValuePair<string, string>("contract", "Contract");
        public static KeyValuePair<string, string> CONTRACTPARTY = new KeyValuePair<string, string>("contractparty", "Contract Party");
    }
}

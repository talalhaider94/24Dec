using System;
using System.Collections.Generic;
using System.Text;

namespace Quantis.WorkFlow.Services.DTOs.API
{
    public class FormConfigurationDTO
    {
        public string a_id { get; set; }
        public string a_name { get; set; }
        public string a_top { get; set; }
        public string a_left { get; set; }
        public string a_width { get; set; }
        public string a_height { get; set; }
        public string a_type { get; set; }
        public string a_fontColor { get; set; }
        public string a_fontFamily { get; set; }
        public string a_fontWeight { get; set; }
        public string a_fontItalic { get; set; }
        public string a_textDecoration { get; set; }
        public string a_fontSize { get; set; }
        public string a_backgrounColor { get; set; }
        public string a_isDefaultFontColor { get; set; }
        public string a_isDefaultBGColor { get; set; }
        public string a_dataType { get; set; }
        
        //if (a_type == "DLFLabel")
        //{
        public string a_text { get; set; }
        public string a_isMandatoryLabel { get; set; }
        //}
        //if (a_type == "DLFTextBox")
        //{
        public string a_controllerDataType { get; set; }
        public string a_defaultValue { get; set; }
        public string a_maxLength { get; set; }
        public string a_isMandatory { get; set; }
        public string a_labelId { get; set; }
        //}
        //if (a_type == "DLFDatePicker")
        //{
        // public string a_defaultValue { get; set; }
        // public string a_showLegend { get; set; }
        // public string a_isMandatory { get; set; }
        // public string a_labelId { get; set; }
        //}
        //if (a_type == "DLFCheckBox")
        //{
        // public string a_text { get; set; }
        // public string a_controllerDataType { get; set; }
        public string a_checkedStatus { get; set; }
        public string a_checkedValue { get; set; }
        public string a_unCheckedValue { get; set; }
        //}
        
        public string name { get; set; }
        public string text { get; set; }
    }
}

export class WidgetsHelper {
    // filters and properties are coming from saved widget state
    static initWidgetParameters(apiParams, filters, properties) {
        // making it {} gives error temp giving it any type
        try {
            let buildParams: any = {};
            // dirty way 
            buildParams.Properties = {};
            buildParams.Filters = {};

            buildParams.GlobalFilterId = 0;
            buildParams.Note = '';
            // PROPERTIES
            if(apiParams.showmeasure) {
                let index = (!!properties.measure) ? properties.measure : 0;
                let value = Object.keys(apiParams.measures)[index];
                buildParams.Properties.measure = value;
            }
            if(apiParams.showcharttype) {
                let index = (!!properties.charttype) ? properties.charttype : Object.keys(apiParams.charttypes)[0];
                buildParams.Properties.charttype = index;
            }
            if(apiParams.showaggregationoption) {
                let index = (!!properties.aggregationoption) ? properties.aggregationoption : Object.keys(apiParams.aggregationoptions)[0];
                buildParams.Properties.aggregationoption = index;
            }
            // FILTERS
            if(apiParams.showdatetype) {
                let dateType = (!!filters.showdatetype) ? filters.dateTypes : 'Custom';
                buildParams.Filters.dateTypes = dateType;
            }
            if(apiParams.showdaterangefilter) {
                // dateTypes custom condition may be needed
                let dateRangeValue = (!!filters.daterange) ? filters.daterange : apiParams.defaultdaterange;
                buildParams.Filters.daterange = dateRangeValue;
            }
            return buildParams;
        } catch(error) {
            console.log('initWidgetParameters', error);
            debugger;
        }
    }
}
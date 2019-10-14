import { Injectable } from '@angular/core';
import { DateTimeService } from './date-time.service';

@Injectable({
  providedIn: 'root'
})
export class WidgetHelpersService {
  constructor(
    private dateTimeService: DateTimeService
  ) { }
  // filters and properties are coming from saved widget state
  initWidgetParameters(apiParams, filters, properties) {
    // making it {} gives error temp giving it any type
    try {
      let buildParams: any = {};
      // dirty way
      buildParams.Properties = {};
      buildParams.Filters = {};

      buildParams.GlobalFilterId = 0;
      // buildParams.Note = '';
      // PROPERTIES
      if (apiParams.showmeasure) {
        let index = (Object.keys(properties).length > 0 && !!properties.measure) ? properties.measure : Object.keys(apiParams.measures)[0];
        // let value = Object.keys(apiParams.measures)[index];
        buildParams.Properties.measure = index;
      }
      if (apiParams.showcharttype) {
        let index = (!!properties.charttype) ? properties.charttype : Object.keys(apiParams.charttypes)[0];
        buildParams.Properties.charttype = index;
      }
      if (apiParams.showaggregationoption) {
        let index = (!!properties.aggregationoption) ? properties.aggregationoption : Object.keys(apiParams.aggregationoptions)[0];
        buildParams.Properties.aggregationoption = index;
      }
      // FILTERS
      if (apiParams.showdatetype) {
        // need to change it base on key error might be in filters.dateTypes
        let dateType = (Object.keys(filters).length > 0 && !!filters.showdatetype) ? filters.dateTypes : '0';
        buildParams.Filters.dateTypes = dateType;
      }
      if (apiParams.showdatefilter) {
        let date;
        if (!!filters.date) {
          date = filters.date;
         } else {
          date = '01/2019';
        }
        buildParams.Filters.date = date;
      }
      if (apiParams.showdaterangefilter) {
        // dateTypes custom condition may be needed
        // if defaultdaterange is null need to write custom method for it.
        let dateRangeValue;
        if (!!filters.daterange) {
          dateRangeValue = filters.daterange;
        } else if (!!apiParams.defaultdaterange) {
          dateRangeValue = apiParams.defaultdaterange;
        } else {
          dateRangeValue = '01/2019-12/2019';
        }
        buildParams.Filters.daterange = dateRangeValue;
      }
      if(filters.kpi) {
        buildParams.Filters.kpi = filters.kpi;
      }
      if(!apiParams.showincompleteperiodcheck) {
        buildParams.Filters.incompletePeriod = Boolean(filters.incompletePeriod) || false;
      }
      return buildParams;
    } catch (error) {
      console.error('initWidgetParameters', error);
    }
  }

  setWidgetParameters(apiParams, filters, properties) {
    debugger
    // making it {} gives error temp giving it any type
    try {
      let buildParams: any = {};
      // dirty way
      buildParams.Properties = {};
      buildParams.Filters = {};

      buildParams.GlobalFilterId = 0;
      // buildParams.Note = '';
      // PROPERTIES
      if (apiParams.showmeasure) {
        let index = (Object.keys(properties).length > 0 && !!properties.measure) ? properties.measure : Object.keys(apiParams.measures)[0];
        buildParams.Properties.measure = index;
      }
      if (apiParams.showcharttype) {
        let index = (!!properties.charttype) ? properties.charttype : Object.keys(apiParams.charttypes)[0];
        buildParams.Properties.charttype = index;
      }
      if (apiParams.showaggregationoption) {
        let index = (!!properties.aggregationoption) ? properties.aggregationoption : Object.keys(apiParams.aggregationoptions)[0];
        buildParams.Properties.aggregationoption = index;
      }
      // FILTERS
      if (apiParams.showdatetype) {
        // need to change it base on key error might be in filters.dateTypes
        let dateType = (Object.keys(filters).length > 0 && !!filters.showdatetype) ? filters.dateTypes : '0';
        buildParams.Filters.dateTypes = dateType;
      }
      if (apiParams.showdatefilter) {
        let date;
        if (!!filters.date) {
          date = filters.date;
         } else {
          date = '01/2019';
        }
        buildParams.Filters.date = date;
      }
      if (apiParams.showdaterangefilter) {
        // dateTypes custom condition may be needed
        // if defaultdaterange is null need to write custom method for it.
        let dateRangeValue;
        if (!!filters.daterange) {
          dateRangeValue = this.dateTimeService.buildRangeDate(filters.daterange);
        } else if (!!apiParams.defaultdaterange) {
          dateRangeValue = this.dateTimeService.buildRangeDate(apiParams.defaultdaterange);
        } else {
          dateRangeValue = this.dateTimeService.buildRangeDate('01/2019-12/2019');
        }
        buildParams.Filters.startDate = dateRangeValue[0];
        buildParams.Filters.endDate = dateRangeValue[1];
      }
      if(apiParams.contractParties) {
        buildParams.Filters.contractParties = filters.contractParties || apiParams.contractParties[0].key
      }
      if(filters.kpi) {
        buildParams.Filters.kpi = filters.kpi;
      }
      if(apiParams.getReportQueryDetailByID) {
      }
      if(!apiParams.showincompleteperiodcheck) {
        buildParams.Filters.incompletePeriod = Boolean(filters.incompletePeriod) || false;
      }
      return buildParams;
    } catch (error) {
      console.error('setWidgetParameters', error);
    }
  }
}

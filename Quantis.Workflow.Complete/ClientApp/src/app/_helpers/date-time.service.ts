import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {
  public moment: any = moment;
  constructor() { }

  getDateTime() {
    return moment().format();
  }

  subtractMonth(no: number) {
    return moment().subtract(no, 'month').format();
  }

  getMonthYear() {
    let month = moment().subtract(1, 'months').format('MM');
    let year = moment().format('YY');
    return { month, year };
  }

  getApiPeriod(month, year) {
    let period;
    if (month === 'all' && year === 'all') {
      period = 'all/all';
    } else {
      period = `${month}/${year}`;
    }
    return period;
  }

  buildRangeDate(dateRange) {
    console.log('buildRangeDate', dateRange);
    let [startDate, endDate] = dateRange.split('-');
    let [startMonth, startYear] = startDate.split('/');
    let [endMonth, endYear] = endDate.split('/');
    let dateRangeArray = [new Date(`${startMonth}/01/${startYear}`), new Date(`${endMonth}/01/${endYear}`)];
    return dateRangeArray;
  }

  timePeriodRange(rangeType, includeCurrentMonth) {
    // includeCurrentMonth if true include current month in date range
    let startDate;
    let endDate;
    if(includeCurrentMonth) {
      startDate = moment().format('MM/YYYY');
    } else {
      startDate = moment().subtract(1, 'months').format('MM/YYYY');
    }
    if(rangeType === 'Last 2 Months') {
      endDate = moment().subtract(2, 'months').format('MM/YYYY');
    } else if(rangeType === 'Last 3 Months') {
      endDate = moment().subtract(3, 'months').format('MM/YYYY');
    } else if(rangeType === 'Last 6 Months') {
      endDate = moment().subtract(6, 'months').format('MM/YYYY');
    } else if(rangeType === 'Last Month') {
      endDate = moment().subtract(1, 'months').format('MM/YYYY');
    }
    return { startDate, endDate }
  }

  getStringDateRange(startDate, endDate) {
    let formatStartDate = moment(startDate).format('MM/YYYY');
    let formatEndDate = moment(endDate).format('MM/YYYY');
    let stringDateRange = `${formatStartDate}-${formatEndDate}`;
    return stringDateRange;
  }

}

import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }

  getMonthYear() {
    let month = moment().subtract(1, 'months').format('MM');
    let year = moment().format('YY');
    return { month, year };
  }

  getApiPeriod(month, year) {
    let period;
    if(month === 'all' && year === 'all') {
      period = 'all/all';
    } else {
      period = `${month}/${year}`;
    }
    return period;
  }
  
}

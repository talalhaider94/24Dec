import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import Headers from '../_helpers/headers';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  // getCatalogoUsers(){
  //   return this.http.get('https://api.myjson.com/bins/p7x9t').pipe(
  //     tap(
  //       data => data,
  //       error => error
  //     )
  //   );
  // }
  getCatalogoUsers(): Observable<any> {
    const getUtentiEndPoint = `http://10.10.10.102/api/data/GetAllUsers`;
    return this.http.get(getUtentiEndPoint, Headers.setHeaders('GET'));
  }

  // getCatalogoKpis(){
  //   return this.http.get('https://api.myjson.com/bins/1157o5')
  //     .pipe(
  //       tap(
  //         data => data,
  //         error => error
  //       )
  //     );
  // }

  getCatalogoKpis(): Observable<any> {
    const getKpiEndPoint = `http://10.10.10.102/api/data/GetAllKpis`;
    return this.http.get(getKpiEndPoint, Headers.setHeaders('GET'));
  }

  // getConfigurations() {
  //   return this.http.get('https://api.myjson.com/bins/13h29l')
  //     .pipe(
  //       tap(
  //         data => data,
  //         error => error
  //       )
  //     );
  // }

  getConfigurations(): Observable<any> {
    const getConfigurationsEndPoint = `http://10.10.10.102/api/Information/GetAllConfigurations`;
    return this.http.get(getConfigurationsEndPoint, Headers.setHeaders('GET'));
  }


  // getArchivedKpis() {
  //   return this.http.get('https://api.myjson.com/bins/lp589')
  //     .pipe(
  //       tap(
  //         data => data,
  //         error => error
  //       )
  //     );
  // }

  getArchivedKpis(): Observable<any> {
    const getArchivedKpisEndPoint = `http://10.10.10.102/api/data/getallarchivedkpis?month=05&year=2019`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setHeaders('GET'));
  }

  getAllArchivedKpis(id): Observable<any> {
    const getArchivedKpisEndPoint = `http://10.10.10.102/api/data/getallarchivedkpis?id_kpi=${id}`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setHeaders('GET'));
  }

  getDateKpis(month, year): Observable<any> {
    const getDateKpisEndPoint = `http://10.10.10.102/api/data/getallarchivedkpis?month=${month}&year=${year}`;
    return this.http.get(getDateKpisEndPoint, Headers.setHeaders('GET'));
  }

  updateConfig(config) {
    return this.http.post('http://10.10.10.102/api/information/AddUpdateConfiguration', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogUtenti(config) {
    return this.http.post('http://10.10.10.102/api/data/AddUpdateUser', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogKpi(config) {
    return this.http.post('http://10.10.10.102/api/data/AddUpdateKpi', config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }
}

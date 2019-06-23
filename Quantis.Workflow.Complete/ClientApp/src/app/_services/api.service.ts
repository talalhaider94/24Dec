import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import Headers from '../_helpers/headers';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getCatalogoUsers(): Observable<any> {
    const getUtentiEndPoint = `${environment.API_URL}/data/GetAllUsers`;
    return this.http.get(getUtentiEndPoint, Headers.setHeaders('GET'));
  }
  getTUsers(): Observable<any> {
    const getTUsersEndPoint = `${environment.API_URL}/data/GetAllTUsers`;
    return this.http.get(getTUsersEndPoint, Headers.setHeaders('GET'));
  }

  getKpiArchivedData(id,month,year): Observable<any>{
    const getDateKpiId = `${environment.API_URL}/data/GetRawDataByKpiID?id_kpi=${id}&month=${month}&year=${year}`;
    return this.http.get(getDateKpiId,Headers.setHeaders('GET'));
  }

  getCatalogoKpis(): Observable<any> {
    const getKpiEndPoint = `${environment.API_URL}/data/GetAllKpis`;
    return this.http.get(getKpiEndPoint, Headers.setHeaders('GET'));
  }

  getConfigurations(): Observable<any> {
    const getConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllConfigurations`;
    return this.http.get(getConfigurationsEndPoint, Headers.setHeaders('GET'));
  }

  getArchivedKpis(month, year): Observable<any> {
    const getArchivedKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?month=${month}&year=${year}`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setHeaders('GET'));
  }

  getArchivedKpiById(id): Observable<any> {
    const getArchivedKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?id_kpi=${id}`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setHeaders('GET'));
  }

  getDataKpis(month, year): Observable<any> {
    const getDataKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?month=${month}&year=${year}`;
    return this.http.get(getDataKpisEndPoint, Headers.setHeaders('GET'));
  }

  updateConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateConfiguration`, config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogUtenti(config) {
    return this.http.post(`${environment.API_URL}/data/AddUpdateUser`, config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogKpi(config) {
    return this.http.post(`${environment.API_URL}/data/AddUpdateKpi`, config, Headers.setHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }
}

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
    return this.http.get(getUtentiEndPoint, Headers.setTokenHeaders('GET'));
  }
  getTUsers(): Observable<any> {
    const getTUsersEndPoint = `${environment.API_URL}/data/GetAllTUsers`;
    return this.http.get(getTUsersEndPoint, Headers.setTokenHeaders('GET'));
  }

  getKpiArchivedData(id,month,year): Observable<any>{ 
    const getDateKpiId = `${environment.API_URL}/data/GetRawDataByKpiID?id_kpi=${id}&month=${month}&year=${year}`;
    return this.http.get(getDateKpiId,Headers.setTokenHeaders('GET'));
  }

  getCatalogoKpis(): Observable<any> {
    const getKpiEndPoint = `${environment.API_URL}/data/GetAllKpis`;
    return this.http.get(getKpiEndPoint, Headers.setTokenHeaders('GET'));
  }

  getConfigurations(): Observable<any> {
    const getConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllConfigurations`;
    return this.http.get(getConfigurationsEndPoint, Headers.setTokenHeaders('GET'));
  }

  getSDMGroupConfigurations(): Observable<any> {
    const getSDMGroupConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllSDMGroupConfigurations`;
    return this.http.get(getSDMGroupConfigurationsEndPoint, Headers.setTokenHeaders('GET'));
  }
  
  getSDMStatusConfigurations(): Observable<any> {
    const getSDMStatusConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllSDMStatusConfigurations`;
    return this.http.get(getSDMStatusConfigurationsEndPoint, Headers.setTokenHeaders('GET'));
  }

  getArchivedKpis(month, year): Observable<any> {
    const getArchivedKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?month=${month}&year=${year}`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setTokenHeaders('GET'));
  }

  getArchivedKpiById(id): Observable<any> {
    const getArchivedKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?id_kpi=${id}`;
    return this.http.get(getArchivedKpisEndPoint, Headers.setTokenHeaders('GET'));
  }
  
  deleteSDMGroupConfiguration(id): Observable<any> {
    const deleteSDMGroupConfiguration = `${environment.API_URL}/information/DeleteSDMGroupConfiguration/${id}`;
    return this.http.get(deleteSDMGroupConfiguration, Headers.setTokenHeaders('POST'));
  }
    
  deleteSDMStatusConfiguration(id): Observable<any> {
    const deleteSDMStatusConfiguration = `${environment.API_URL}/information/DeleteSDMStatusConfiguration/${id}`;
    return this.http.get(deleteSDMStatusConfiguration, Headers.setTokenHeaders('POST'));
  }

  getDataKpis(month, year): Observable<any> {
    const getDataKpisEndPoint = `${environment.API_URL}/data/getallarchivedkpis?month=${month}&year=${year}`;
    return this.http.get(getDataKpisEndPoint, Headers.setTokenHeaders('GET'));
  }

  updateConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateConfiguration`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateSDMGroupConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateSDMGroupConfiguration`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }
  
  updateSDMStatusConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateSDMStatusConfiguration`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogUtenti(config) {
    return this.http.post(`${environment.API_URL}/data/AddUpdateUser`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateCatalogKpi(config) {
    return this.http.post(`${environment.API_URL}/data/AddUpdateKpi`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }
}

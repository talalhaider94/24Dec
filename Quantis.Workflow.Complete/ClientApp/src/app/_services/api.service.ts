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
    const getConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllBasicConfigurations`;
    return this.http.get(getConfigurationsEndPoint, Headers.setTokenHeaders('GET'));
  }

  getAdvancedConfigurations(): Observable<any> {
    const getAdvancedConfigurationsEndPoint = `${environment.API_URL}/Information/GetAllAdvancedConfigurations`;
    return this.http.get(getAdvancedConfigurationsEndPoint, Headers.setTokenHeaders('GET'));
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

  getUsersByRole(roleId): Observable<any> {
    const getUsersByRole = `${environment.API_URL}/data/GetUsersByRoleId?roleId=${roleId}`;
    return this.http.get(getUsersByRole, Headers.setTokenHeaders('GET'));
  }

  getCustomersKP(): Observable<any> {
    const getCustomersKP = `${environment.API_URL}/data/GetAllCustomersKP`;
    return this.http.get(getCustomersKP, Headers.setTokenHeaders('GET'));
  }

  getAllRoles(): Observable<any> {
    const getAllRolesEndPoint = `${environment.API_URL}/information/GetAllRoles`;
    return this.http.get(getAllRolesEndPoint, Headers.setTokenHeaders('GET'));
  }
  getRolesByUserId(userid): Observable<any> {
    const getRolesByUserIdEndPoint = `${environment.API_URL}/information/GetRolesByUserId/?userid=${userid}`;
    return this.http.get(getRolesByUserIdEndPoint, Headers.setTokenHeaders('GET'));
  }

  addRole(data): Observable<any> {
    const addrole = `${environment.API_URL}/information/AddUpdateRole`;
    return this.http.post(addrole,data, Headers.setTokenHeaders('POST'));
  }

  addSDMGroup(data): Observable<any> {
    const addSDMGroup = `${environment.API_URL}/information/AddUpdateSDMGroupConfiguration`;
    return this.http.post(addSDMGroup,data, Headers.setTokenHeaders('POST'));
  }
  
  addSDMStatus(data): Observable<any> {
    const addSDMStatus = `${environment.API_URL}/information/AddUpdateSDMStatusConfiguration`;
    return this.http.post(addSDMStatus,data, Headers.setTokenHeaders('POST'));
  }
  
  addConfig(data): Observable<any> {
    const addConfig = `${environment.API_URL}/information/AddUpdateBasicConfiguration`;
    return this.http.post(addConfig,data, Headers.setTokenHeaders('POST'));
  }
   
  addAdvancedConfig(data): Observable<any> {
    const addConfig = `${environment.API_URL}/information/AddUpdateAdvancedConfiguration`;
    return this.http.post(addConfig,data, Headers.setTokenHeaders('POST'));
  }
  
  deleteRole(roleId): Observable<any> {
    const deleteroles = `${environment.API_URL}/information/DeleteRole/${roleId}`;
    return this.http.get(deleteroles, Headers.setTokenHeaders('POST'));
  }

  getAllPermisisons(): Observable<any> {
    const getAllPermisisonsEndPoint = `${environment.API_URL}/information/GetAllPermissions`;
    return this.http.get(getAllPermisisonsEndPoint, Headers.setTokenHeaders('GET'));
  }
  getPermissionsByRoldId(roleId): Observable<any> {
    const getPermissionsByRoldIdEndPoint = `${environment.API_URL}/information/GetPermissionsByRoleID/?roleId=${roleId}`;
    return this.http.get(getPermissionsByRoldIdEndPoint, Headers.setTokenHeaders('GET'));
  }


  updateConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateBasicConfiguration`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateAdvancedConfig(config) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateAdvancedConfiguration`, config, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  updateRole(data) {
    return this.http.post(`${environment.API_URL}/information/AddUpdateRole`, data, Headers.setTokenHeaders('POST'))
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

  assignRolesToUser(postData) {
    return this.http.post(`${environment.API_URL}/information/AssignRolesToUser`, postData, Headers.setTokenHeaders('POST'))
      .pipe(
        tap(
          data => data,
          error => error
        )
      );
  }

  assignPermissionsToRoles(postData) {
    return this.http.post(`${environment.API_URL}/information/AssignPermissionsToRoles`, postData, Headers.setTokenHeaders('POST'))
    .pipe(
      tap(
        data => data,
        error => error
      )
    );
  }


}

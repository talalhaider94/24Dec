import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class FreeFormReportService {

  constructor(
    private http: HttpClient
  ) { }

  getOwnedReportQueries() {
    return this.http.get(`${environment.API_URL}/data/GetOwnedReportQueries`);
  }

  getAssignedReportQueries () {
    return this.http.get(`${environment.API_URL}/data/GetAssignedReportQueries`);
  }

  addEditReportQuery(params) {
    debugger
    return this.http.post(`${environment.API_URL}/data/AddEditReportQuery`, params);
  }

  getReportQueryDetailByID(id: number = 1) {
    const params = new HttpParams().set('id', id.toString());
		return this.http.get<any>(`${environment.API_URL}/data/GetReportQueryDetailByID`, { params }); 
  }
  
  deleteReportQuery(id: number = 1) {
    const params = new HttpParams().set('id', id.toString());
		return this.http.get<any>(`${environment.API_URL}/data/DeleteReportQuery`, { params }); 
  }
  
}

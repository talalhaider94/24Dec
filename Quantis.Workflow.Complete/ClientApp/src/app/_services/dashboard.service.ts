import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WidgetModel, DashboardModel } from '../_models';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  constructor(private http: HttpClient) { }
  	// Return Array of WidgetModel
	getWidgets(): Observable<Array<WidgetModel>> {
    // return this.http.get<Array<WidgetModel>>(`http://localhost:5000/api/dashboard/GetAllWidgets`);
    return this.http.get<Array<WidgetModel>>(`http://localhost:3000/widgets`);
	}

	// Return Array of DashboardModel
	getDashboards(): Observable<Array<DashboardModel>> {
    // return this.http.get<Array<DashboardModel>>('http://localhost:5000/api/dashboard/GetDashboards');
    return this.http.get<Array<DashboardModel>>('http://localhost:3000/dashboards');
	}

	// Return an object
	getDashboard(id: number): Observable<DashboardModel> {
    // const  params = new  HttpParams().set('id', id.toString());
    // return this.http.get<DashboardModel>(`http://localhost:5000/api/dashboard/GetDashboardWigetsByDashboardId`, {
    //   params
    // });
    return this.http.get<DashboardModel>(`http://localhost:3000/dashboards/${id}`);
	}

	// Update json
	updateDashboard(id: number, params): Observable<DashboardModel> {
		return this.http.put<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params);
	}
  
  addUpdateDashboard(id: number, params): Observable<DashboardModel> {
		return this.http.post<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params);
	}
}

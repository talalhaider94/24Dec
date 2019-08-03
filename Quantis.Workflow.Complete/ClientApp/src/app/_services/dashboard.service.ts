import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WidgetModel, DashboardModel, DashboardContentModel } from '../_models';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})

export class DashboardService {

	constructor(private http: HttpClient) { }
	// Return Array of WidgetModel
	getWidgets(): Observable<Array<WidgetModel>> {
		// return this.http.get<Array<WidgetModel>>(`http://localhost:3000/widgets`);
		return this.http.get<Array<WidgetModel>>(`http://localhost:5000/api/dashboard/GetAllWidgets`);
	}

	// Return Array of DashboardModel
	getDashboards(): Observable<Array<DashboardModel>> {
		// return this.http.get<Array<DashboardModel>>('http://localhost:3000/dashboards');
		return this.http.get<Array<DashboardModel>>('http://localhost:5000/api/dashboard/GetDashboards');
	}

	// Return an object
	getDashboard(id: number): Observable<any> {
		// return this.http.get(`http://localhost:3000/dashboards/${id}`);
		const params = new HttpParams().set('id', id.toString());
		return this.http.get<any>(
			`http://localhost:5000/api/dashboard/GetDashboardWigetsByDashboardId`,
			{ params }).pipe(map(result => {
				let dashboardwidgets = [];
				if (result.dashboardwidgets.length > 0) {
					dashboardwidgets = result.dashboardwidgets.map(widget => {
						return {
							cols: widget.sizex,
							rows: widget.sizey,
							x: widget.locationx,
							y: widget.locationy,
							component: widget.widgetname,
							name: widget.widgetname
						}
					});
				}
				let createObj = {
					id: result.id,
					name: result.name,
					createdon: result.createdon,
					dashboardwidgets
				}
				return createObj;
			}));
	}

	// Update json
	updateDashboard(id: number, params): Observable<DashboardModel> {
		// return this.http.put<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params);
		let dashboardwidgets = [];
		if (params.dashboardwidgets.length > 0) {
			dashboardwidgets = params.dashboardwidgets.map(widget => {
				return {
					sizex: widget.cols,
					sizey: widget.rows,
					locationx: widget.x,
					locationy: widget.y,
					component: widget.widgetname,
					name: widget.widgetname
				}
			});
		}
		let newParams = {
			id: params.id,
			name: params.name,
			createdon: params.createdon,
			dashboardwidgets
		}
		return this.http.post<DashboardModel>(`http://localhost:5000/api/dashboard/AddUpdateDasboard/${id}`, newParams);
	}
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WidgetModel, DashboardModel, DashboardContentModel } from '../_models';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})

export class DashboardService {

	constructor(private http: HttpClient) { }
	// Return Array of WidgetModel
	getWidgets(): Observable<Array<WidgetModel>> {
		// return this.http.get<Array<WidgetModel>>(`http://localhost:3000/widgets`);
		return this.http.get<Array<WidgetModel>>(`${environment.API_URL_103}/dashboard/GetAllWidgets`);
	}

	// Return Array of DashboardModel
	getDashboards(): Observable<Array<DashboardModel>> {
		// return this.http.get<Array<DashboardModel>>('http://localhost:3000/dashboards');
		return this.http.get<Array<DashboardModel>>(`${environment.API_URL_103}/dashboard/GetDashboards`);
	}

	// Return an object
	getDashboard(id: number): Observable<any> {
		// return this.http.get(`http://localhost:3000/dashboards/${id}`);
		const params = new HttpParams().set('id', id.toString());
		return this.http.get<any>(
			`${environment.API_URL_103}/dashboard/GetDashboardWigetsByDashboardId`,
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
							name: widget.widgetname,
							filters: widget.filters,
							properties: widget.properties,
							widgetid: widget.widgetid,
							dashboardid: widget.dashboardid,
							id: widget.id
						}
					});
				}
				let createObj = {
					id: result.id,
					name: result.name,
					createdon: result.createdon,
					dashboardwidgets,
					globalfilterid: result.globalfilterid
				}
				return createObj;
			}));
	}

	updateDashboard(id: number, params): Observable<DashboardModel> {
		// return this.http.put<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params);
		let dashboardwidgets = [];
		if (params.dashboardwidgets.length > 0) {
			dashboardwidgets = params.dashboardwidgets.map(widget => {
				return {
					sizex: widget.sizex,
					sizey: widget.sizey,
					locationx: widget.locationx,
					locationy: widget.locationy,
					component: widget.widgetname,
					name: widget.widgetname,
					filters: widget.filters,
					properties: widget.properties,
					widgetid: widget.widgetid,
					dashboardid: widget.dashboardid,
					id: widget.id
				}
			});
		}
		let newParams = {
			id: params.id,
			name: params.name,
			createdon: params.createdon,
			dashboardwidgets
		}
		return this.http.post<DashboardModel>(`${environment.API_URL_103}/dashboard/AddUpdateDasboard`, newParams);
	}
}

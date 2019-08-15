import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WidgetModel, DashboardModel, DashboardContentModel } from '../_models';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
							cols: widget.sizey,
							rows: widget.sizex,
							x: widget.locationx,
							y: widget.locationy,
							component: widget.widgetname,
							widgetname: widget.widgetname,
							filters: widget.filters,
							properties: widget.properties,
							widgetid: widget.widgetid,
							dashboardid: widget.dashboardid,
							uiidentifier: widget.uiidentifier,
							id: widget.id
						}
					});
				}
				let createDashboardObj = {
					id: result.id,
					name: result.name,
					createdon: result.createdon,
					dashboardwidgets,
					globalfilterid: result.globalfilterid || 0
				}
				return createDashboardObj;
			}));
	}

	updateDashboard(params): Observable<DashboardModel> {
		// return this.http.put<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params);
		let dashboardwidgets = [];
		if (params.dashboardwidgets.length > 0) {
			dashboardwidgets = params.dashboardwidgets.map(widget => {
				return {
					sizex: widget.rows,
					sizey: widget.cols,
					locationx: widget.x,
					locationy: widget.y,
					widgetname: widget.widgetname,
					filters: widget.filters,
					properties: widget.properties,
					widgetid: widget.widgetid,
					dashboardid: widget.dashboardid,
					uiidentifier: widget.uiidentifier,
					id: widget.id
				}
			});
		}
		let newParams = {
			id: params.id,
			name: params.name,
			// createdon: params.createdon,
			globalfilterid: params.globalfilterid,
			dashboardwidgets
		}
		return this.http.post<DashboardModel>(`${environment.API_URL_103}/dashboard/AddUpdateDasboard`, newParams);
	}

	getWidgetParameters(url: string): Observable<any> {
		return this.http.get(`${environment.API_URL_103}/${url}/GetWidgetParameters`);
	}

	getWidgetIndex(url: string, formValues: any): Observable<any> {
		const widgetIndexEndPoint = `${environment.API_URL_103}/${url}/Index`;
		return this.http.post(widgetIndexEndPoint, formValues, { observe: 'response' });
	}

}

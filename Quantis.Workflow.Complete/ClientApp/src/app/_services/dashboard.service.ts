import { Injectable } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WidgetModel, DashboardModel } from '../_models';
import { UUID } from 'angular2-uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  // public options: GridsterConfig = {
  //   gridType: "fit",
  //   enableEmptyCellDrop: true,
  //   emptyCellDropCallback: this.onDrop,
  //   pushItems: true,
  //   swap: true,
  //   pushDirections: { north: true, east: true, south: true, west: true },
  //   resizable: { enabled: true },
  //   itemChangeCallback: this.itemChange.bind(this),
  //   draggable: {
  //     enabled: true,
  //     ignoreContent: true,
  //     dropOverItems: true,
  //     dragHandleClass: "drag-handler",
  //     ignoreContentClass: "no-drag",
  //   },
  //   displayGrid: "always",
  //   minCols: 10,
  //   minRows: 10
  // };
  // public layout: GridsterItem[] = [];

  constructor(private http: HttpClient) { }

  // addItem(): void {
  //   this.layout.push({
  //     cols: 5,
  //     id: UUID.UUID(),
  //     rows: 5,
  //     x: 0,
  //     y: 0
  //   });
  // }
  // deleteItem(id: string): void {
  //   const item = this.layout.find(d => d.id === id);
  //   this.layout.splice(this.layout.indexOf(item), 1);
  // }

  // api calls
  	// Return Array of WidgetModel
	getWidgets(): Observable<Array<WidgetModel>> {
		return this.http.get<Array<WidgetModel>>(`http://localhost:3000/widgets`);
	}

	// Return Array of DashboardModel
	getDashboards(): Observable<Array<DashboardModel>> {
		return this.http.get<Array<DashboardModel>>('http://localhost:3000/dashboards');
	}

	// Return an object
	getDashboard(id: number): Observable<DashboardModel> {
		return this.http.get<DashboardModel>(`http://localhost:3000/dashboards/${id}`);
	}

	// Update json
	updateDashboard(id: number, params): Observable<DashboardModel> {
		const httpOptions = {
			headers: new HttpHeaders({
			  'Content-Type':  'application/json'
			})
		};
		return this.http.put<DashboardModel>(`http://localhost:3000/dashboards/${id}`, params, httpOptions);
	}

}

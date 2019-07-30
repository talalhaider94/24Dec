import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../_services';
import { WidgetModel, DashboardModel } from "../../_models";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(private _ds: DashboardService) {};
  protected widgetCollection: WidgetModel[];
	protected dashboardCollection: DashboardModel[];

	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
		// We make a get request to get all widgets from our REST API
		this._ds.getWidgets().subscribe(widgets => {
			this.widgetCollection = widgets;
		});

		// We make get request to get all dashboards from our REST API
		this._ds.getDashboards().subscribe(dashboards => {
			this.dashboardCollection = dashboards;
		});
	}

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
	}

}

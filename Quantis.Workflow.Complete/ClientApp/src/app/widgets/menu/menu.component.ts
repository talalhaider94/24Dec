import { Component, OnInit } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { WidgetModel, DashboardModel } from "../../_models";

@Component({
	selector: 'app-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
	protected widgetCollection: WidgetModel[];
	
	constructor(
		private _ds: DashboardService,
		private emitter: EmitterService
	) { };


	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
		// We make a get request to get all widgets from our REST API
		this.emitter.loadingStatus(true);
		this._ds.getWidgets().subscribe(widgets => {
			console.log('getWidgets', widgets);
			this.widgetCollection = widgets;
			let data = { type: 'widgets', widgets };
			this.emitter.sendNext(data);
			this.emitter.loadingStatus(false);
		}, error => {
			this.emitter.loadingStatus(false);
			console.log('getWidgets', error);
		});
	}

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
	}

}

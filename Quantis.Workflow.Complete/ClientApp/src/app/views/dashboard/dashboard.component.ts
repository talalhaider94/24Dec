import { Component, OnInit } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { DashboardService } from '../../_services';
import { ActivatedRoute } from '@angular/router';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { DashboardModel, DashboardContentModel } from '../../_models';

// importing chart components
import { LineChartComponent } from '../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../widgets/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from '../../widgets/radar-chart/radar-chart.component';

@Component({
	templateUrl: 'dashboard.component.html',
	styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

	constructor(private _ds: DashboardService, private _route: ActivatedRoute) { }
	protected options: GridsterConfig;
	protected dashboardId: number;
	protected dashboardCollection: DashboardModel;
	protected dashboardArray: DashboardContentModel[];
	protected componentCollection = [
		{ name: "Line Chart", componentInstance: LineChartComponent },
		{ name: "Doughnut Chart", componentInstance: DoughnutChartComponent },
		{ name: "Radar Chart", componentInstance: RadarChartComponent }
	];
	isCollapsed = true;

	ngOnInit(): void {
		// Grid options
		this.options = {
			gridType: GridType.Fit,
			displayGrid: DisplayGrid.Always,
			pushItems: true,
			swap: false,
			resizable: {
				enabled: true
			},
			draggable: {
				enabled: true,
				ignoreContent: false,
				dropOverItems: false,
				dragHandleClass: "drag-handler",
				ignoreContentClass: "no-drag",
			},
			margin: 10,
			outerMargin: true,
			outerMarginTop: null,
			outerMarginRight: null,
			outerMarginBottom: null,
			outerMarginLeft: null,
			useTransformPositioning: true,
			mobileBreakpoint: 640,
			enableEmptyCellDrop: true,
			emptyCellDropCallback: this.onDrop,
			pushDirections: { north: true, east: true, south: true, west: true },
			itemChangeCallback: this.itemChange.bind(this),
			minCols: 10,
			maxCols: 100,
			minRows: 10,
			maxRows: 100,
			scrollSensitivity: 10,
			scrollSpeed: 20,
		};
		this.getData();
	}

	getData() {
		// We get the id in get current router dashboard/:id
		this._route.params.subscribe(params => {
			// + is used to cast string to int
			this.dashboardId = +params["id"];
			// We make a get request with the dashboard id
			this._ds.getDashboard(this.dashboardId).subscribe(dashboard => {
				debugger
				// We fill our dashboardCollection with returned Observable
				this.dashboardCollection = dashboard;
				// We parse serialized Json to generate components on the fly
				this.parseJson(this.dashboardCollection);
				// We copy array without reference
				this.dashboardArray = this.dashboardCollection.dashboardwidgets.slice();

			});
		});
	}

	// Super TOKENIZER 2.0 POWERED BY NATCHOIN
	parseJson(dashboardCollection: DashboardModel) {
		// We loop on our dashboardCollection
		dashboardCollection.dashboardwidgets.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.component === component.name) {
					// If it is, we replace our serialized key by our component instance
					dashboard.component = component.componentInstance;
				}
			});
		});
	}

	itemChange() {
		this.dashboardCollection.dashboardwidgets = this.dashboardArray;
		// let tmp = JSON.stringify(this.dashboardCollection);
		// let parsed: DashboardModel = JSON.parse(tmp);
		// this.serialize(parsed.dashboardwidgets);
		// console.log(this.dashboardArray);
		
		this._ds.updateDashboard(this.dashboardId, this.dashboardCollection).subscribe(updatedDashboard => {
			debugger
		}, error => {
			debugger
		});
	}

	serialize(dashboardCollection) {
		// We loop on our dashboardCollection
		dashboardCollection.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.name === component.name) {
					dashboard.component = component.name;
				}
			});
		});
	}

	onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
		debugger
		switch (componentType) {
			case "radar_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: RadarChartComponent,
					name: "Radar Chart"
				});
			case "line_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					minItemRows: 5,
					minItemCols: 5,
					component: LineChartComponent,
					name: "Line Chart"
				});
			case "doughnut_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: DoughnutChartComponent,
					name: "Doughnut Chart"
				});
		}
	}

	changedOptions() {
		debugger
		this.options.api.optionsChanged();
	}

	removeItem(item) {
		debugger
		this.dashboardArray.splice(
			this.dashboardArray.indexOf(item),
			1
		);
		this.itemChange();
	}
}

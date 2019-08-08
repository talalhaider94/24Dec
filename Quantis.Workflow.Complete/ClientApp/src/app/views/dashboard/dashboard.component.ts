import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../_services';
import { ActivatedRoute } from '@angular/router';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { DashboardModel, DashboardContentModel, WidgetModel } from '../../_models';
import { Subscription, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup,  FormBuilder,  Validators } from '@angular/forms';
// importing chart components
import { LineChartComponent } from '../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../widgets/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from '../../widgets/radar-chart/radar-chart.component';
import { BarchartComponent } from '../../widgets/barchart/barchart.component';

@Component({
	templateUrl: 'dashboard.component.html',
	styleUrls: ['dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	widgetCollection: WidgetModel[];
	options: GridsterConfig;
	dashboardId: number;
	dashboardCollection: DashboardModel;
	dashboardWidgetsArray: DashboardContentModel[] = [];
	emitterSubscription: Subscription; // need to destroy this subscription later
	@ViewChild('widgetParametersModal') public widgetParametersModal: ModalDirective;
	barChartWidgetParameters: any;
	// FORM
	widgetParametersForm: FormGroup;
	submitted: boolean = false;
	componentCollection = [
		{ name: "Line Chart", componentInstance: LineChartComponent },
		{ name: "Doughnut Chart", componentInstance: DoughnutChartComponent },
		{ name: "Radar Chart", componentInstance: RadarChartComponent },
		{ name: "Count Trend", componentInstance: BarchartComponent },
	];

	constructor(
		private dashboardService: DashboardService,
		private _route: ActivatedRoute,
		private emitter: EmitterService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
	) { }

	outputs = {
		barChartParent: childData => {
			if(childData.type === 'barChartParams') {
				this.barChartWidgetParameters = childData.data;
			}
			if(childData.type === 'openModal') {
				this.widgetParametersModal.show();
			}
		}
	};

	componentCreated(compRef: ComponentRef<any>) {
		console.log('Component Created', compRef);
	}

	ngOnInit(): void {
		this.widgetParametersForm = this.formBuilder.group({
			chartTypes: ['', Validators.required],
			aggregations: ['', Validators.required],
			measures: ['', Validators.required]
		});
		// Grid options
		this.options = {
			gridType: GridType.Fit,
			displayGrid: DisplayGrid.OnDragAndResize,
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
			itemResizeCallback: DashboardComponent.itemResize,
			minCols: 10,
			maxCols: 100,
			minRows: 10,
			maxRows: 100,
			scrollSensitivity: 10,
			scrollSpeed: 20,
		};

		this._route.params.subscribe(params => {
			this.dashboardId = +params["id"];
			this.emitter.loadingStatus(true);
			this.getData(this.dashboardId);
		});
	}

	getData(dashboardId: number) {
		const getAllWidgets = this.dashboardService.getWidgets();
		const getDashboardWidgets = this.dashboardService.getDashboard(dashboardId);
		forkJoin([getAllWidgets, getDashboardWidgets]).subscribe(result => {
			if (result) {
				const [allWidgets, dashboardData] = result;
				console.log('allWidgets', allWidgets);
				console.log('dashboardData', dashboardData);
				if (allWidgets && allWidgets.length > 0) {
					this.widgetCollection = allWidgets;
				}
				if (dashboardData) {
					this.dashboardCollection = dashboardData;
					// parsing serialized Json to generate components on the fly
					this.parseJson(this.dashboardCollection);
					// copying array without reference to re-render.
					this.dashboardWidgetsArray = this.dashboardCollection.dashboardwidgets.slice();
				}
			} else {
				console.log('WHY NO DASHBOARD DATA');
			}
			this.emitter.loadingStatus(false);
		}, error => {
			this.emitter.loadingStatus(false);
			this.toastr.error('Error while fetching dashboards');
			console.error('Get Dashboard Data', error);
		})

	}
	// might have to re-use it later when updating dashboard on save.
	// getDashboardWidgetsData(dashboardId) {
	// 	this.emitter.loadingStatus(true);
	// 	this.dashboardService.getDashboard(dashboardId).subscribe(dashboard => {
	// 		this.dashboardCollection = dashboard;
	// 		this.parseJson(this.dashboardCollection);
	// 		this.dashboardWidgetsArray = this.dashboardCollection.dashboardwidgets.slice();
	// 		this.emitter.loadingStatus(false);
	// 	}, error => {
	// 		console.log('getDashboardWidgetsData', error);
	// 		this.toastr.error('Error while fetching dashboards');
	// 		this.emitter.loadingStatus(false);
	// 	});
	// }

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
		this.dashboardCollection.dashboardwidgets = this.dashboardWidgetsArray;
		// let tmp = JSON.stringify(this.dashboardCollection);
		// let parsed: DashboardModel = JSON.parse(tmp);
		// this.serialize(parsed.dashboardwidgets);
		// console.log(this.dashboardWidgetsArray);
		
		// this.emitter.loadingStatus(true);
		// this.dashboardService.updateDashboard(this.dashboardId, this.dashboardCollection).subscribe(updatedDashboard => {
		// 	this.emitter.loadingStatus(false);
		// }, error => {
		// 	console.log('updateDashboard', error);
		// 	this.emitter.loadingStatus(false);
		// });
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
		switch (componentType) {
			case "radar_chart":
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: RadarChartComponent,
					name: "Radar Chart",
					filters: [], // need to update this code
					properties: [],
					dashboardid: 1,
					widgetid: 2,
					id: 0, // 0 because we are adding them
				});
			case "line_chart":
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					minItemRows: 5,
					minItemCols: 5,
					component: LineChartComponent,
					name: "Line Chart",
					filters: [], // need to update this code
					properties: [],
					dashboardid: 1,
					widgetid: 4,
					id: 0
				});
			case "doughnut_chart":
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: DoughnutChartComponent,
					name: "Doughnut Chart",
					filters: [], // need to update this code
					properties: [],
					dashboardid: 1,
					widgetid: 3,
					id: 0
				});
			case "count_trend":
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: BarchartComponent,
					name: "Count Trend",
					filters: [], // need to update this code
					properties: [],
					dashboardid: 1,
					widgetid: 1,
					id: 0,
					url: this.widgetCollection.find(widget => widget.uiidentifier === 'count_trend').url
				});
		}
	}

	changedOptions() {
		this.options.api.optionsChanged();
	}

	removeItem(item) {
		this.dashboardWidgetsArray.splice(
			this.dashboardWidgetsArray.indexOf(item),
			1
		);
		// this.itemChange();
	}

	static itemResize(item, itemComponent) {
		// console.info('itemResized', item, itemComponent);
	}
	
	get f() { return this.widgetParametersForm.controls; }

	onWidgetParametersFormSubmit(){
		debugger
	}
}

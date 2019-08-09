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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
	helpText: string = '';
	constructor(
		private dashboardService: DashboardService,
		private _route: ActivatedRoute,
		private emitter: EmitterService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
	) { }

	outputs = {
		barChartParent: childData => {
			if (childData.type === 'barChartParams') {
				this.barChartWidgetParameters = childData.data;
			}
			if (childData.type === 'openModal') {
				if (this.barChartWidgetParameters) {
					this.widgetParametersForm.setValue({
						GlobalFilterId: 0,
						Properties: {
							charttype: 'bar',
							aggregationoption: 'period',
							measure: '0'
						},
						Filters: {
							daterange: '03/19:06/19'
						}
					})
				}
				this.helpText = this.widgetCollection.find(widget => widget.uiidentifier === 'count_trend').help;
				this.widgetParametersModal.show();
			}
		}
	};

	componentCreated(compRef: ComponentRef<any>) {
		console.log('Component Created', compRef);
	}

	ngOnInit(): void {
		this.widgetParametersForm = this.formBuilder.group({
			GlobalFilterId: [null],
			Properties: this.formBuilder.group({
				charttype: [null],
				aggregationoption: [null],
				measure: [null]
			}),
			Filters: this.formBuilder.group({
				daterange: [null]
			})
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
					// attaching component instance with widget.component key
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
		dashboardCollection.dashboardwidgets.forEach(widget => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (widget.component === component.name) {
					// If it is, we replace our serialized key by our component instance
					widget.component = component.componentInstance;
				}
			});
		});
	}

	itemChange() {
		this.dashboardCollection.dashboardwidgets = this.dashboardWidgetsArray;
		let changedDashboardWidgets: DashboardModel = this.dashboardCollection;
		// this.serialize(changedDashboardWidgets.dashboardwidgets);
	}

	saveDashboard() {
		this.emitter.loadingStatus(true);
		debugger
		this.dashboardService.updateDashboard(this.dashboardId, this.dashboardCollection).subscribe(updatedDashboard => {
			this.emitter.loadingStatus(false);
			debugger
		}, error => {
			console.log('updateDashboard', error);
			debugger
			this.emitter.loadingStatus(false);
		});

	}

	serialize(dashboardwidgets) {
		// We loop on our dashboardCollection
		dashboardwidgets.forEach(widget => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (widget.widgetname === component.name) {
					widget.component = component.name;
				}
			});
		});
	}

	onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
		switch (componentType) {
			case "radar_chart": {
				let radarWidget = this.widgetCollection.find(widget => widget.uiidentifier === 'radar_chart');
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: RadarChartComponent,
					widgetname: radarWidget.name,
					uiidentifier: radarWidget.uiidentifier,
					filters: [], // need to update this code
					properties: [],
					dashboardid: this.dashboardId,
					widgetid: radarWidget.id,
					id: 0, // 0 because we are adding them
					url: radarWidget.url
				});
			}
			case "line_chart": {
				let lineWidget = this.widgetCollection.find(widget => widget.uiidentifier === 'line_chart');
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: LineChartComponent,
					widgetname: lineWidget.name,
					uiidentifier: lineWidget.uiidentifier,
					filters: [], // need to update this code
					properties: [],
					dashboardid: this.dashboardId,
					widgetid: lineWidget.id,
					id: 0,
					url: lineWidget.url
				});
			}
			case "doughnut_chart": {
				let doughnutWidget = this.widgetCollection.find(widget => widget.uiidentifier === 'doughnut_chart');
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: DoughnutChartComponent,
					widgetname: doughnutWidget.name,
					uiidentifier: doughnutWidget.uiidentifier,
					filters: [], // need to update this code
					properties: [],
					dashboardid: this.dashboardId,
					widgetid: doughnutWidget.id,
					id: 0,
					url: doughnutWidget.url
				});
			}
			case "count_trend": {
				let countWidget = this.widgetCollection.find(widget => widget.uiidentifier === 'count_trend');
				return this.dashboardWidgetsArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: BarchartComponent,
					widgetname: countWidget.name,
					uiidentifier: countWidget.uiidentifier,
					filters: [], // need to update this code
					properties: [],
					dashboardid: this.dashboardId,
					widgetid: countWidget.id,
					id: 0,
					url: countWidget.url
				});
			}
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

	onWidgetParametersFormSubmit() {
		let formValues = this.widgetParametersForm.value;
		const { url, widgetid } = this.barChartWidgetParameters;
		this.emitter.loadingStatus(true);
		this.dashboardService.getWidgetIndex(url, formValues).subscribe(result => {
			this.emitter.sendNext({
				type: 'barChart',
				widgetid,
				data: result
			})
			this.emitter.loadingStatus(false);
		}, error => {
			this.emitter.loadingStatus(false);
		})
	}
}

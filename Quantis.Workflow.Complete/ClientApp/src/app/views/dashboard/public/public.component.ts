import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../../_services';
import { ActivatedRoute } from '@angular/router';
import { DashboardModel, DashboardContentModel, WidgetModel } from '../../../_models';
import { Subscription, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder } from '@angular/forms';
// importing chart components
import { LineChartComponent } from '../../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../../widgets/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from '../../../widgets/radar-chart/radar-chart.component';
import { BarchartComponent } from '../../../widgets/barchart/barchart.component';

@Component({
	selector: 'app-public',
	templateUrl: './public.component.html',
	styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
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
			} else if (childData.type === 'closeModal') {
				this.widgetParametersModal.hide();
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
			displayGrid: DisplayGrid.None,
			pushItems: true,
			swap: false,
			resizable: {
				enabled: false
			},
			draggable: {
				enabled: false,
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
			// emptyCellDropCallback: this.onDrop,
			pushDirections: { north: true, east: true, south: true, west: true },
			// itemChangeCallback: this.itemChange.bind(this),
			// itemResizeCallback: PublicComponent.itemResize,
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
					// this logic needs to be update because in future widget name will be different
					// need to make this match on the basis on uiidentifier
					let url = this.widgetCollection.find(myWidget => myWidget.name === widget.widgetname).url;
					widget.url = url;
				}
			});
		});
	}

	onWidgetParametersFormSubmit() {
		let formValues = this.widgetParametersForm.value;
		const { url, widgetid } = this.barChartWidgetParameters;
		this.emitter.loadingStatus(true);
		this.dashboardService.getWidgetIndex(url, formValues).subscribe(result => {
			this.emitter.sendNext({
				type: 'barChart',
				widgetid,
				data: {
					result,
					barChartWidgetParameters: this.barChartWidgetParameters,
					barChartWidgetParameterValues: formValues
				}
			})
			this.emitter.loadingStatus(false);
		}, error => {
			this.emitter.loadingStatus(false);
		})
	}
}

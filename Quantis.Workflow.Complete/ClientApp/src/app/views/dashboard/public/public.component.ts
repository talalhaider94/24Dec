import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../../_services';
import { ActivatedRoute } from '@angular/router';
import { DashboardModel, DashboardContentModel, WidgetModel, ComponentCollection } from '../../../_models';
import { Subscription, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DateTimeService } from '../../../_helpers';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
// importing chart components
import { LineChartComponent } from '../../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../../widgets/doughnut-chart/doughnut-chart.component';
import { RadarChartComponent } from '../../../widgets/radar-chart/radar-chart.component';
import { BarchartComponent } from '../../../widgets/barchart/barchart.component';
import { KpiCountSummaryComponent } from '../../../widgets/kpi-count-summary/kpi-count-summary.component';
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
	cloneDashboardWidgetsArrayState: DashboardContentModel[] = [];
	emitterSubscription: Subscription; // need to destroy this subscription later
	@ViewChild('widgetParametersModal') public widgetParametersModal: ModalDirective;
	barChartWidgetParameters: any;

	treesArray = [];
	isTreeLoaded = false;
	public treeFields: any = {
		dataSource: [],
		id: 'id',
		text: 'name',
		child: 'children',
		title: 'name'
	};

	// FORM
	widgetParametersForm: FormGroup;
	submitted: boolean = false;
	// move to Dashboard service
	componentCollection: Array<ComponentCollection> = [
		{ name: "Line Chart", componentInstance: LineChartComponent, uiidentifier: "not_implemented" },
		{ name: "Distribution by Verifica", componentInstance: DoughnutChartComponent, uiidentifier: "distribution_by_verifica" },
		{ name: "Radar Chart", componentInstance: RadarChartComponent, uiidentifier: "not_implemented" },
		{ name: "Count Trend", componentInstance: BarchartComponent, uiidentifier: "count_trend" },
		{ name: "KPI Count Summary", componentInstance: KpiCountSummaryComponent, uiidentifier: "kpi_count_summary" },
	];
	helpText: string = '';
	showDateRangeInFilters: boolean = false;
	showDateInFilters: boolean = false;

	constructor(
		private dashboardService: DashboardService,
		private _route: ActivatedRoute,
		private emitter: EmitterService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
		private dateTime: DateTimeService
	) { }

	outputs = {
		barChartParent: childData => {
			console.log('barChartParent childData', childData);
			if (childData.type === 'openBarChartModal') {
				this.barChartWidgetParameters = childData.data.barChartWidgetParameters;
				if (this.barChartWidgetParameters) {
					this.updateDashboardWidgetsArray(this.barChartWidgetParameters.id, childData.data.setWidgetFormValues);
					setTimeout(() => {
						this.widgetParametersForm.patchValue(childData.data.setWidgetFormValues)
					});
				}
				this.helpText = this.widgetCollection.find(widget => widget.uiidentifier === 'count_trend').help;
				this.widgetParametersModal.show();
			} else if (childData.type === 'closeModal') {
				this.widgetParametersModal.hide();
			}
		}
	};

	componentCreated(compRef: ComponentRef<any>) {
		// console.log('Component Created', compRef);
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
				daterange: [null],
				dateTypes: [null],
				date: [null]
			}),
			Note: [null],
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
			itemChangeCallback: this.itemChange.bind(this),
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

		this.widgetParametersForm.get('Filters').get('dateTypes').valueChanges.subscribe((value) => {
			console.log('Date Type Filter', value);
			if(value === 'Custom') {
				this.showDateRangeInFilters = true;
				this.showDateInFilters = true;
			} else{
				this.showDateRangeInFilters = false;
				this.showDateInFilters = false;
			}
		});

		////Tree View////
		console.log('--- Tree View ---');
		this.dashboardService.GetOrganizationHierarcy().subscribe(data=>{
		console.log('GetOrganizationHierarcy ==> ', data);
		//this.treeFields.dataSource = data;
		this.createTrees(data);
		}, err => {this.isTreeLoaded = true; this.toastr.warning('Connection error', 'Info')});

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
				// is equal to our component name/uiidentifier key in our componentCollection
				// if (widget.component === component.name) {
				if (widget.uiidentifier === component.uiidentifier) {
					// If it is, we replace our serialized key by our component instance
					widget.component = component.componentInstance;
					// this logic needs to be update because in future widget name will be different
					// need to make this match on the basis on uiidentifier
					// let url = this.widgetCollection.find(myWidget => myWidget.name === widget.widgetname).url;
					let url = this.widgetCollection.find(myWidget => myWidget.uiidentifier === widget.uiidentifier).url;
					widget.url = url;
				}
			});
		});
	}

	itemChange() {
		this.dashboardCollection.dashboardwidgets = this.dashboardWidgetsArray;
		let changedDashboardWidgets: DashboardModel = this.dashboardCollection;
		// this.serialize(changedDashboardWidgets.dashboardwidgets);
	}

	saveDashboardState() {
		console.log('saveDashboardState params', this.cloneDashboardWidgetsArrayState);
		// this.dashboardService.saveDashboardState(this.cloneDashboardWidgetsArrayState).subscribe(result => {
		// 	console.log('saveDashboardState', result);
		// }, error => {
		// 	console.error('saveDashboardState', error);
		// });
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

	changedOptions() {
		this.options.api.optionsChanged();
	}

	removeItem(item) {
		this.dashboardWidgetsArray.splice(
			this.dashboardWidgetsArray.indexOf(item),
			1
		);
		this.itemChange();
	}

	onWidgetParametersFormSubmit() {
		let formValues = this.widgetParametersForm.value;

		let startDate;
		let endDate;
		if(formValues.Filters.dateTypes === 'Custom') {
			startDate = this.dateTime.moment(formValues.Filters.daterange[0]).format('MM/YYYY');
			endDate = this.dateTime.moment(formValues.Filters.daterange[1]).format('MM/YYYY');
		} else {
			let timePeriodRange = this.dateTime.timePeriodRange(formValues.Filters.dateTypes);
			startDate = timePeriodRange.startDate;
			endDate = timePeriodRange.endDate;
		}		
		formValues.Filters.daterange = `${startDate}-${endDate}`;
		// why it is not copying without reference :/ idiot
		let copyFormValues =  Object.assign({}, formValues);
		delete formValues.Filters.dateTypes;
		delete formValues.Filters.date;
		const { url } = this.barChartWidgetParameters;
		this.emitter.loadingStatus(true);
		this.dashboardService.getWidgetIndex(url, formValues).subscribe(result => {
			this.emitter.sendNext({
				type: 'barChart',
				data: {
					result,
					barChartWidgetParameters: this.barChartWidgetParameters,
					barChartWidgetParameterValues: copyFormValues
				}
			})
			this.emitter.loadingStatus(false);
		}, error => {
			console.log('onWidgetParametersFormSubmit', error);
			this.emitter.loadingStatus(false);
		})
	}
	customDateTypes(event) {
		// debugger
	}

	addLoaderToTrees(add = true){
		let load = false;
		if(add === false){
		  load = true;
		}
		this.treesArray.forEach((itm:any) => {
		  itm.loaded = load;
		});
	}

	syncSelectedNodesArray(event, treeRef){
	  console.log('cheked ');//, treeRef);
	  treeRef.loaded = true;
	  //this.selectedData.checked = this.permissionsTree.checkedNodes;
	}

	createTrees(treesData){
		treesData.forEach((itm:any)=>{
			let settings = { dataSource: [itm], id: 'id', text: 'name', title: 'name', child: 'children', hasChildren: 'children' };
			this.treesArray.push({
				name: itm.name,
				settings: settings,
				checkedNodes: [],
				id: itm.id,
				elementId: `permissions_tree_${itm.id}`,
				loaded: true
			});
			console.log('this.treesArray ->',this.treesArray);
		});

		this.isTreeLoaded = true;
	}

	updateDashboardWidgetsArray(widgetId, widgetFormValues) {
		console.log(this.dashboardWidgetsArray);
		let updatedDashboardArray = this.dashboardWidgetsArray.map(widget => {
			if(widget.id === widgetId) {
				let a = {
					...widget,
					filters: widgetFormValues.Filters,
					properties: widgetFormValues.Properties,
				}
				return a;
			} else {
				return widget;
			}
		});
		console.log('updatedDashboardArray', updatedDashboardArray);
		console.log('this.dashboardWidgetsArray', this.dashboardWidgetsArray);
		// this.dashboardWidgetsArray = updatedDashboardArray;
		this.cloneDashboardWidgetsArrayState = updatedDashboardArray;
		// need to preserve dashbaordCollection state in abother variable to aviod re-rendering
		// this.dashboardCollection.dashboardwidgets = updatedDashboardArray;
	}
}

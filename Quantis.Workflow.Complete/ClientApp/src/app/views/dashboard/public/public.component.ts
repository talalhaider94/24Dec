import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../../_services';
import { ActivatedRoute } from '@angular/router';
import { DashboardModel, DashboardContentModel, WidgetModel, ComponentCollection } from '../../../_models';
import { Subscription, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DateTimeService, removeNullKeysFromObject } from '../../../_helpers';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
// importing chart components
import { LineChartComponent } from '../../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../../widgets/doughnut-chart/doughnut-chart.component';
import { BarchartComponent } from '../../../widgets/barchart/barchart.component';
import { KpiCountSummaryComponent } from '../../../widgets/kpi-count-summary/kpi-count-summary.component';
import { CatalogPendingCountTrendsComponent } from '../../../widgets/catalog-pending-count-trends/catalog-pending-count-trends.component';
import { DistributionByUserComponent } from '../../../widgets/distribution-by-user/distribution-by-user.component';
import { KpiReportTrendComponent } from '../../../widgets/kpi-report-trend/kpi-report-trend.component';
import { NotificationTrendComponent } from '../../../widgets/notification-trend/notification-trend.component';
import { KpiCountByOrganizationComponent } from '../../../widgets/kpi-count-by-organization/kpi-count-by-organization.component';

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
	cloneDashboardWidgetsArrayState: any = [];
	emitterSubscription: Subscription; // need to destroy this subscription later
	@ViewChild('widgetParametersModal') public widgetParametersModal: ModalDirective;
	barChartWidgetParameters: any;

	@ViewChild('permissionsTree') permissionsTree: TreeViewComponent;
	treesArray = [];
	isTreeLoaded = false;
	public treeFields: any = {
		dataSource: [],
		id: 'id',
		text: 'name',
		child: 'children',
		title: 'name'
	};
	preSelectedNodes = ['1075', '1000', '1065', '1055', '1090', '1050', '1005', '1015', '1085', '1080', '1020', '1001'];
	allLeafNodesIds = [];
	uncheckedNodes = [];
	from_changed;
	to_changed;
	// FORM
	widgetParametersForm: FormGroup;
	submitted: boolean = false;
	// move to Dashboard service
	componentCollection: Array<ComponentCollection> = [
		{ name: "Line Chart", componentInstance: LineChartComponent, uiidentifier: "not_implemented" },
		{ name: "Distribution by Verifica", componentInstance: DoughnutChartComponent, uiidentifier: "distribution_by_verifica" },
		{ name: "Count Trend", componentInstance: BarchartComponent, uiidentifier: "count_trend" },
		{ name: "KPI Count Summary", componentInstance: KpiCountSummaryComponent, uiidentifier: "kpi_count_summary" },
		{ name: "Catalog Pending Count Trends", componentInstance: CatalogPendingCountTrendsComponent, uiidentifier: "catalog_pending_count_trends" },
		{ name: "Distribution by User", componentInstance: DistributionByUserComponent, uiidentifier: "distribution_by_user" },
		{ name: "KPI Report Trend", componentInstance: KpiReportTrendComponent, uiidentifier: "kpi_report_trend" },
		{ name: "Notification Trend", componentInstance: NotificationTrendComponent, uiidentifier: "notification_trend" },
		{ name: "KPI count by Organization", componentInstance: KpiCountByOrganizationComponent, uiidentifier: "kpi_count_by_organization" },
	];
	helpText: string = '';
	showDateRangeInFilters: boolean = false;
	showDateInFilters: boolean = false;
	showCustomDate: boolean = false;

	isBarChartComponent: boolean = false;
	isKpiCountSummaryComponent: boolean = false;
	isverificaDoughnutComponent: boolean = false;
	isCatalogPendingComponent: boolean = false;
	isNotificationTrendComponent: boolean = false;
	isKpiReportTrendComponent: boolean = false;
	isKpiCountOrgComponent: boolean = false;
	isDistributionByUserComponent: boolean = false;
	dashboardName: string;
	constructor(
		private dashboardService: DashboardService,
		private _route: ActivatedRoute,
		private emitter: EmitterService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
		private dateTime: DateTimeService
	) { }

	showWidgetsModalAndSetFormValues(childData, identifier) {
		if (this.barChartWidgetParameters) {
			this.updateDashboardWidgetsArray(this.barChartWidgetParameters.id, childData.setWidgetFormValues);
			setTimeout(() => {
				this.widgetParametersForm.patchValue(childData.setWidgetFormValues)
			});
		}
		this.helpText = this.widgetCollection.find(widget => widget.uiidentifier === identifier).help;
		this.widgetParametersModal.show();
	}

	showPropertyTab(properties) {
		return (Object.keys(properties).length) ? true : false;
	}
	showFilterTab(filters) {
		return (Object.keys(filters).length) ? true : false;
	}

	outputs = {
		barChartParent: childData => {
			console.log('barChartParent childData', childData);
			if (childData.type === 'openBarChartModal') {
				debugger
				// this.barChartWidgetParameters should be a generic name
				this.barChartWidgetParameters = childData.data.barChartWidgetParameters;
				// this.createTrees(childData.data.organizationHierarchy);
				// setting the isBarChartComponent value to true on openning modal so that their
				// state can be saved in their own instance when closing
				this.isBarChartComponent = childData.data.isBarChartComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'count_trend');
				// if (this.barChartWidgetParameters) {
				// 	this.updateDashboardWidgetsArray(this.barChartWidgetParameters.id, childData.data.setWidgetFormValues);
				// 	setTimeout(() => {
				// 		this.widgetParametersForm.patchValue(childData.data.setWidgetFormValues)
				// 	});
				// }
				// this.helpText = this.widgetCollection.find(widget => widget.uiidentifier === 'count_trend').help;
				// this.widgetParametersModal.show();
			}
		},
		kpiCountSummaryParent: childData => {
			console.log('kpiCountSummaryParent childData', childData);
			if (childData.type === 'openKpiSummaryCountModal') {
				this.barChartWidgetParameters = childData.data.kpiCountSummaryWidgetParameters;
				this.isKpiCountSummaryComponent = childData.data.isKpiCountSummaryComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'kpi_count_summary');
			}
		},
		verificaDoughnutParent: childData => {
			console.log('verificaDoughnutParent childData', childData);
			if (childData.type === 'openVerificaDoughnutChartModal') {
				this.barChartWidgetParameters = childData.data.verificaDoughnutChartWidgetParameters;
				this.isverificaDoughnutComponent = childData.data.isverificaDoughnutComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'distribution_by_verifica');
			}
		},
		catalogPendingParent: childData => {
			console.log('catalogPendingParent childData', childData);
			if (childData.type === 'openCatalogPendingModal') {
				this.barChartWidgetParameters = childData.data.catalogPendingWidgetParameters;
				this.isCatalogPendingComponent = childData.data.isCatalogPendingComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'catalog_pending_count_trends');
			}
		},
		notificationTrendParent: childData => {
			console.log('notificationTrendParent childData', childData);
			if (childData.type === 'openNotificationTrendModal') {
				this.barChartWidgetParameters = childData.data.notificationTrendWidgetParameters;
				this.isNotificationTrendComponent = childData.data.isNotificationTrendComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'notification_trend');
			}
		},
		kpiReportTrendParent: childData => {
			console.log('kpiReportTrendParent childData', childData);
			if (childData.type === 'openKpiReportTrendModal') {
				this.barChartWidgetParameters = childData.data.kpiReportTrendWidgetParameters;
				this.isKpiReportTrendComponent = childData.data.isKpiReportTrendComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'kpi_report_trend');
			}
		},
		kpiCountOrgParent: childData => {
			console.log('kpiCountOrgParent childData', childData);
			if (childData.type === 'openKpiCountOrgModal') {
				this.barChartWidgetParameters = childData.data.kpiCountOrgWidgetParameters;
				this.isKpiCountOrgComponent = childData.data.isKpiCountOrgComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'kpi_count_by_organization');
			}
		},
		distributionByUserParent: childData => {
			console.log('distributionByUserParent childData', childData);
			if (childData.type === 'openDistributionByUserModal') {
				this.barChartWidgetParameters = childData.data.distributionByUserWidgetParameters;
				this.isDistributionByUserComponent = childData.data.isDistributionByUserComponent;
				this.showWidgetsModalAndSetFormValues(childData.data, 'distribution_by_user');
			}
		},
	};

	componentCreated(compRef: ComponentRef<any>) {
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
				date: [''],
				includeCurrentMonth: [false] 
			}),
			// Note: [null],
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
			// maxItemCols: 4,
			// maxItemRows: 7,
			minRows: 10,
			maxRows: 100,
			scrollSensitivity: 10,
			scrollSpeed: 20,
		};

		this._route.params.subscribe(params => {
			this.dashboardId = +params["id"];
			this.emitter.loadingStatus(true);
			this.getData(this.dashboardId); /////
		});

		this.widgetParametersForm.get('Filters').get('dateTypes').valueChanges.subscribe((value) => {
			console.log('Date Type Filter', value);
			if (value === '0') {
				this.showDateRangeInFilters = true;
				this.showDateInFilters = true;
			} else {
				this.showDateRangeInFilters = false;
				this.showDateInFilters = false;
			}
		});
		this.closeModalSubscription();
	}

	getData(dashboardId: number) {
		const getAllWidgets = this.dashboardService.getWidgets();
		const getDashboardWidgets = this.dashboardService.getDashboard(dashboardId);
		const getOrgHierarcy = this.dashboardService.GetOrganizationHierarcy();

		forkJoin([getAllWidgets, getDashboardWidgets, getOrgHierarcy]).subscribe(result => {
			if (result) {
				const [allWidgets, dashboardData, getOrgHierarcy] = result;
				console.log('allWidgets', allWidgets);
				console.log('dashboardData', dashboardData);
				console.log('getOrgHierarcy', getOrgHierarcy);

				if (allWidgets && allWidgets.length > 0) {
					this.widgetCollection = allWidgets;
				}
				if (dashboardData) {
					this.dashboardCollection = dashboardData;
					this.dashboardName = dashboardData.name;
					// parsing serialized Json to generate components on the fly
					// attaching component instance with widget.component key
					this.parseJson(this.dashboardCollection);
					// copying array without reference to re-render.
					this.dashboardWidgetsArray = this.dashboardCollection.dashboardwidgets.slice();
				}

				if (getOrgHierarcy && getOrgHierarcy.length > 0) {
					this.createTrees(getOrgHierarcy);
				}

			} else {
				console.log('WHY NO DASHBOARD DATA');
			}
			this.emitter.loadingStatus(false);
		}, error => {
			this.isTreeLoaded = true;
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
		this.emitter.loadingStatus(true);
		let params = this.cloneDashboardWidgetsArrayState.map(widget => {
			if (Object.keys(widget.filters).length > 0) {
				if (widget.filters.hasOwnProperty('daterange')) {
					widget.filters.daterange = this.dateTime.getStringDateRange(widget.filters.daterange);
				}
			}
			return {
				id: widget.id,
				Filters: widget.filters,
				Properties: widget.properties
			}
		});
		debugger
		// removeNullKeysFromObject()
		this.dashboardService.saveDashboardState(params).subscribe(result => {
			this.emitter.loadingStatus(false);
			this.toastr.success('Dashboard state saved successfully');
			console.log('saveDashboardState', result);
		}, error => {
			this.emitter.loadingStatus(false);
			this.toastr.error('Error while saving dashboard state');
			console.error('saveDashboardState', error);
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

	fromCalendar(container1) {
		container1.monthSelectHandler = (event: any): void => {
			container1._store.dispatch(container1._actions.select(event.date));
			this.from_changed=1;

			if(this.from_changed==1){
				this.showCustomDate=false;
			}else{
				this.showCustomDate=true;
			}
		};
		container1.setViewMode('month');
	}

	toCalendar(container2) {
		container2.monthSelectHandler = (event: any): void => {
			container2._store.dispatch(container2._actions.select(event.date));
		};
		container2.setViewMode('month');
	} 

	fromChanged(){
		console.log('fromChanged');
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

	syncSelectedNodesArray(event, treeRef) {
		// this.allLeafNodesIds = [];
		// this.getAllLeafNodesIds(treeRef.settings.dataSource);
		this.uncheckedNodes = this.allLeafNodesIds.filter(value => this.permissionsTree.checkedNodes.indexOf(value.toString()) == -1);
		console.log(this.uncheckedNodes, this.uncheckedNodes.join(','));
		console.log('permissionsTree.checkedNodes->', this.permissionsTree.checkedNodes.length);
		treeRef.loaded = true;
	}
	createTrees(treesData) {
		console.log('treesData ->', treesData);
		//treesData.forEach((itm: any) => {
			let settings = { dataSource: treesData, id: 'id', text: 'name', title: 'name', child: 'children', hasChildren: 'children' };
			this.treesArray.push({
				name: treesData.name,
				settings: settings,
				checkedNodes: this.preSelectedNodes,
				id: treesData.id,
				elementId: `permissions_tree_${treesData.id}`,
				loaded: true
			});
			this.allLeafNodesIds = [];
			this.getAllLeafNodesIds(treesData);
			//this.permissionsTree.uncheckAll(this.uncheckedNodes);
		//});
		console.log('this.treesArray ->', this.treesArray);
		this.isTreeLoaded = true;
	}
	getAllLeafNodesIds(complexJson) {
		if (complexJson) {
			complexJson.forEach((item: any) => {
				if (item.children) {
					this.getAllLeafNodesIds(item.children);
				} else {
					this.allLeafNodesIds.push(item.id);
				}
			});
			//console.log('allLeafNodesIds ->', this.allLeafNodesIds);
		}
	}

	onWidgetParametersFormSubmit() {
		let formValues = this.widgetParametersForm.value;
		//debugger
		delete formValues.Filters.includeCurrentMonth;
		let startDate;
		let endDate;
		if (formValues.Filters.dateTypes === '0') {
			startDate = this.dateTime.moment(formValues.Filters.daterange[0]).format('MM/YYYY');
			endDate = this.dateTime.moment(formValues.Filters.daterange[1]).format('MM/YYYY');
		} else {
			let timePeriodRange = this.dateTime.timePeriodRange(formValues.Filters.dateTypes);
			startDate = timePeriodRange.startDate;
			endDate = timePeriodRange.endDate;
		}
		formValues.Filters.daterange = `${startDate}-${endDate}`;
		// Organization hierarchy as Customers
		this.uncheckedNodes;
		console.log('permissionsTree.checkedNodes->',this.permissionsTree.checkedNodes);
		formValues.Filters.organizations = this.permissionsTree.checkedNodes.join(',');
		let copyFormValues = { ...formValues, Filters: formValues.Filters, Properties: formValues.Properties };
		let submitFormValues = removeNullKeysFromObject(formValues);
		const { url } = this.barChartWidgetParameters;
		this.emitter.loadingStatus(true);
		this.dashboardService.getWidgetIndex(url, submitFormValues).subscribe(result => {
			// sending data to bar chart component only.
			if (this.isBarChartComponent) {
				this.emitter.sendNext({
					type: 'barChart',
					data: {
						result,
						barChartWidgetParameters: this.barChartWidgetParameters,
						barChartWidgetParameterValues: copyFormValues
					}
				});
				this.isBarChartComponent = false;
			}
			if (this.isKpiCountSummaryComponent) {
				this.emitter.sendNext({
					type: 'kpiCountSummaryChart',
					data: {
						result,
						kpiCountSummaryWidgetParameters: this.barChartWidgetParameters,
						kpiCountSummaryWidgetParameterValues: copyFormValues
					}
				});
				this.isKpiCountSummaryComponent = false;
			}
			if (this.isverificaDoughnutComponent) {
				this.emitter.sendNext({
					type: 'verificaDoughnutChart',
					data: {
						result,
						verificaDoughnutWidgetParameters: this.barChartWidgetParameters,
						verificaDoughnutWidgetParameterValues: copyFormValues
					}
				});
				this.isverificaDoughnutComponent = false;
			}
			if (this.isCatalogPendingComponent) {
				this.emitter.sendNext({
					type: 'catalogPendingChart',
					data: {
						result,
						catalogPendingWidgetParameters: this.barChartWidgetParameters,
						catalogPendingWidgetParameterValues: copyFormValues
					}
				});
				this.isCatalogPendingComponent = false;
			}
			if (this.isNotificationTrendComponent) {
				this.emitter.sendNext({
					type: 'notificationTrendChart',
					data: {
						result,
						notificationTrendWidgetParameters: this.barChartWidgetParameters,
						notificationTrendWidgetParameterValues: copyFormValues
					}
				});
				this.isNotificationTrendComponent = false;
			}
			if (this.isKpiReportTrendComponent) {
				this.emitter.sendNext({
					type: 'kpiReportTrendChart',
					data: {
						result,
						kpiReportTrendWidgetParameters: this.barChartWidgetParameters,
						kpiReportTrendWidgetParameterValues: copyFormValues
					}
				});
				this.isKpiReportTrendComponent = false;
			}
			if (this.isKpiCountOrgComponent) {
				this.emitter.sendNext({
					type: 'kpiCountByOrgChart',
					data: {
						result,
						kpiCountOrgWidgetParameters: this.barChartWidgetParameters,
						kpiCountOrgWidgetParameterValues: copyFormValues
					}
				});
				this.isKpiCountOrgComponent = false;
			}
			if (this.isDistributionByUserComponent) {
				this.emitter.sendNext({
					type: 'distributionByUserChart',
					data: {
						result,
						distributionByUserWidgetParameters: this.barChartWidgetParameters,
						distributionByUserWidgetParameterValues: copyFormValues
					}
				});
				this.isDistributionByUserComponent = false;
			}

			this.emitter.loadingStatus(false);
		}, error => {
			console.log('onWidgetParametersFormSubmit', error);
			this.emitter.loadingStatus(false);
		})
	}
	customDateTypes(event) {
		//console.log('customDateTypes', event);
	}

	addLoaderToTrees(add = true) {
		let load = false;
		if (add === false) {
			load = true;
		}
		this.treesArray.forEach((itm: any) => {
			itm.loaded = load;
		});
	}

	updateDashboardWidgetsArray(widgetId, widgetFormValues) {
		console.log('Before this.dashboardWidgetsArray', this.dashboardWidgetsArray);
		let updatedDashboardArray = this.dashboardWidgetsArray.map(widget => {
			if (widget.id === widgetId) {
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
		console.log('After this.dashboardWidgetsArray', this.dashboardWidgetsArray);
		// this.dashboardWidgetsArray = updatedDashboardArray;
		this.cloneDashboardWidgetsArrayState = updatedDashboardArray;
		// need to preserve dashbaordCollection state in abother variable to aviod re-rendering
		// this.dashboardCollection.dashboardwidgets = updatedDashboardArray;
	}

	closeModalSubscription() {
		this.emitter.getData().subscribe(data => {
			if (data.type === 'closeModal') {
				this.widgetParametersModal.hide();
				this.isBarChartComponent = false;
				this.isKpiCountSummaryComponent = false;
				this.isverificaDoughnutComponent = false;
				this.isCatalogPendingComponent = false;
				this.isNotificationTrendComponent = false;
				this.isKpiReportTrendComponent = false;
				this.isKpiCountOrgComponent = false;
				this.isDistributionByUserComponent = false;
			}
		});
	}
}

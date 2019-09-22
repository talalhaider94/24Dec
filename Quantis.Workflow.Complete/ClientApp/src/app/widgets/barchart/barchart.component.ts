import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { forkJoin } from 'rxjs';
import { DateTimeService, WidgetsHelper, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	selector: 'app-barchart',
	templateUrl: './barchart.component.html',
	styleUrls: ['./barchart.component.scss']
})
export class BarchartComponent implements OnInit {
	@Input() widgetname: string;
	@Input() url: string;
	@Input() filters: Array<any>;
	@Input() properties: Array<any>;
	// this widgetid is from widgets Collection and can be duplicate
	// it will be used for common functionality of same component instance type
	@Input() widgetid: number;
	@Input() dashboardid: number;
	@Input() id: number; // this is unique id 

	loading: boolean = true;
	barChartWidgetParameters: any;
	setWidgetFormValues: any;
	editWidgetName: boolean = true;
	@Output()
	barChartParent = new EventEmitter<any>();

	public barChartData: Array<any> = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' }
	];

	public barChartLabels: Array<any> = [];
	public barChartOptions: any = {
		responsive: true,
		legend: { position: 'bottom' },
	};
	public barChartLegend: boolean = true;
	public barChartType: string = 'bar';
	public barChartColors: Array<any> = [
		{ // grey
		  backgroundColor: 'rgba(76,175,80,0.2)',
		  borderColor: 'rgba(76,175,80,1)',
		  pointBackgroundColor: 'rgba(76,175,80,1)',
		  pointBorderColor: '#fff',
		  pointHoverBackgroundColor: '#fff',
		  pointHoverBorderColor: 'rgba(76,175,80,0.8)'
		}
	  ];
	getOrgHierarchy: any = [];

	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router,
		private widgetHelper: WidgetHelpersService
	) { }

	ngOnInit() {
		console.log('Barchart Count Trend', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
		if (this.router.url.includes('dashboard/public')) {
			this.editWidgetName = false;
		}
		if (this.url) {
			this.emitter.loadingStatus(true);
			this.getChartParametersAndData(this.url);
		}
		// coming from dashboard or public parent components
		this.subscriptionForDataChangesFromParent()
	}

	subscriptionForDataChangesFromParent() {
		this.emitter.getData().subscribe(result => {
			const { type, data } = result;
			if (type === 'barChart') {
				let currentWidgetId = data.barChartWidgetParameters.id;
				if (currentWidgetId === this.id) {
					// updating parameter form widget setValues 
					let barChartFormValues = data.barChartWidgetParameterValues;
					barChartFormValues.Filters.daterange = this.dateTime.buildRangeDate(barChartFormValues.Filters.daterange);
					this.setWidgetFormValues = barChartFormValues;
					this.updateChart(data.result.body, data, null);
				}
			}
		});
	}
	// invokes on component initialization
	getChartParametersAndData(url) {
		// these are default parameters need to update this logic
		// might have to make both API calls in sequence instead of parallel
		let myWidgetParameters = null;
		this.dashboardService.getWidgetParameters(url).pipe(
			mergeMap((getWidgetParameters: any) => {
				myWidgetParameters = getWidgetParameters;
				// Map Params for widget index when widgets initializes for first time
				let newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
				console.log('BarChart newParams', JSON.stringify(newParams));
				return this.dashboardService.getWidgetIndex(url, newParams);
			})
		).subscribe(getWidgetIndex => {
			// populate modal with widget parameters
			let barChartParams;
			if (myWidgetParameters) {
				barChartParams = {
					type: 'barChartParams',
					data: {
						...myWidgetParameters,
						widgetname: this.widgetname,
						url: this.url,
						filters: this.filters, // this.filter/properties will come from individual widget settings
						properties: this.properties,
						widgetid: this.widgetid,
						dashboardid: this.dashboardid,
						id: this.id
					}
				}
				this.barChartWidgetParameters = barChartParams.data;
				// have to use setTimeout if i am not emitting it in dashbaordComponent
				// this.barChartParent.emit(barChartParams);
				// setting initial Paramter form widget values
				console.log('Count trend Bar Chart THIS.FILTERS', this.filters);
				console.log('Count trend Bar Chart THIS.PROPERTIES', this.properties);
				this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
				console.log('BarChart this.setWidgetFormValues', this.setWidgetFormValues);
			}
			// popular chart data
			if (getWidgetIndex) {
				const chartIndexData = getWidgetIndex.body;
				// third params is current widgets settings current only used when
				// widgets loads first time. may update later for more use cases
				this.updateChart(chartIndexData, null, barChartParams.data);
			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			console.error('Barchart Count Trend', error, this.setWidgetFormValues);
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
	}

	// events
	public chartClicked(e: any): void {
		console.log("Bar Chart Clicked ->", e);
		console.log("setWidgetFormValues ->",this.setWidgetFormValues);
		//this.router.navigate(['/workflow/verifica'], {state: {data: {month:'all', year:'19', key: 'bar_chart'}}});
		let params = { month: 'all', year: '19', key: 'bar_chart' };
		window.open(`/#/workflow/verifica/?m=${params.month}&y=${params.year}&k=${params.key}`, '_blank');
	}

	public chartHovered(e: any): void {
		// console.log(e);
	}

	openModal() {
		console.log('OPEN MODAL BAR CHART PARAMS', this.barChartWidgetParameters);
		console.log('OPEN MODAL BAR CHART VALUES', this.setWidgetFormValues);
		this.barChartParent.emit({
			type: 'openBarChartModal',
			data: {
				barChartWidgetParameters: this.barChartWidgetParameters,
				setWidgetFormValues: this.setWidgetFormValues,
				isBarChartComponent: true
			}
		});
	}
	closeModal() {
		this.emitter.sendNext({ type: 'closeModal' });
	}
	// dashboardComponentData is result of data coming from 
	// posting data to parameters widget
	updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
		let label = 'Series';
		if (dashboardComponentData) {
			debugger
			let measureIndex = dashboardComponentData.barChartWidgetParameterValues.Properties.measure;
			label = dashboardComponentData.barChartWidgetParameters.measures[measureIndex];
			let charttype = dashboardComponentData.barChartWidgetParameterValues.Properties.charttype;
			setTimeout(() => {
				this.barChartType = charttype;
			});
		}
		if (currentWidgetComponentData) {
			// setting chart label and type on first load
			label = currentWidgetComponentData.measures[Object.keys(currentWidgetComponentData.measures)[0]];
			this.barChartType = Object.keys(currentWidgetComponentData.charttypes)[0];
		}
		setTimeout(() => {
			let allLabels = chartIndexData.map(label => label.xvalue);
			let allData = chartIndexData.map(data => data.yvalue);
			this.barChartData = [{ data: allData, label: label }]
			this.barChartLabels.length = 0;
			this.barChartLabels.push(...allLabels);
			this.closeModal();
		})

	}

	widgetnameChange(event) {
		console.log('widgetnameChange', this.id, event);
		this.emitter.sendNext({
			type: 'changeWidgetName',
			data: {
				widgetname: event,
				id: this.id,
				widgetid: this.widgetid
			}
		});
	}
}

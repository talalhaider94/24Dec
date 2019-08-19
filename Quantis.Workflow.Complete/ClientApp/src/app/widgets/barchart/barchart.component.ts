import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { forkJoin } from 'rxjs';
import { DateTimeService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';

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
	@Output()
	barChartParent = new EventEmitter<any>();
	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService
	) { }

	ngOnInit() {
		console.log('BarchartComponent', this.widgetname, this.url, this.id, this.widgetid ,this.filters, this.properties);
		if (this.url) {
			this.emitter.loadingStatus(true);
			// this.getWidgetParameters(this.url);
			// this.getWidgetIndex(this.url);
			this.getChartParametersAndData(this.url);
		}
		// coming from dashboard component
		this.emitter.getData().subscribe(result => {
			const { type, widgetid, data } = result;
			if (type === 'barChart') {
				let currentWidgetId = result.data.barChartWidgetParameters.id;
				if (currentWidgetId === this.id) {
					setTimeout(() => {
						this.barChartType = data.barChartWidgetParameterValues.Properties.charttype;
					});
					this.updateChart(data.result.body, data);
				}
			}
		})
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
				this.barChartData[0].label = getWidgetParameters.measures[0];
				let params = {
					GlobalFilterId: 0,
					// Properties: {
					// 	measure: Object.keys(getWidgetParameters.measures)[0],
					// 	charttype: Object.keys(getWidgetParameters.charttypes)[0],
					// 	aggregationoption: Object.keys(getWidgetParameters.aggregationoptions)[0]
					// },
					// Filters: {
					// 	daterange: this.dateTime.buildRangeDate(getWidgetParameters.defaultdaterange) 	
					// },
					Properties: this.properties,
					Filters: this.filters
				};
				return this.dashboardService.getWidgetIndex(url, params);
			})
		).subscribe(getWidgetIndex => {
			// populate modal with widget parameters
			console.log('getWidgetIndex', getWidgetIndex);
			console.log('myWidgetParameters', myWidgetParameters);
			if (myWidgetParameters) {
				this.barChartWidgetParameters = myWidgetParameters;
				this.barChartParent.emit({
					type: 'barChartParams',
					data: {
						...myWidgetParameters,
						widgetname: this.widgetname,
						url: this.url,
						filters: this.filters, // ya kahan sa aye gi.
						properties: this.properties,
						widgetid: this.widgetid,
						dashboardid: this.dashboardid,
						id: this.id
					}
				});
			}
			// popular chart data
			if (getWidgetIndex) {
				const chartIndexData = getWidgetIndex.body;
				this.updateChart(chartIndexData, null);
			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
		// let getWidgetIndex;
		// forkJoin([getWidgetParameters, getWidgetIndex]).subscribe(result => {
		// 	if (result) {
		// 		const [getWidgetParameters, getWidgetIndex] = result;
		// 		debugger
		// 		// populate modal with widget parameters
		// 		if (getWidgetParameters) {
		// 			this.barChartWidgetParameters = getWidgetParameters;
		// 			this.barChartParent.emit({
		// 				type: 'barChartParams',
		// 				data: {
		// 					...getWidgetParameters,
		// 					widgetname: this.widgetname,
		// 					url: this.url,
		// 					filters: this.filters, // ya kahan sa aye gi.
		// 					properties: this.properties,
		// 					widgetid: this.widgetid,
		// 					dashboardid: this.dashboardid,
		// 					id: this.id
		// 				}
		// 			});
		// 		}
		// 		// popular chart data
		// 		if (getWidgetIndex) {
		// 			const chartIndexData = getWidgetIndex.body;
		// 			this.updateChart(chartIndexData, null);
		// 		}

		// 	}
		// 	this.loading = false;
		// 	this.emitter.loadingStatus(false);
		// }, error => {
		// 	this.loading = false;
		// 	this.emitter.loadingStatus(false);
		// })
	}
	// getWidgetParameters(url: string) {
	// 	//  need to improve this method by keeping parameters check in case 
	// 	// of dashboard has multiple widgets of same type.
	// 	this.dashboardService.getWidgetParameters(url).subscribe(data => {
	// 		this.loading = false;
	// 		this.emitter.loadingStatus(false);
	// 		if (data) {
	// 			this.barChartWidgetParameters = data;
	// 			this.barChartParent.emit({
	// 				type: 'barChartParams',
	// 				data: {
	// 					...data,
	// 					name: this.name,
	// 					url: this.url,
	// 					filters: this.filters,
	// 					properties: this.properties,
	// 					widgetid: this.widgetid,
	// 					dashboardid: this.dashboardid,
	// 					id: this.id
	// 				}
	// 			});
	// 		}
	// 	},
	// 		error => {
	// 			this.loading = false;
	// 			this.emitter.loadingStatus(false);
	// 			console.log('BarChart getWidgetParameters', error);
	// 		});
	// }

	// getWidgetIndex(url: string) {
	// 	this.dashboardService.getWidgetIndex(url).subscribe(data => {
	// 		debugger
	// 	},
	// 		error => {
	// 			debugger
	// 		});
	// }
	// barChart
	public barChartData: Array<any> = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' }
	];

	public barChartLabels: Array<any> = [];
	public barChartOptions: any = {
		responsive: true
	};
	public barChartLegend: boolean = true;
	public barChartType: string = 'line';

	// events
	public chartClicked(e: any): void {
		// console.log(e);
	}

	public chartHovered(e: any): void {
		// console.log(e);
	}

	openModal() {
		this.barChartParent.emit({ 
			type: 'openBarChartModal',
			data: this.barChartWidgetParameters
		 });
	}
	closeModal() {
		this.barChartParent.emit({ type: 'closeModal' });
	}
	// dashboardComponentData is result of data coming from 
	// posting data to parameters widget
	updateChart(chartIndexData, dashboardComponentData) {
		// demo data
		// let a = [
		// 	{ xvalue: "6/2019", yvalue: 10 },
		// 	{ xvalue: "7/2019", yvalue: 20 },
		// 	{ xvalue: "8/2019", yvalue: 30 },
		// 	{ xvalue: "9/2019", yvalue: 40 },
		// 	{ xvalue: "10/2019", yvalue: 50 },
		// 	{ xvalue: "11/2019", yvalue: 60 },
		// 	{ xvalue: "12/2019", yvalue: 70 },
		// ];
		debugger
		let label = 'Series';
		if (dashboardComponentData) {
			let measureIndex = dashboardComponentData.barChartWidgetParameterValues.Properties.measure;
			label = dashboardComponentData.barChartWidgetParameters.measures[measureIndex];
		}
		let allLabels = chartIndexData.map(label => label.xvalue);
		let allData = chartIndexData.map(data => data.yvalue);
		this.barChartData = [{ data: allData, label: label }]
		this.barChartLabels.length = 0;
		this.barChartLabels.push(...allLabels);
		this.closeModal();
	}

}

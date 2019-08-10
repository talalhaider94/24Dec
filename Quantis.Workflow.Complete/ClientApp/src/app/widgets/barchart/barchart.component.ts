import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { forkJoin } from 'rxjs';

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
	@Input() widgetid: number;
	@Input() dashboardid: number;
	@Input() id: number;

	loading: boolean = true;
	barChartWidgetParameters: any;
	@Output()
	barChartParent = new EventEmitter<any>();
	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService
	) { }

	ngOnInit() {
		console.log('BarchartComponent', this.widgetname, this.url);
		if (this.url) {
			this.emitter.loadingStatus(true);
			// this.getWidgetParameters(this.url);
			// this.getWidgetIndex(this.url);
			this.getChartParametersAndData(this.url);
		}
		this.emitter.getData().subscribe(result => {
			const { type, widgetid, data } = result;
			if (type === 'barChart') {
				if (widgetid === this.widgetid) {
					setTimeout(() => {
						this.barChartType = data.barChartWidgetParameterValues.Properties.charttype;
					});
					this.updateChart(data.result.body);
				}
			}
		})
	}

	getChartParametersAndData(url) {
		// these are default parameters need to update this logic
		// might have to make both API calls in sequence instead of parallel
		let params = {
			GlobalFilterId: 0, Properties: { measure: 1, aggregationoption: 'Period', charttype: 'Bar' },
			Filters: { daterange: '03/19:06/19' }
		}
		let getWidgetIndex = this.dashboardService.getWidgetIndex(url, params);
		let getWidgetParameters = this.dashboardService.getWidgetParameters(url);
		forkJoin([getWidgetParameters, getWidgetIndex]).subscribe(result => {
			if (result) {
				const [getWidgetParameters, getWidgetIndex] = result;
				// populate modal with widget parameters
				if (getWidgetParameters) {
					this.barChartWidgetParameters = getWidgetParameters;
					this.barChartParent.emit({
						type: 'barChartParams',
						data: {
							...getWidgetParameters,
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
					this.updateChart(chartIndexData);
				}

			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			this.loading = false;
			this.emitter.loadingStatus(false);
		})
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

	public randomize(): void {
		let _barChartData: Array<any> = new Array(this.barChartData.length);
		for (let i = 0; i < this.barChartData.length; i++) {
			_barChartData[i] = { data: new Array(this.barChartData[i].data.length), label: this.barChartData[i].label };
			for (let j = 0; j < this.barChartData[i].data.length; j++) {
				_barChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
			}
		}
		this.barChartData = _barChartData;
	}

	// events
	public chartClicked(e: any): void {
		console.log(e);
	}

	public chartHovered(e: any): void {
		console.log(e);
	}

	openModal() {
		this.barChartParent.emit({ type: 'openModal' });
	}
	closeModal() {
		this.barChartParent.emit({ type: 'closeModal' });
	}

	updateChart(chartIndexData) {
		let a = [
			{ xvalue: "6/2019", yvalue: 10 },
			{ xvalue: "7/2019", yvalue: 20 },
			{ xvalue: "8/2019", yvalue: 30 },
			{ xvalue: "9/2019", yvalue: 40 },
			{ xvalue: "10/2019", yvalue: 50 },
			{ xvalue: "11/2019", yvalue: 60 },
			{ xvalue: "12/2019", yvalue: 70 },
		];
		let allLabels = a.map(label => label.xvalue);
		let allData = a.map(data => data.yvalue);
		this.barChartData = [{ data: allData, label: 'Series' }]
		this.barChartLabels.length = 0;
		this.barChartLabels.push(...allLabels);
		this.closeModal();
	}

}

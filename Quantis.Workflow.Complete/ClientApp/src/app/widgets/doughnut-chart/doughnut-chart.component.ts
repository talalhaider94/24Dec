import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetsHelper } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	selector: 'app-doughnut-chart',
	templateUrl: './doughnut-chart.component.html',
	styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {
	@Input() widgetname: string;
	@Input() url: string;
	@Input() filters: Array<any>;
	@Input() properties: Array<any>;
	@Input() widgetid: number;
	@Input() dashboardid: number;
	@Input() id: number; // this is unique id 

	loading: boolean = true;
	verificaDoughnutChartWidgetParameters: any;
	setWidgetFormValues: any;
	editWidgetName: boolean = true;
	@Output()
	verificaDoughnutParent = new EventEmitter<any>();

	public doughnutChartLabels: string[] = [
		"Download Sales",
		"In-Store Sales",
		"Mail-Order Sales"
	];
	public doughnutChartData: number[] = [350, 450, 100];
	public doughnutChartType: string = "doughnut";
	public barChartOptions: any = {
		responsive: true,
		legend: { position: 'bottom' },
	};
	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router
	) { }

	ngOnInit() {
		console.log('DoughnutChartComponent Distribution by Verifica', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
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
			if (type === 'verificaDoughnutChart') {
				let currentWidgetId = data.verificaDoughnutWidgetParameters.id;
				if (currentWidgetId === this.id) {
					// updating parameter form widget setValues 
					let verificaDoughnutFormValues = data.verificaDoughnutWidgetParameterValues;
					verificaDoughnutFormValues.Filters.daterange = this.dateTime.buildRangeDate(verificaDoughnutFormValues.Filters.daterange);
					this.setWidgetFormValues = verificaDoughnutFormValues;
					this.updateChart(data.result.body, data, null);
				}
			}
		});
	}
	getChartParametersAndData(url) {
		// these are default parameters need to update this logic
		// might have to make both API calls in sequence instead of parallel
		let myWidgetParameters = null;
		this.dashboardService.getWidgetParameters(url).pipe(
			mergeMap((getWidgetParameters: any) => {
				myWidgetParameters = getWidgetParameters;
				// Map Params for widget index when widgets initializes for first time
				let newParams = WidgetsHelper.initWidgetParameters(myWidgetParameters, this.filters, this.properties);
				/// To be used -> getWidgetIndex method ////
				return this.dashboardService.getWidgetIndex(url, newParams);
			})
		).subscribe(getWidgetIndex => {
			// populate modal with widget parameters
			console.log('getWidgetIndex', getWidgetIndex);
			console.log('myWidgetParameters', myWidgetParameters);
			let verificaDoughnutChartParams;
			if (myWidgetParameters) {
				verificaDoughnutChartParams = {
					type: 'verificaDoughnutChartParams',
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
				this.verificaDoughnutChartWidgetParameters = verificaDoughnutChartParams.data;
				// setting initial Paramter form widget values
				this.setWidgetFormValues = WidgetsHelper.initWidgetParameters(myWidgetParameters, this.filters, this.properties);
			}
			// popular chart data
			if (getWidgetIndex) {
				const chartIndexData = getWidgetIndex.body;
				// third params is current widgets settings current only used when
				// widgets loads first time. may update later for more use cases
				this.updateChart(chartIndexData, null, verificaDoughnutChartParams.data);
			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
	}

	openModal() {
		console.log('OPEN MODAL BAR CHART PARAMS', this.verificaDoughnutChartWidgetParameters);
		console.log('OPEN MODAL BAR CHART VALUES', this.setWidgetFormValues);
		this.verificaDoughnutParent.emit({
			type: 'openVerificaDoughnutChartModal',
			data: {
				verificaDoughnutChartWidgetParameters: this.verificaDoughnutChartWidgetParameters,
				setWidgetFormValues: this.setWidgetFormValues,
				isverificaDoughnutComponent: true
			}
		});
	}
	closeModal() {
		this.emitter.sendNext({ type: 'closeModal' });
	}
	// dashboardComponentData is result of data coming from 
	// posting data to parameters widget
	updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
		let allLabels = chartIndexData.map(label => label.xvalue);
		let allData = chartIndexData.map(data => data.yvalue);
		this.doughnutChartData.length = 0;
		this.doughnutChartData.push(...allData);
		this.doughnutChartLabels.length = 0;
		this.doughnutChartLabels = allLabels;
		this.closeModal();
	}

	widgetnameChange(event) {
		console.log('widgetnameChange', this.id, event);
		this.verificaDoughnutParent.emit({
			type: 'changeVerificaDoughnutChartWidgetName',
			data: {
				verificaDoughnutChart: {
					widgetname: event,
					id: this.id,
					widgetid: this.widgetid
				}
			}
		});
	}
	// events
	// public chartClicked(e: any): void {
	// 	console.log('Chart Clicked ->', e.active[0]._index);
	// 	let params = { month: '09', year: '19', key: 'donut_chart' };
	// 	window.open(`/#/workflow/verifica/?m=${params.month}&y=${params.year}&k=${params.key}`, '_blank');
	// }

	public chartClicked(e: any): void {
		if (e.active.length > 0) {
		  const chart = e.active[0]._chart;
		  const activePoints = chart.getElementAtEvent(e.event);
		  if ( activePoints.length > 0) {
			// get the internal index of slice in pie chart
			const clickedElementIndex = activePoints[0]._index;
			const label = chart.data.labels[clickedElementIndex];
			// get value by index
			const value = chart.data.datasets[0].data[clickedElementIndex];
			console.log('Chart Clicked ->',clickedElementIndex, label, value);
			window.open(`/#/dashboard/chartdata/?id=${clickedElementIndex}&value=${value}`, '_blank');
		  }
		}
	  }

	public chartHovered(e: any): void {
		console.log('Chart Hovered ->', e);
	}

}

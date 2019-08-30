import { Component, OnInit, Input } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService } from '../../_helpers';
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

	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router
	) { }

	ngOnInit() {
		console.log('DOUGHNUT CHART COMPONENT')
	}

	// getChartParametersAndData(url) {
	// 	// these are default parameters need to update this logic
	// 	// might have to make both API calls in sequence instead of parallel
	// 	let myWidgetParameters = null;
	// 	this.dashboardService.getWidgetParameters(url).pipe(
	// 		mergeMap((getWidgetParameters: any) => {
	// 			myWidgetParameters = getWidgetParameters;
	// 			// Map Params for widget index when widgets initializes for first time
	// 			let params = {
	// 				GlobalFilterId: 0,
	// 				Properties: {
	// 					measure: Object.keys(getWidgetParameters.measures)[0],
	// 					charttype: Object.keys(getWidgetParameters.charttypes)[0],
	// 					aggregationoption: Object.keys(getWidgetParameters.aggregationoptions)[0]
	// 				},
	// 				Filters: {
	// 					daterange: getWidgetParameters.defaultdaterange
	// 				},
	// 				Note: ''
	// 			};
	// 			/// To be used -> getWidgetIndex method ////
	// 			return this.dashboardService.getWidgetIndex(url, params);
	// 		})
	// 	).subscribe(getWidgetIndex => {
	// 		// populate modal with widget parameters
	// 		console.log('getWidgetIndex', getWidgetIndex);
	// 		console.log('myWidgetParameters', myWidgetParameters);
	// 		let barChartParams;
	// 		if (myWidgetParameters) {
	// 			barChartParams = {
	// 				type: 'barChartParams',
	// 				data: {
	// 					...myWidgetParameters,
	// 					widgetname: this.widgetname,
	// 					url: this.url,
	// 					filters: this.filters, // this.filter/properties will come from individual widget settings
	// 					properties: this.properties,
	// 					widgetid: this.widgetid,
	// 					dashboardid: this.dashboardid,
	// 					id: this.id
	// 				}
	// 			}
	// 			this.barChartWidgetParameters = barChartParams.data;
	// 			this.setWidgetFormValues = {
	// 				GlobalFilterId: 0,
	// 				Properties: {
	// 					measure: Object.keys(this.barChartWidgetParameters.measures)[0],
	// 					charttype: Object.keys(this.barChartWidgetParameters.charttypes)[0],
	// 					aggregationoption: Object.keys(this.barChartWidgetParameters.aggregationoptions)[0]
	// 				},
	// 				Filters: {
	// 					daterange: this.dateTime.buildRangeDate(this.barChartWidgetParameters.defaultdaterange),
	// 					dateTypes: barChartParams.data.datetypes[0]
	// 				},
	// 				Note: ''
	// 			}
	// 		}
	// 		// popular chart data
	// 		if (getWidgetIndex) {
	// 			const chartIndexData = getWidgetIndex.body;
	// 			// third params is current widgets settings current only used when
	// 			// widgets loads first time. may update later for more use cases
	// 			this.updateChart(chartIndexData, null, barChartParams.data);
	// 		}
	// 		this.loading = false;
	// 		this.emitter.loadingStatus(false);
	// 	}, error => {
	// 		this.loading = false;
	// 		this.emitter.loadingStatus(false);
	// 	});
	// }

	public doughnutChartLabels: string[] = [
		"Download Sales",
		"In-Store Sales",
		"Mail-Order Sales"
	];
	public doughnutChartData: number[] = [350, 450, 100];
	public doughnutChartType: string = "doughnut";

	// events
	public chartClicked(e: any): void {
		console.log('Chart Clicked ->',e);
		//this.router.navigate(['/workflow/verifica'], {state: {data: {month:'07', year:'19', key: 'donut_chart'}}});
		let params = {month:'09', year:'19', key: 'donut_chart'};
		window.open(`/#/workflow/verifica/?m=${params.month}&y=${params.year}&k=${params.key}`, '_blank');
	}

	public chartHovered(e: any): void {
		console.log('Chart Hovered ->',e);
	}

}

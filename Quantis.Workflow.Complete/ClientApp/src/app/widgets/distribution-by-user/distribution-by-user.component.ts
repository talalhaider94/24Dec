import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { forkJoin } from 'rxjs';
import { DateTimeService, WidgetsHelper } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-distribution-by-user',
  templateUrl: './distribution-by-user.component.html',
  styleUrls: ['./distribution-by-user.component.scss']
})
export class DistributionByUserComponent implements OnInit {
	@Input() widgetname: string;
	@Input() url: string;
	@Input() filters: Array<any>;
	@Input() properties: Array<any>;
	@Input() widgetid: number;
	@Input() dashboardid: number;
	@Input() id: number; 

	loading: boolean = true;
	distributionByUserWidgetParameters: any;
	setWidgetFormValues: any;
	editWidgetName: boolean = true;
	@Output()
	distributionByUserParent = new EventEmitter<any>();

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

	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router
	) { }

	ngOnInit() {
		console.log('Distribution By User', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
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
	// DANIAL: TODO NEED TO UPDATE
	subscriptionForDataChangesFromParent() {
		this.emitter.getData().subscribe(result => {
			const { type, data } = result;
			if (type === 'distributionByUserChart') {
				let currentWidgetId = data.distributionByUserWidgetParameters.id;
				if (currentWidgetId === this.id) {
					// updating parameter form widget setValues 
					let distributionByUserFormValues = data.distributionByUserWidgetParameterValues;
					distributionByUserFormValues.Filters.daterange = this.dateTime.buildRangeDate(distributionByUserFormValues.Filters.daterange);
					this.setWidgetFormValues = distributionByUserFormValues;
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
				let newParams = WidgetsHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
				return this.dashboardService.getWidgetIndex(url, newParams);
			})
		).subscribe(getWidgetIndex => {
			// populate modal with widget parameters
			console.log('getWidgetIndex', getWidgetIndex);
			console.log('myWidgetParameters', myWidgetParameters);
			debugger
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
				this.distributionByUserWidgetParameters = barChartParams.data;
				// setting initial Paramter form widget values
				this.setWidgetFormValues = WidgetsHelper.initWidgetParameters(myWidgetParameters, this.filters, this.properties);
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
			console.error('Distribution By User', error);
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
	}

	// events
	public chartClicked(e: any): void {
		console.log("Bar Chart Clicked ->", e);
		//this.router.navigate(['/workflow/verifica'], {state: {data: {month:'all', year:'19', key: 'bar_chart'}}});
		let params = { month: 'all', year: '19', key: 'bar_chart' };
		window.open(`/#/workflow/verifica/?m=${params.month}&y=${params.year}&k=${params.key}`, '_blank');
	}

	public chartHovered(e: any): void {
	}

	openModal() {
		this.distributionByUserParent.emit({
			type: 'openDistributionByUserModal',
			data: {
				distributionByUserWidgetParameters: this.distributionByUserWidgetParameters,
				setWidgetFormValues: this.setWidgetFormValues,
				isDistributionByUserComponent: true
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
			let measureIndex = dashboardComponentData.distributionByUserWidgetParameterValues.Properties.measure;
			label = dashboardComponentData.distributionByUserWidgetParameters.measures[measureIndex];
			let charttype = dashboardComponentData.distributionByUserWidgetParameterValues.Properties.charttype;
			setTimeout(() => {
				this.barChartType = charttype;
			});
		}
		if (currentWidgetComponentData) {
			// setting chart label and type on first load
			debugger
			label = currentWidgetComponentData.measures[Object.keys(currentWidgetComponentData.measures)[0]];
			this.barChartType = Object.keys(currentWidgetComponentData.charttypes)[0];
		}
		let allLabels = chartIndexData.map(label => label.xvalue);
		let allData = chartIndexData.map(data => data.yvalue);
		this.barChartData = [{ data: allData, label: label }]
		this.barChartLabels.length = 0;
		this.barChartLabels.push(...allLabels);
		this.closeModal();
	}

	widgetnameChange(event) {
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

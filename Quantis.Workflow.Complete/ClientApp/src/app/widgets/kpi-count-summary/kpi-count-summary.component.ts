import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { DateTimeService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DashboardService, EmitterService } from '../../_services';

@Component({
	selector: 'app-kpi-count-summary',
	templateUrl: './kpi-count-summary.component.html',
	styleUrls: ['./kpi-count-summary.component.scss']
})
export class KpiCountSummaryComponent implements OnInit {
	// barChart1
	public barChart1Data: Array<any> = [
		{
			data: [78, 81, 80, 45, 34, 12, 40, 78, 81, 80, 45, 34, 12, 40, 12, 40],
			label: 'Series A'
		}
	];
	public barChart1Labels: Array<any> = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
	public barChart1Options: any = {
		tooltips: {
			enabled: false,
			custom: CustomTooltips
		},
		maintainAspectRatio: false,
		scales: {
			xAxes: [{
				display: false,
				barPercentage: 0.6,
			}],
			yAxes: [{
				display: false
			}]
		},
		legend: {
			display: false
		}
	};
	public barChart1Colours: Array<any> = [
		{
			backgroundColor: 'rgba(255,255,255,.3)',
			borderWidth: 0
		}
	];
	public barChart1Legend = false;
	public barChart1Type = 'bar';
	// INPUT,OUTPUT PARAMS START
	@Input() widgetname: string;
	@Input() url: string;
	@Input() filters: Array<any>;
	@Input() properties: Array<any>;
	@Input() widgetid: number;
	@Input() dashboardid: number;
	@Input() id: number;
	loading: boolean = true;
	kpiCountSummaryWidgetParameters: any;
	setWidgetFormValues: any;
	editWidgetName: boolean = true;
	sumKPICount: number = 0;
	widgetTitle: string = 'KPI Count Summary';
	@Output() kpiCountSummaryParent = new EventEmitter<any>();
	// INPUT, OUTPUT PARAMS END 
	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router
	) { }

	ngOnInit() {
		if (this.router.url.includes('dashboard/public')) {
			this.editWidgetName = false;
		}
		console.log('KpiCountSummaryComponent', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
		if (this.url) {
			this.emitter.loadingStatus(true);
			this.getChartParametersAndData(this.url);
		}
		// coming from dashboard component
		this.emitter.getData().subscribe(result => {
			const { type, data } = result;
			if (type === 'kpiCountSummaryChart') {
				let currentWidgetId = data.kpiCountSummaryWidgetParameters.id;
				if (currentWidgetId === this.id) {
					// updating parameter form widget setValues 
					let kpiCountSummaryFormValues = data.kpiCountSummaryWidgetParameterValues;
					kpiCountSummaryFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiCountSummaryFormValues.Filters.daterange);
					this.setWidgetFormValues = kpiCountSummaryFormValues;
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
				let params = {
					GlobalFilterId: 0,
					Properties: {
						measure: Object.keys(getWidgetParameters.measures)[0],
						charttype: Object.keys(getWidgetParameters.charttypes)[0],
						aggregationoption: Object.keys(getWidgetParameters.aggregationoptions)[0]
					},
					Filters: {
						daterange: getWidgetParameters.defaultdaterange
					},
					Note: ''
				};
				/// To be used -> getWidgetIndex method ////
				return this.dashboardService.getWidgetIndex(url, params);
			})
		).subscribe(getWidgetIndex => {
			// populate modal with widget parameters
			console.log('KPI COUNT SUMMARY getWidgetIndex', getWidgetIndex);
			console.log('KPI COUNT SUMMARY myWidgetParameters', myWidgetParameters);

			let kpiCountSummaryParams;
			if (myWidgetParameters) {
				kpiCountSummaryParams = {
					type: 'kpiCountSummaryParams',
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
				this.kpiCountSummaryWidgetParameters = kpiCountSummaryParams.data;
				// setting initial Paramter form widget values
				this.setWidgetFormValues = {
					GlobalFilterId: 0,
					Properties: {
						measure: Object.keys(this.kpiCountSummaryWidgetParameters.measures)[0],
						charttype: Object.keys(this.kpiCountSummaryWidgetParameters.charttypes)[0],
						aggregationoption: Object.keys(this.kpiCountSummaryWidgetParameters.aggregationoptions)[0]
					},
					Filters: {
						daterange: this.dateTime.buildRangeDate(this.kpiCountSummaryWidgetParameters.defaultdaterange),
						dateTypes: kpiCountSummaryParams.data.datetypes[0]
					},
					Note: ''
				}
			}
			// popular chart data
			if (getWidgetIndex) {
				const chartIndexData = getWidgetIndex.body;
				// third params is current widgets settings current only used when
				// widgets loads first time. may update later for more use cases
				this.updateChart(chartIndexData, null, kpiCountSummaryParams.data);
			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
	}

	updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
		let label = 'Series';
		if (dashboardComponentData) {
			let measureIndex = dashboardComponentData.barChartWidgetParameterValues.Properties.measure;
			label = dashboardComponentData.barChartWidgetParameters.measures[measureIndex];
			let charttype = dashboardComponentData.barChartWidgetParameterValues.Properties.charttype;
		}
		if (currentWidgetComponentData) {
			// setting chart label and type on first load
			label = currentWidgetComponentData.measures[0];
		}
		// temporary fix because getting single object instead of array
		let temporaryFix = [chartIndexData];
		let allLabels = temporaryFix.map(label => label.xvalue);
		let allData = temporaryFix.map(data => data.yvalue);
		// setTimeout(()=> {
		this.sumKPICount = allData.reduce((total, currentValue) => total + currentValue, 0);
		// })

		this.barChart1Data = [{ data: allData, label: label }]
		this.barChart1Labels.length = 0;
		this.barChart1Labels.push(...allLabels);
		this.closeModal();
	}

	widgetnameChange(event) {
		console.log('widgetnameChange', this.id, event);
		this.kpiCountSummaryParent.emit({
			type: 'changeKpiCountSummaryWidgetName',
			data: {
				kpiCountSummaryChart: {
					widgetname: event,
					id: this.id,
					widgetid: this.widgetid
				}
			}
		});
	}

	openModal() {
		console.log('OPEN MODAL KPI SUMMARY COUNT PARAMS', this.kpiCountSummaryWidgetParameters);
		console.log('OPEN MODAL KPI SUMMARY COUNT VALUES', this.setWidgetFormValues);
		this.kpiCountSummaryParent.emit({
			type: 'openKpiSummaryCountModal',
			data: {
				kpiCountSummaryWidgetParameters: this.kpiCountSummaryWidgetParameters,
				setWidgetFormValues: this.setWidgetFormValues,
				isKpiCountSummaryComponent: true
			}
		});
	}

	closeModal() {
		this.emitter.sendNext({ type: 'closeModal' });
	}

}

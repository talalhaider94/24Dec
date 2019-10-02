import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DashboardService, EmitterService } from '../../_services';

@Component({
  selector: 'app-catalog-pending-count-trends',
  templateUrl: './catalog-pending-count-trends.component.html',
  styleUrls: ['./catalog-pending-count-trends.component.scss']
})
export class CatalogPendingCountTrendsComponent implements OnInit {
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
	catalogPendingWidgetParameters: any;
	setWidgetFormValues: any;
	editWidgetName: boolean = true;
	sumKPICount: number = 0;
	widgetTitle: string = 'Catalog Pending Count Trends';
	@Output() catalogPendingParent = new EventEmitter<any>();
	// INPUT, OUTPUT PARAMS END 
	constructor(
		private dashboardService: DashboardService,
		private emitter: EmitterService,
		private dateTime: DateTimeService,
		private router: Router,
		private widgetHelper: WidgetHelpersService
	) { }

	ngOnInit() {
		if (this.router.url.includes('dashboard/public')) {
			this.editWidgetName = false;
		}
		console.log('CatalogPendingCountTrendsComponent', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
		if (this.url) {
			this.emitter.loadingStatus(true);
			this.getChartParametersAndData(this.url);
		}
		// coming from dashboard component
		this.subscriptionForDataChangesFromParent();
	}

	subscriptionForDataChangesFromParent() {
		this.emitter.getData().subscribe(result => {
			const { type, data } = result;
			if (type === 'catalogPendingChart') {
				let currentWidgetId = data.catalogPendingWidgetParameters.id;
				if (currentWidgetId === this.id) {
					// updating parameter form widget setValues 
					let catalogPendingFormValues = data.catalogPendingWidgetParameterValues;
					if(catalogPendingFormValues.Filters.daterange) {
						catalogPendingFormValues.Filters.daterange = this.dateTime.buildRangeDate(catalogPendingFormValues.Filters.daterange);
					}
					this.setWidgetFormValues = catalogPendingFormValues;
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
				console.log('CatalogPendingCountTrends Filters', this.filters);
				console.log('CatalogPendingCountTrends Properties', this.properties);
				// Map Params for widget index when widgets initializes for first time
				let newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
				return this.dashboardService.getWidgetIndex(url, newParams);
			})
		).subscribe(getWidgetIndex => {
			// debugger
			// populate modal with widget parameters
			console.log('CatalogPendingCountTrendsComponent getWidgetIndex', getWidgetIndex);
			console.log('CatalogPendingCountTrendsComponent myWidgetParameters', myWidgetParameters);

			let catalogPendingParams;
			if (myWidgetParameters) {
				catalogPendingParams = {
					type: 'catalogPendingParams',
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
				this.catalogPendingWidgetParameters = catalogPendingParams.data;
				// setting initial Paramter form widget values
				this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
			}
			// popular chart data
			if (getWidgetIndex) {
				const chartIndexData = getWidgetIndex.body;
				// third params is current widgets settings current only used when
				// widgets loads first time. may update later for more use cases
				this.updateChart(chartIndexData, null, catalogPendingParams.data);
			}
			this.loading = false;
			this.emitter.loadingStatus(false);
		}, error => {
			this.loading = false;
			this.emitter.loadingStatus(false);
		});
	}

	updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
		this.sumKPICount = chartIndexData.yvalue;
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

	openModal() {
		this.catalogPendingParent.emit({
			type: 'openCatalogPendingModal',
			data: {
				catalogPendingWidgetParameters: this.catalogPendingWidgetParameters,
				setWidgetFormValues: this.setWidgetFormValues,
				isCatalogPendingComponent: true
			}
		});
	}

	closeModal() {
		this.emitter.sendNext({ type: 'closeModal' });
	}

}

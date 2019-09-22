import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { forkJoin } from 'rxjs';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-kpi-report-trend',
  templateUrl: './kpi-report-trend.component.html',
  styleUrls: ['./kpi-report-trend.component.scss']
})
export class KpiReportTrendComponent implements OnInit {
  @Input() widgetname: string;
  @Input() url: string;
  @Input() filters: any;
  @Input() properties: any;
  // this widgetid is from widgets Collection and can be duplicate
  // it will be used for common functionality of same component instance type
  @Input() widgetid: number;
  @Input() dashboardid: number;
  @Input() id: number; // this is unique id 

  loading: boolean = true;
  kpiReportTrendWidgetParameters: any;
  setWidgetFormValues: any;
  editWidgetName: boolean = true;
  @Output()
  kpiReportTrendParent = new EventEmitter<any>();

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
  public kpiReportColors: Array<any> = [
    { // grey
      backgroundColor: 'rgba(76,175,80,0.2)',
      borderColor: 'rgba(76,175,80,1)',
      pointBackgroundColor: 'rgba(76,175,80,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(76,175,80,0.8)'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private emitter: EmitterService,
    private dateTime: DateTimeService,
    private router: Router,
    private widgetHelper: WidgetHelpersService
  ) { }

  ngOnInit() {
    console.log('KpiReportTrendComponent', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
    if (this.router.url.includes('dashboard/public')) {
      this.editWidgetName = false;
    }
    if (this.url) {
      this.emitter.loadingStatus(true);
      this.dashboardService.getContractParties().subscribe(result => {
        this.getChartParametersAndData(this.url, result);
      }, error => {
        console.error('getContractParties', error);
      })

    }
    // coming from dashboard or public parent components
    this.subscriptionForDataChangesFromParent()
  }

  subscriptionForDataChangesFromParent() {
    this.emitter.getData().subscribe(result => {
      const { type, data } = result;
      if (type === 'kpiReportTrendChart') {
        let currentWidgetId = data.kpiReportTrendWidgetParameters.id;
        if (currentWidgetId === this.id) {
          // updating parameter form widget setValues 
          let kpiReportTrendFormValues = data.kpiReportTrendWidgetParameterValues;
          kpiReportTrendFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiReportTrendFormValues.Filters.daterange);
          this.setWidgetFormValues = kpiReportTrendFormValues;
          this.updateChart(data.result.body, data, null);
        }
      }
    });
  }

  // invokes on component initialization
  getChartParametersAndData(url, getContractParties) {
    // these are default parameters need to update this logic
    // might have to make both API calls in sequence instead of parallel
    let myWidgetParameters = null;
    this.dashboardService.getWidgetParameters(url).pipe(
      mergeMap((getWidgetParameters: any) => {
        myWidgetParameters = getWidgetParameters;
        // Map Params for widget index when widgets initializes for first time
        let newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
        return this.dashboardService.getWidgetIndex(url, newParams);
      })
    ).subscribe(getWidgetIndex => {
      // populate modal with widget parameters
      console.log('getWidgetIndex', getWidgetIndex);
      console.log('myWidgetParameters', myWidgetParameters);
      let kpiReportTrendParams;
      if (myWidgetParameters) {
        if (Object.keys(this.filters).length > 0) {
        } else {
          this.filters.contractParties = getContractParties;
        }
        kpiReportTrendParams = {
          type: 'kpiReportTrendParams',
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
        this.kpiReportTrendWidgetParameters = kpiReportTrendParams.data;
        // setting initial Paramter form widget values
        this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
      }
      // popular chart data
      if (getWidgetIndex) {
        const chartIndexData = getWidgetIndex.body;
        // third params is current widgets settings current only used when
        // widgets loads first time. may update later for more use cases
        this.updateChart(chartIndexData, null, kpiReportTrendParams.data);
      }
      this.loading = false;
      this.emitter.loadingStatus(false);
    }, error => {
      this.loading = false;
      this.emitter.loadingStatus(false);
    });
  }

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  openModal() {
    console.log('OPEN MODAL BAR CHART PARAMS', this.kpiReportTrendWidgetParameters);
    console.log('OPEN MODAL BAR CHART VALUES', this.setWidgetFormValues);
    this.kpiReportTrendParent.emit({
      type: 'openKpiReportTrendModal',
      data: {
        kpiReportTrendWidgetParameters: this.kpiReportTrendWidgetParameters,
        setWidgetFormValues: this.setWidgetFormValues,
        isKpiReportTrendComponent: true
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
      let measureIndex = dashboardComponentData.kpiReportTrendWidgetParameterValues.Properties.measure;
      label = dashboardComponentData.kpiReportTrendWidgetParameters.measures[measureIndex];
      let charttype = dashboardComponentData.kpiReportTrendWidgetParameterValues.Properties.charttype;
      setTimeout(() => {
        this.barChartType = charttype;
      });
    }
    if (currentWidgetComponentData) {
      // setting chart label and type on first load
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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ChartOptions, ChartDataSets } from 'chart.js';

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
  @Input() widgetid: number;
  @Input() dashboardid: number;
  @Input() id: number;
  loading: boolean = true;
  kpiReportTrendWidgetParameters: any;
  setWidgetFormValues: any;
  editWidgetName: boolean = true;
  @Output()
  kpiReportTrendParent = new EventEmitter<any>();

  public kpiReportTrendData: ChartDataSets[] = [
    { data: [99, 100, 99, 100, 99, 100, 99, 100, 99, 100], label: 'Compliant' },
    { data: [65, 59, 80], label: 'Non Compliant' },
  ];

  public kpiReportTrendLabels: Array<any> = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public kpiReportTrendOptions: ChartOptions = {
    responsive: true,
    legend: { position: 'bottom' },
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
  };
  public barChartLegend: boolean = true;
  public kpiReportTrendChartType: string = 'bar';
  public kpiReportColors: Array<any> = [
    {
      backgroundColor: 'rgba(76,175,80,1)',
      borderColor: 'rgba(76,175,80,1)',
      pointBackgroundColor: 'rgba(76,175,80,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(76,175,80,0.8)'
    },
    {
      backgroundColor: 'rgba(244,67,54,1)',
      borderColor: 'rgba(244,67,54,1)',
      pointBackgroundColor: 'rgba(244,67,54,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(244,67,54,0.8)'
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
          if (!this.editWidgetName) {
            myWidgetParameters.contractParties = getContractParties;
          }
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
            id: this.id,
            allContractParties: getContractParties
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
    if (dashboardComponentData) {
      let charttype = dashboardComponentData.kpiReportTrendWidgetParameterValues.Properties.charttype;
      setTimeout(() => {
        this.kpiReportTrendChartType = charttype;
      });
    }
    if (currentWidgetComponentData) {
      this.kpiReportTrendChartType = Object.keys(currentWidgetComponentData.charttypes)[0];
    }
    if (chartIndexData.length) {
      let compliantData = chartIndexData.filter(data => data.description === 'compliant');
      let nonCompliantData = chartIndexData.filter(data => data.description === 'noncompliant');
      let allChartLabels = chartIndexData.map(label => label.xvalue);

      let allCompliantData = compliantData.map(data => data.yvalue);
      let allNonCompliantData = nonCompliantData.map(data => data.yvalue);
      
      setTimeout(() => {
        this.kpiReportTrendLabels.length = 0;
        this.kpiReportTrendLabels = allChartLabels;
      }, 0);

      this.kpiReportTrendData = [
        { data: allCompliantData, label: 'Compliant' },
        { data: allNonCompliantData, label: 'Non Compliant' },
      ];
      // this.kpiReportTrendLabels = this.kpiReportTrendLabels.slice();
      // this.kpiReportTrendData = this.kpiReportTrendData.slice();
    } else {
      this.kpiReportTrendLabels.length = 0;
      this.kpiReportTrendLabels = [];
      this.kpiReportTrendData = [
        { data: [], label: 'No Data in Compliant' },
        { data: [], label: 'No Data in Non-Compliant' },
      ];
    }
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

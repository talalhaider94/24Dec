import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ChartOptions, ChartDataSets } from 'chart.js';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
HC_exporting(Highcharts);

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
  loading: boolean = false;
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
  public kpiReportTrendLegend: boolean = true;
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
  highcharts = Highcharts;
  chartOptions = {
    credits: false,
    title: {
      text: this.widgetname
    },
    xAxis: {
      type: 'date',
      categories: ['10/18', '11/18', '12/18', '01/19', '02/19']
    },
    series: [
      {
        type: 'column',
        name: 'Compliant',
        data: [3, 2, 1, 3, 4]
      },
      // {
      //   type: 'column',
      //   name: 'Non Compliant',
      //   data: [2, 3, 5, 7, 6]
      // },
      {
        type: 'scatter',
        name: 'Target', // target
        data: [3, 2.67, 3, 6.33, 3.33],
        marker: {
          // lineWidth: 0,
          // lineColor: Highcharts.getOptions().colors[3],
          fillColor: 'orange'
        }
      }
    ],
    exporting: {
      enabled: true
    },
  };
  chartUpdateFlag: boolean = false;
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
      if (this.url) {
        this.emitter.loadingStatus(true);
        this.loading = true;
        this.dashboardService.getContractParties().subscribe(result => {
          this.getChartParametersAndData(this.url, result);
        }, error => {
          console.error('getContractParties', error);
        })

      }
      // coming from dashboard or public parent components
      this.subscriptionForDataChangesFromParent();
    }
    window.dispatchEvent(new Event('resize'));
  }
  ngAfterViewInit() {
  }

  subscriptionForDataChangesFromParent() {
    this.emitter.getData().subscribe(result => {
      const { type, data } = result;
      if (type === 'kpiReportTrendChart') {
        let currentWidgetId = data.kpiReportTrendWidgetParameters.id;
        if (currentWidgetId === this.id) {
          // updating parameter form widget setValues 
          let kpiReportTrendFormValues = data.kpiReportTrendWidgetParameterValues;
          if (kpiReportTrendFormValues.Filters.daterange) {
            kpiReportTrendFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiReportTrendFormValues.Filters.daterange);
          }
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
      console.error('KPI Report Trend', error);
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
    // updating high chart
    // https://codesandbox.io/s/543l0p0qq4
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
      let targetData = chartIndexData.filter(data => data.zvalue === 'Target');
      let valueData = chartIndexData.filter(data => data.zvalue === 'Value');
      let allChartLabels = chartIndexData.map(label => label.xvalue);

      let allTargetData = targetData.map(data => data.yvalue);
      let allValuesData = valueData.map(data => data.yvalue);
      debugger
      this.chartOptions.xAxis = {
        type: 'date',
        categories: allChartLabels,
      }
      this.chartOptions.series[0] = {
        type: 'column',
        name: 'Compliant',
        data: allValuesData
      }; 
      this.chartOptions.series[1] = {
        type: 'scatter',
        name: 'Target', // target
        data: allTargetData,
        marker: {
          // lineWidth: 0,
          // lineColor: Highcharts.getOptions().colors[3],
          fillColor: 'orange'
        }
      }; 
      debugger
      // this.chartOptions.series = [
      //   {
      //     type: 'column',
      //     name: 'Compliant',
      //     data: allValuesData
      //   },
      //   {
      //     type: 'spline',
      //     name: 'Average', // target
      //     data: allValuesData,
      //     marker: {
      //       lineWidth: 4,
      //       lineColor: Highcharts.getOptions().colors[3],
      //       fillColor: 'white'
      //     }
      //   }
      // ];
      this.chartUpdateFlag = true;

      // setTimeout(() => {
      //   this.kpiReportTrendLabels.length = 0;
      //   this.kpiReportTrendLabels = allChartLabels;
      // }, 0);

      // this.kpiReportTrendData = [
      //   { data: allCompliantData, label: 'Compliant' },
      //   { data: allNonCompliantData, label: 'Non Compliant' },
      // ];
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

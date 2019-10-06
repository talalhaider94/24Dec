import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { ToastrService } from 'ngx-toastr';
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

  public kpiReportTrendChartType: string = 'bar';

  highcharts = Highcharts;
  chartOptions = {
    credits: false,
    title: {
      text: 'KPI Report Trend'
    },
    xAxis: {
      type: 'date',
      categories: ['10/18', '11/18', '12/18', '01/19', '02/19']
    },
    yAxis: {
      title: {
        text: 'Values #'
      }
    },
    // plotOptions: {
    //   column: {
    //     zones: [{
    //       value: 10, // Values up to 10 (not including) ...
    //       color: 'green' // ... have the color blue.
    //     }, {
    //       color: 'red' // Values from 10 (including) and up have the color red
    //     }]
    //   }
    // },
    series: [
      {
        type: 'column',
        name: 'Values',
        data: [{ "y": 0.35451, "color": "#379457" }, { "y": 0.35081, "color": "#f86c6b" }, { "y": 0.35702, "color": "#f86c6b" }, { "y": 0.39275, "color": "#379457" }, { "y": 0.38562, "color": "#379457" }],
        color: 'black'
      },
      {
        type: 'scatter',
        name: 'Target',
        data: [2, 2, 2, 2, 2],
        marker: {
          fillColor: 'orange'
        }
      }
    ],
    exporting: {
      enabled: true
    },
  };
  chartUpdateFlag: boolean = true;
  constructor(
    private dashboardService: DashboardService,
    private emitter: EmitterService,
    private dateTime: DateTimeService,
    private router: Router,
    private widgetHelper: WidgetHelpersService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    console.log('KPI REPORT TREND ==>', this.filters, this.properties);
    this.chartOptions.title = {
      text: this.widgetname,
    };
    this.chartUpdateFlag = true;
    if (this.router.url.includes('dashboard/public')) {
      this.editWidgetName = false;
      if (this.url) {
        this.emitter.loadingStatus(true);
        this.loading = true;
        this.dashboardService.getContractParties().subscribe(result => {
          this.getChartParametersAndData(this.url, result);
        }, error => {
          console.error('getContractParties', error);
          this.toastr.error('Unable to get Contract Parties', this.widgetname);
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
        const newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
        return this.dashboardService.getWidgetIndex(url, newParams);
      })
    ).subscribe(getWidgetIndex => {
      // populate modal with widget parameters
      let kpiReportTrendParams;
      if (myWidgetParameters) {
        // Danial: No idea why i put this condition headersToString.
        // if (Object.keys(this.filters).length > 0) {
        // } else {
        // if (!this.editWidgetName) {
        myWidgetParameters.contractParties = getContractParties;
        // }
        // }
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
      this.toastr.error('Unable to get widget data', this.widgetname);
      this.loading = false;
      this.emitter.loadingStatus(false);
    });
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
    if (!chartIndexData.length) {
      this.chartOptions.title = {
        text: `No data in ${this.widgetname}.`,
      };
    } else {
      this.chartOptions.title = {
        text: this.widgetname,
      };
    }
    let targetData = chartIndexData.filter(data => data.zvalue === 'Target');
    let valueData = chartIndexData.filter(data => data.zvalue === 'Value');
    if (valueData.length > 0) {
      this.chartOptions.yAxis.title = {
        text: 'Values | ' + valueData[0].description.split('|')[1]
      }
    }
    let allChartLabels = chartIndexData.map(label => label.xvalue);

    let allTargetData = targetData.map(data => data.yvalue);
    let allValuesData = valueData.map(data => ({
      y: data.yvalue,
      name: data.description,
      color: data.description.includes('non compliant') ? '#f86c6b' : '#379457',
    }));
    this.chartOptions.xAxis = {
      type: 'date',
      categories: allChartLabels,
    }
    this.chartOptions.series[0] = {
      type: 'column',
      name: 'Values',
      data: allValuesData,
      color: 'black'
    };
    this.chartOptions.series[1] = {
      type: 'scatter',
      name: 'Target',
      data: allTargetData,
      marker: {
        fillColor: 'orange'
      }
    };

    this.chartUpdateFlag = true;
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

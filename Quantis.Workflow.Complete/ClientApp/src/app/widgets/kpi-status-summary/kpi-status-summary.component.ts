import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetsHelper } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Component({
  selector: 'app-kpi-status-summary',
  templateUrl: './kpi-status-summary.component.html',
  styleUrls: ['./kpi-status-summary.component.scss']
})
export class KpiStatusSummaryComponent implements OnInit {
  @Input() widgetname: string;
  @Input() url: string;
  @Input() filters: Array<any>;
  @Input() properties: Array<any>;
  @Input() widgetid: number;
  @Input() dashboardid: number;
  @Input() id: number;
  loading: boolean = true;
  kpiStatusSummaryWidgetParameters: any;
  setWidgetFormValues: any;
  editWidgetName: boolean = true;
  @Output()
  kpiStatusSummaryParent = new EventEmitter<any>();
  kpiStatusSummaryData: any = [];

  constructor(
    private dashboardService: DashboardService,
    private emitter: EmitterService,
    private dateTime: DateTimeService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('KpiStatusSummary Table', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
    if (this.router.url.includes('dashboard/public')) {
      this.editWidgetName = false;
    }
    if (this.url) {
      this.emitter.loadingStatus(true);
      this.getChartParametersAndData(this.url);
    }
    // coming from dashboard or public parent components
    this.subscriptionForDataChangesFromParent();
    
    this.dashboardService.getContract().subscribe(result => {
    });

    this.dashboardService.getContractParties().subscribe(result => {
    });

    this.dashboardService.getKPIs().subscribe(result => {
    })
  }

  subscriptionForDataChangesFromParent() {
    this.emitter.getData().subscribe(result => {
      const { type, data } = result;
      if (type === 'kpiStatusSummaryTable') {
        let currentWidgetId = data.kpiStatusSummaryWidgetParameters.id;
        if (currentWidgetId === this.id) {
          // updating parameter form widget setValues 
          let kpiStatusSummaryTableFormValues = data.kpiStatusSummaryWidgetParameterValues;
          kpiStatusSummaryTableFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiStatusSummaryTableFormValues.Filters.daterange);
          this.setWidgetFormValues = kpiStatusSummaryTableFormValues;
          this.updateChart(data.result.body, data, null);
        }
      }
    });
  }
  // invokes on component initialization
  getChartParametersAndData(url) {
    let myWidgetParameters = null;
    this.dashboardService.getWidgetParameters(url).pipe(
      mergeMap((getWidgetParameters: any) => {
        myWidgetParameters = getWidgetParameters;
        // Map Params for widget index when widgets initializes for first time
        let newParams = WidgetsHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
        return this.dashboardService.getWidgetIndex(url, newParams);
      })
    ).subscribe(getWidgetIndex => {
      // populate modal with widget parameters
      myWidgetParameters;
      debugger
      let kpiStatusSummaryParams;
      if (myWidgetParameters) {
        kpiStatusSummaryParams = {
          type: 'kpiStatusSummaryTableParams',
          data: {
            ...myWidgetParameters,
            widgetname: this.widgetname,
            url: this.url,
            filters: this.filters,
            properties: this.properties,
            widgetid: this.widgetid,
            dashboardid: this.dashboardid,
            id: this.id
          }
        }
        this.kpiStatusSummaryWidgetParameters = kpiStatusSummaryParams.data;
        // setting initial Paramter form widget values
        this.setWidgetFormValues = WidgetsHelper.initWidgetParameters(myWidgetParameters, this.filters, this.properties);
        console.log('KpiStatusSummary Table this.setWidgetFormValues', this.setWidgetFormValues);
      }
      // popular chart data
      if (getWidgetIndex) {
        const chartIndexData = getWidgetIndex.body;
        // third params is current widgets settings current only used when
        // widgets loads first time. may update later for more use cases
        this.updateChart(chartIndexData, null, kpiStatusSummaryParams.data);
      }
      this.loading = false;
      this.emitter.loadingStatus(false);
    }, error => {
      console.error('KpiStatusSummary Table', error, this.setWidgetFormValues);
      this.loading = false;
      this.emitter.loadingStatus(false);
    });
  }


  openModal() {
    console.log('KpiStatusSummaryComponent OpenModal kpiStatusSummaryWidgetParameters', this.kpiStatusSummaryWidgetParameters);
    console.log('KpiStatusSummaryComponent OpenModal setWidgetFormValues', this.setWidgetFormValues);
    this.kpiStatusSummaryParent.emit({
      type: 'openKpiStatusSummaryModal',
      data: {
        kpiStatusSummaryWidgetParameters: this.kpiStatusSummaryWidgetParameters,
        setWidgetFormValues: this.setWidgetFormValues,
        isKpiStatusSummaryComponent: true
      }
    });
  }

  closeModal() {
    this.emitter.sendNext({ type: 'closeModal' });
  }

  // dashboardComponentData is result of data coming from 
  updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
    this.kpiStatusSummaryData = chartIndexData;

    if (dashboardComponentData) {
    }

    if (currentWidgetComponentData) {
    }

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

import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { DashboardService, EmitterService, FreeFormReportService } from '../../_services';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-free-form-reports-widget',
  templateUrl: './free-form-reports-widget.component.html',
  styleUrls: ['./free-form-reports-widget.component.scss']
})
export class FreeFormReportsWidgetComponent implements OnInit {
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
  isDashboardModeEdit: boolean = true;
  @Output()
  freeFormReportParent = new EventEmitter<any>();
  freeFormReportData: any = [];

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  dtOptions: {};
  dtTrigger = new Subject();

  constructor(
    private dashboardService: DashboardService,
    private emitter: EmitterService,
    private dateTime: DateTimeService,
    private router: Router,
    private widgetHelper: WidgetHelpersService,
    private _freeFormReport: FreeFormReportService
  ) { }

  ngOnInit() {
    console.log('FreeFormReport Widget ==>', this.widgetname, this.url, this.id, this.widgetid, this.filters, this.properties);
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: false,
      dom: 'lBfrtip',
      search: {
        caseInsensitive: true
      },
      buttons: [
        {
          extend: 'csv',
          text: '<i class="fa fa-file"></i> Esporta CSV',
          titleAttr: 'Esporta CSV',
          className: 'btn btn-primary mb-3'
        },
        {
          extend: 'pdf',
          text: '<i class="fa fa-file"></i> Esporta PDF',
          titleAttr: 'Esporta PDF',
          className: 'btn btn-primary mb-3',
        },
      ],
      language: {
        processing: "Elaborazione...",
        search: "Cerca:",
        lengthMenu: "Visualizza _MENU_ elementi",
        info: "Vista da _START_ a _END_ di _TOTAL_ elementi",
        infoEmpty: "Vista da 0 a 0 di 0 elementi",
        infoFiltered: "(filtrati da _MAX_ elementi totali)",
        infoPostFix: "",
        loadingRecords: "Caricamento...",
        zeroRecords: "La ricerca non ha portato alcun risultato.",
        emptyTable: "Nessun dato presente nella tabella.",
        paginate: {
          first: "Primo",
          previous: "Precedente",
          next: "Seguente",
          last: "Ultimo"
        },
        aria: {
          sortAscending: ": attiva per ordinare la colonna in ordine crescente",
          sortDescending: ":attiva per ordinare la colonna in ordine decrescente"
        }
      }
    };

    if (this.router.url.includes('dashboard/public')) {
      this.isDashboardModeEdit = false;
      if (this.url) {
        this.emitter.loadingStatus(true);
        this.getReportQueryDetailByID();
        // this.getChartParametersAndData(this.url);
      }
      // coming from dashboard or public parent components
      // this.subscriptionForDataChangesFromParent();
    }
  }
  
  getReportQueryDetailByID(){
    this._freeFormReport.getReportQueryDetailByID().subscribe(data => {
      this.emitter.loadingStatus(true);
      this.loading = false;
      this.freeFormReportData = data;
      const buildIndexParams = {
        Properties: {
          measure: data.id,
          parameters: data.parameters
        }
        
      }
    }, error => {
      console.error(this.widgetname, error);
      this.emitter.loadingStatus(true);
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
  
  // subscriptionForDataChangesFromParent() {
  //   this.emitter.getData().subscribe(result => {
  //     const { type, data } = result;
  //     if (type === 'kpiStatusSummaryTable') {
  //       let currentWidgetId = data.kpiStatusSummaryWidgetParameters.id;
  //       if (currentWidgetId === this.id) {
  //         // updating parameter form widget setValues 
  //         let kpiStatusSummaryTableFormValues = data.kpiStatusSummaryWidgetParameterValues;
  //         if(kpiStatusSummaryTableFormValues.Filters.daterange) {
  //           kpiStatusSummaryTableFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiStatusSummaryTableFormValues.Filters.daterange);
  //         }
  //         this.setWidgetFormValues = kpiStatusSummaryTableFormValues;
  //         this.updateChart(data.result.body, data, null);
  //       }
  //     }
  //   });
  // }
  // invokes on component initialization
  getChartParametersAndData(url) {
    let myWidgetParameters = null;
    this.loading = true;
    this.dashboardService.getWidgetParameters(url).pipe(
      mergeMap((getWidgetParameters: any) => {
        myWidgetParameters = getWidgetParameters;
        // Map Params for widget index when widgets initializes for first time
        let newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
        return this.dashboardService.getWidgetIndex(url, newParams);
      })
    ).subscribe(getWidgetIndex => {
      // populate modal with widget parameters
      myWidgetParameters;
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
        this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
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
    this.freeFormReportParent.emit({
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
    console.log('KPI STATUS SUMMARY chartIndexData', chartIndexData);
    this.freeFormReportData = chartIndexData;
    this.dtTrigger.next();
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

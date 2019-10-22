import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { DashboardService, EmitterService, FreeFormReportService } from '../../_services';
import { DateTimeService, WidgetHelpersService } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject, of, from } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
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
    loading: boolean = false;
    freeFormReportWidgetParameters: any;
    setWidgetFormValues: any;
    isDashboardModeEdit: boolean = true;
    @Output()
    freeFormReportParent = new EventEmitter<any>();
    freeFormReportData: any = [];

    @ViewChild(DataTableDirective)
    datatableElement: DataTableDirective;
    dtOptions: {};
    dtTrigger = new Subject();
    reportName: string;
    allMeasuresObj: {number:string};
    constructor(
        private dashboardService: DashboardService,
        private emitter: EmitterService,
        private dateTime: DateTimeService,
        private router: Router,
        private widgetHelper: WidgetHelpersService,
        private _freeFormReport: FreeFormReportService,
        private $toastr: ToastrService
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
                    orientation: 'landscape',
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
                this._freeFormReport.getReportQueryDetailByID().subscribe(result => {
                    this.getChartParametersAndData(this.url, result);
                }, error => {
                    console.error('getReportQueryDetailByID', error);
                    this.$toastr.error('Unable to get Report Query Detail.', this.widgetname);
                });
            }
            // coming from dashboard or public parent components
            this.subscriptionForDataChangesFromParent();
        }
    }
    
    ngAfterViewInit() {
        this.dtTrigger.next();
    }

    rerender(): void {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
        });
    }

    ngOnDestroy() {
        this.dtTrigger.unsubscribe();
    }

    subscriptionForDataChangesFromParent() {
        this.emitter.getData().subscribe(result => {
            const { type, data } = result;
            if (type === 'freeFormReportWidgetTable') {
                let currentWidgetId = data.freeFormReportWidgetParameters.id;
                if (currentWidgetId === this.id) {
                    // updating parameter form widget setValues
                    let freeFormReportFormValues = data.freeFormReportWidgetParameterValues;
                    this.reportName = this.allMeasuresObj[data.freeFormReportWidgetParameterValues.Properties.measure];
                    if (freeFormReportFormValues.Filters.daterange) {
                        freeFormReportFormValues.Filters.daterange = this.dateTime.buildRangeDate(freeFormReportFormValues.Filters.daterange);
                    }
                    if(freeFormReportFormValues.Properties.hasOwnProperty('parameters')) {
                        freeFormReportFormValues.Properties.parameters = JSON.parse(freeFormReportFormValues.Properties.parameters);
                    }
                    this.setWidgetFormValues = freeFormReportFormValues;
                    this.updateChart(data.result.body, data, null);
                }
            }
        });
    }
    // invokes on component initialization
    getChartParametersAndData(url, getReportQueryDetailByID) {
        // let myWidgetParameters = null;
        this.loading = true;
        this.dashboardService.getWidgetParameters(url).pipe(
            mergeMap((getWidgetParameters: any) => {
                // myWidgetParameters = getWidgetParameters;
                this.allMeasuresObj = getWidgetParameters.measures;
                // Map Params for widget index when widgets initializes for first time
                // let newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
                console.log('getReportQueryDetailByID', getReportQueryDetailByID)
                // const buildIndexParams = {
                //     Properties: {
                //         measure: getReportQueryDetailByID.id,
                //         parameters: JSON.stringify(getReportQueryDetailByID.parameters)
                //     }
                // };
                // return this.dashboardService.getWidgetIndex(url, buildIndexParams);
                return of(getWidgetParameters);
            })
        ).subscribe(getWidgetParameters => {
            // populate modal with widget parameters
            let freeFormReportParams;
            if (getWidgetParameters) {
                getWidgetParameters.getReportQueryDetailByID = getReportQueryDetailByID;
                freeFormReportParams = {
                    type: 'freeFormReportTableParams',
                    data: {
                        ...getWidgetParameters,
                        widgetname: this.widgetname,
                        url: this.url,
                        filters: this.filters,
                        properties: this.properties,
                        widgetid: this.widgetid,
                        dashboardid: this.dashboardid,
                        id: this.id,
                        getReportQueryDetailByID: getReportQueryDetailByID
                    }
                }
                this.freeFormReportWidgetParameters = freeFormReportParams.data;
                // setting initial Paramter form widget values
                this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(getWidgetParameters, this.filters, this.properties);
                console.log('freeFormReport Table this.setWidgetFormValues', this.setWidgetFormValues);
            }
            // popular chart data
            // if (getWidgetIndex) {
            //     const chartIndexData = getWidgetIndex.body;
            //     console.log('FREE FORM REPORT chartIndexData', chartIndexData)
                // third params is current widgets settings current only used when
                // widgets loads first time. may update later for more use cases
                // this.updateChart(chartIndexData, null, freeFormReportParams.data);
            // }
            this.loading = false;
            this.emitter.loadingStatus(false);
        }, error => {
            console.error('FreeFormReport Table', error, this.setWidgetFormValues);
            this.$toastr.error('Unable to get widget data.', this.widgetname);
            this.loading = false;
            this.emitter.loadingStatus(false);
        });
    }

    openModal() {
        this.freeFormReportParent.emit({
            type: 'openFreeFormReportModal',
            data: {
                freeFormReportWidgetParameters: this.freeFormReportWidgetParameters,
                setWidgetFormValues: this.setWidgetFormValues,
                isFreeFormReportComponent: true
            }
        });
    }

    closeModal() {
        this.emitter.sendNext({ type: 'closeModal' });
    }

  // dashboardComponentData is result of data coming from 
  updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
    console.log('freeFormReport chartIndexData', chartIndexData);
    if(Array.isArray(chartIndexData)) {
        this.freeFormReportData = chartIndexData;
        this.rerender();
    } else {
        this.$toastr.error(chartIndexData, 'Error!');
        this.freeFormReportData = [];
        this.rerender();
    }
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

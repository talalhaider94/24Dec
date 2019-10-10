import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
HC_exporting(Highcharts);

declare var $;
var $this;

@Component({
    templateUrl: './bsi-report.component.html'
})

export class BSIReportComponent implements OnInit {
    @ViewChild('ConfigurationTable') block: ElementRef;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
    @ViewChild('bsiChartModal') public bsiChartModal: ModalDirective;
    category_id: number = 0;
    dtOptions: any = {
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
    loading: boolean = true;
    dtTrigger: Subject<any> = new Subject();
    AllNormalReportsData: any = [];
    ReportDetailsData: any = [];
    chartUpdateFlag: boolean = true;
    highcharts = Highcharts;
    chartOptions = {
        lang: {
            downloadJPEG: 'Download JPEG image',
            downloadPDF: 'Download PDF document',
            downloadPNG: 'Download PNG image',
            downloadSVG: 'Download SVG vector image',
            viewFullscreen: 'View Full Screen',
            printChart: 'Print Chart'
        },
        credits: false,
        title: {
            text: 'BSI Report'
        },
        xAxis: {
            type: 'date',
            categories: []
            // categories: ['10/18', '11/18', '12/18', '01/19', '02/19']
        },
        yAxis: {
            title: {
                text: 'Percent'
            }
        },
        series: [
            // {
            //     type: 'column',
            //     name: 'Values',
            //     data: [{ "y": 0.35451, "color": "#379457" }, { "y": 0.35081, "color": "#f86c6b" }, { "y": 0.35702, "color": "#f86c6b" }, { "y": 0.39275, "color": "#379457" }, { "y": 0.38562, "color": "#379457" }],
            //     color: 'black'
            // },
            // {
            //     type: 'scatter',
            //     name: 'Target',
            //     data: [2, 2, 2, 2, 2],
            //     marker: {
            //         fillColor: 'orange'
            //     }
            // }
        ],
        exporting: {
            enabled: true
        },
    };

    constructor(
        private apiService: ApiService,
        private $toastr: ToastrService,
    ) {
        $this = this;
    }

    ngOnInit() {
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this.dtTrigger.next();
        this.getAllNormalReports();
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }

    rerender(): void {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtTrigger.next();
            this.loading = false;
        });
    }

    getAllNormalReports() {
        this.loading = true;
        this.apiService.getAllNormalReports().subscribe((data) => {
            this.AllNormalReportsData = data;
            console.log('AllNormalReportsData -> ', data);
            this.rerender();
        });
    }

    getReportDetails(reportId) {
        this.loading = true;
        this.apiService.getReportDetails(reportId).subscribe((data) => {
            this.loading = false;
            this.bsiChartModal.show();
            this.ReportDetailsData = data.reports[0];
            this.showHighChartsData(data);
            console.log('ReportDetailsData -> ', data);
        }, error => {
            console.error('getReportDetails', error);
            this.loading = false;
            this.$toastr.error('Error while fetching report data');
        });
    }

    hideModal(){
        this.bsiChartModal.hide();
    }

    showHighChartsData(data) {
        debugger
        const chartArray = data.reports[0].data;
        // Danial TODO: improve code later by modifying all data in a single loop 
        let violationData = chartArray.filter(data => data.zvalue === 'Violation');
        let compliantData = chartArray.filter(data => data.zvalue === 'Compliant');
        let targetData = chartArray.filter(data => data.zvalue === 'Target');

        let allChartLabels = chartArray.map(label => label.xvalue);
        let allViolationData = violationData.map(data => data.yvalue);
        let allCompliantData = compliantData.map(data => data.yvalue);
        let allTargetData = targetData.map(data => data.yvalue);
        this.chartOptions.xAxis = {
            type: 'date',
            categories: allChartLabels,
        }
        this.chartOptions.yAxis.title = {
            text: data.reports[0].units
        }
        this.chartOptions.series[0] = {
            type: 'column',
            name: 'Violation',
            data: allViolationData,
            color: '#f86c6b'
        };
        this.chartOptions.series[1] = {
            type: 'column',
            name: 'Compliant',
            color: '#379457',
            data: allCompliantData,
        };
        this.chartOptions.series[2] = {
            type: 'scatter',
            name: 'Target',
            data: allTargetData,
            marker: {
                fillColor: '#ffc107'
            }
        };
        this.chartUpdateFlag = true;
    }


}

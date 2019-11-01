import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services';
import { chartExportTranslations } from '../../../_helpers';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as Highcharts from 'highcharts';
import * as moment from 'moment';
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
    @ViewChild('cartellaSelect') cartellaSelect: ElementRef;
    category_id: number = 0;
    bar_period;
    bar_value;
    testArray = [1,2];
    datiGrezzi = [];
    monthVar: any;
    monthVar2: any;
    yearVar: any;
    months = [];
    months2 = [];
    selectedmonth;
    selectedyear;
    countCampiData = [];
    eventTypes: any = {};
    resources: any = {};
    id_kpi_temp = '';
    to_year;
    to_year2;
    isLoadedDati=0;
    isLoadedDati2=0;
    loadingModalDati: boolean = false;
    loadingModalDati2: boolean = false;
    public periodFilter: number;
    campoData: any = [];
    fitroDataById: any = [
        {
            event_type_id: '   ',
            resource_id: '',
            time_stamp: ' ',
            raw_data_id: '',
            create_date: ' ',
            data: this.datiGrezzi,
            modify_date: '',
            reader_id: '',
            event_source_type_id: ' ',
            event_state_id: ' ',
            partner_raw_data_id: ' ',
        }
    ]
    fitroDataById2: any = [
        {
            event_type_id: '   ',
            resource_id: '',
            time_stamp: ' ',
            raw_data_id: '',
            create_date: ' ',
            data: this.datiGrezzi,
            modify_date: '',
            reader_id: '',
            event_source_type_id: ' ',
            event_state_id: ' ',
            partner_raw_data_id: ' ',
        }
    ]

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
        },
        search: {
            caseInsensitive: true
        },
        destroy: true
    };
    loading: boolean = true;
    cartellaSelectOption : any;
    dtTrigger: Subject<any> = new Subject();
    AllNormalReportsData: any = [];
    OrignalNormalReportData:any = [];
    ReportDetailsData: any = [];
    ReportDetailsData1: any = [];
    ReportData: any = [];
    chartUpdateFlag: boolean = true;
    chartUpdateFlag2: boolean = true;
    highcharts = Highcharts;
    reportsDataLength;
    cartellaList : any = [];

    constructor(
        private apiService: ApiService,
        private $toastr: ToastrService,
    ) {
        $this = this;
    }

    chartOptions = {
        lang: chartExportTranslations,
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
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                },
                point: {
                    events: {
                        click: function () {
                            
                            this.bar_period = this.category;
                            this.bar_value = this.y;
                            alert('Period: ' + this.bar_period + ', Value: ' + this.bar_value);

                            let stringToSplit = this.bar_period;
                            let split = stringToSplit.split("/");
                            let month = split[0];
                            let year = split[1];

                            this.getDayLevelData(month,year);

                            // let kpiId = this.ReportDetailsData.globalruleid;
                            // let x = JSON.parse(localStorage.getItem('globalruleid'));
                            //console.log('GetDayLevelKPIData -> ',x,kpiId,month,year);
                           
                        }
                    }
                }
            }
        },
        tooltip: {
            enabled: true,
            crosshairs: true
        },
        series: [],
        exporting: {
            enabled: true
        },
    };

    chartOptions2 = {
        lang: chartExportTranslations,
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
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true
                },
                point: {
                    events: {
                        click: function () {
                            this.bar_period = this.category;
                            this.bar_value = this.y;
                            alert('Period: ' + this.bar_period + ', Value: ' + this.bar_value);
                        }
                    }
                }
            }
        },
        tooltip: {
            enabled: true,
            crosshairs: true
        },
        series: [],
        exporting: {
            enabled: true
        },
    };

    ngOnInit() {
      this.cartellaSelectOption = '';
      //this.getDayLevelData('02','2019');
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this.dtTrigger.next();
        this.getAllNormalReports();
        this.setUpDataTableDependencies();
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
            this.setUpDataTableDependencies();
            this.loading = false;
        });
    }

    getAllNormalReports() {
        this.loading = true;
        this.apiService.getAllNormalReports().subscribe((data) => {
            this.AllNormalReportsData = data;
            this.OrignalNormalReportData = data;
            console.log('AllNormalReportsData -> ', data);
            // pushing foldername to dropdown
            data.forEach( (element) => {
                if(this.cartellaList.indexOf(element.foldername) == -1){
                  this.cartellaList.push(element.foldername);
                }
            });

            this.rerender();
        });
    }

    getReportDetails(reportId) {
        this.months.length = 0;
        this.months2.length = 0;
        this.isLoadedDati=0;
        this.isLoadedDati2=0;
        this.loading = true;
        this.apiService.getReportDetails(reportId).subscribe((data) => {
            this.loading = false;
            this.bsiChartModal.show();
            //for(let i=0; i<data.reports.length; i++){
                this.reportsDataLength = data.reports.length;
                this.ReportData = data;
                //console.log('this.reportsDataLength -> ',this.reportsDataLength);
                if(this.reportsDataLength==1){
                    this.ReportDetailsData = data.reports[0];
                    this.showHighChartsData(data);
                }else if(this.reportsDataLength>1){
                    this.ReportDetailsData = data.reports[0];
                    this.ReportDetailsData1 = data.reports[1];
                    this.showHighChartsData(data);
                    this.showHighChartsData2(data);
                }else{

                }
           // }
            console.log('ReportDetailsData -> ', this.ReportDetailsData);
        }, error => {
            console.error('getReportDetails', error);
            this.loading = false;
            this.$toastr.error('Error while fetching report data');
        });
    }

    getDayLevelData(month, year){
        this.apiService.GetDayLevelKPIData(37799,month,year).subscribe((data) => {
            console.log('GetDayLevelKPIData -> ',data);
        });
    }

    // search start

    setUpDataTableDependencies() {
        let vm = this;

        /*$this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
            datatable_Ref.columns(0).every(function () {
                const that = this;
                $($this.cartellaSelect.nativeElement)
                    .on('change', function (event) {
                        event.stopPropagation();
                        event.preventDefault();

                        vm.AllNormalReportsData = vm.OrignalNormalReportData; // assigning all data back
                        if($(this).val()){
                          const filterFolder = vm.AllNormalReportsData.filter(x => x.foldername == $(this).val())

                          vm.AllNormalReportsData = filterFolder;


                          //that.rows.add($(this).val());
                          that.clear();
                          that.draw();
                          //$this.rerender();
                        }
                    });
            });
        });*/


        $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
            datatable_Ref.columns(0).every(function () {
                const that = this;
                // Create the select list and search operation

                const select = $($this.cartellaSelect.nativeElement)
                    .on('change', function () {
                        that
                          .search($(this).val().replace(')','\\)').replace('(','\\(')+'$', true, false, false)
                            .draw();
                    });
            });
        });
    }
    //search end
    hideModal(){
        this.bsiChartModal.hide();
    }

    showHighChartsData(data) {
        const chartArray = data.reports[0].data;
        //const data1 = data.reports[0].data[2];
        // Danial TODO: improve code later by modifying all data in a single loop
        let violationData = chartArray.filter(data => (data.zvalue === 'Violation' || data.zvalue === 'Violazione'));
        let compliantData = chartArray.filter(data => (data.zvalue === 'Compliant' || data.zvalue === 'Conforme'));
        let targetData = chartArray.filter(data => (data.zvalue === 'Target' || data.zvalue === 'Previsione' ));
        let minorData = chartArray.filter(data => (data.zvalue === 'Minor'));
        let criticalData = chartArray.filter(data => (data.zvalue === 'Critical' ));
        let allChartLabels = chartArray.map(label => label.xvalue);
        let allViolationData = violationData.map(data => data.yvalue);
        let allCompliantData = compliantData.map(data => data.yvalue);
        let allTargetData = targetData.map(data => data.yvalue);
        let allMinorData = minorData.map(data => data.yvalue);
        let allCriticalData = criticalData.map(data => data.yvalue);

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
            color: '#f86c6b',
            dataLabels: {
                color: '#f86c6b'
            },
        };
        this.chartOptions.series[1] = {
            type: 'column',
            name: 'Compliant',
            color: '#379457',
            data: allCompliantData,
            dataLabels: {
                color: '#379457'
            },
        };
        this.chartOptions.series[2] = {
            type: 'scatter',
            name: 'Target',
            data: allTargetData,
            marker: {
                fillColor: '#ffc107'
            },
            dataLabels: {
                color: '#ffc107',
            },
        };
        if(allMinorData==0){
            this.chartOptions.series[3] = {
                type: 'scatter',
                name: 'null',
                marker: {
                    fillColor: '#1985ac'
                },
            };
        }else{
            this.chartOptions.series[3] = {
                type: 'scatter',
                name: 'Minor',
                data: allMinorData,
                marker: {
                    fillColor: '#1985ac'
                },
                dataLabels: {
                    color: '#1985ac'
                },
            };
        }
        
        if(allCriticalData==0){
            this.chartOptions.series[4] = {
                type: 'scatter',
                name: 'null',
                marker: {
                    fillColor: '#f86c6b'
                },
            };
        }else{
            this.chartOptions.series[4] = {
                type: 'scatter',
                name: 'Critical',
                data: allCriticalData,
                marker: {
                    fillColor: '#f86c6b'
                },
                dataLabels: {
                    color: '#f86c6b'
                },
            };
        }
        this.chartUpdateFlag = true;
    }

    showHighChartsData2(data) {
        // debugger
        const chartArray = data.reports[1].data;
        // Danial TODO: improve code later by modifying all data in a single loop
        let violationData = chartArray.filter(data => (data.zvalue === 'Violation' || data.zvalue === 'Violazione'));
        let compliantData = chartArray.filter(data => (data.zvalue === 'Compliant' || data.zvalue === 'Conforme'));
        let targetData = chartArray.filter(data => (data.zvalue === 'Target' || data.zvalue === 'Previsione' ));

        let minorData = chartArray.filter(data => (data.zvalue === 'Minor' || data.zvalue === 'Minore'));
        let criticalData = chartArray.filter(data => (data.zvalue === 'Critical' || data.zvalue === 'Critica'));

        let allChartLabels = chartArray.map(label => label.xvalue);
        let allViolationData = violationData.map(data => data.yvalue);
        let allCompliantData = compliantData.map(data => data.yvalue);
        let allTargetData = targetData.map(data => data.yvalue);

        let allMinorData = minorData.map(data => data.yvalue);
        let allCriticalData = criticalData.map(data => data.yvalue);

        this.chartOptions2.xAxis = {
            type: 'date',
            categories: allChartLabels,
        }
        this.chartOptions2.yAxis.title = {
            text: data.reports[1].units
        }
        this.chartOptions2.series[0] = {
            type: 'column',
            name: 'Violation',
            data: allViolationData,
            color: '#f86c6b',
            dataLabels: {
                color: '#f86c6b'
            },
        };
        this.chartOptions2.series[1] = {
            type: 'column',
            name: 'Compliant',
            color: '#379457',
            data: allCompliantData,
            dataLabels: {
                color: '#379457'
            },
        };
        this.chartOptions2.series[2] = {
            type: 'scatter',
            name: 'Target',
            data: allTargetData,
            marker: {
                fillColor: '#ffc107'
            },
            dataLabels: {
                color: '#ffc107'
            },
        };
        if(allMinorData==0){
            this.chartOptions2.series[3] = {
                type: 'scatter',
                name: 'null',
                marker: {
                    fillColor: '#1985ac'
                },
            };
        }else{
            this.chartOptions2.series[3] = {
                type: 'scatter',
                name: 'Minor',
                data: allMinorData,
                marker: {
                    fillColor: '#1985ac'
                },
                dataLabels: {
                    color: '#1985ac'
                },
            };
        }
        
        if(allCriticalData==0){
            this.chartOptions2.series[4] = {
                type: 'scatter',
                name: 'null',
                marker: {
                    fillColor: '#f86c6b'
                },
            };
        }else{
            this.chartOptions2.series[4] = {
                type: 'scatter',
                name: 'Critical',
                data: allCriticalData,
                marker: {
                    fillColor: '#f86c6b'
                },
                dataLabels: {
                    color: '#f86c6b'
                },
            };
        }
        this.chartUpdateFlag2 = true;
    }

    
    public chartClicked(): void {
        this.months.length = 0;
        this.isLoadedDati2 = 0;

        var fromCheck = moment(this.ReportDetailsData.fromdate, 'DD/MM/YYYY');
        var toCheck = moment(this.ReportDetailsData.todate, 'DD/MM/YYYY');

        var fromMonth = fromCheck.format('M');
        var fromYear  = fromCheck.format('YYYY');

        var toMonth = toCheck.format('M');
        var toYear  = toCheck.format('YYYY');

        this.selectedmonth = toMonth;
        this.selectedyear = toYear;

        this.to_year = toYear;

        //console.log('months -> ',fromCheck,toCheck);

        while(toCheck > fromCheck || fromCheck.format('M') === toCheck.format('M')){
            let monthyear = fromCheck.format('M') + '/' + fromCheck.format('YYYY');
            this.months.push(monthyear);
            fromCheck.add(1,'month');
        }

        // console.log('Chart Clicked -> ',this.ReportDetailsData.globalruleid, this.ReportDetailsData.fromdate,
        // this.ReportDetailsData.todate);

        console.log('From Date -> ',fromMonth,fromYear,' - To Date -> ',toMonth,toYear);
        console.log('Months -> ',this.months);

        this.getdati1(toMonth,toYear);
    }

    public chartClicked2(): void {
        this.months2.length = 0;
        this.isLoadedDati = 0;

        var fromCheck = moment(this.ReportDetailsData.fromdate, 'DD/MM/YYYY');
        var toCheck = moment(this.ReportDetailsData.todate, 'DD/MM/YYYY');

        var fromMonth = fromCheck.format('M');
        var fromYear  = fromCheck.format('YYYY');

        var toMonth = toCheck.format('M');
        var toYear  = toCheck.format('YYYY');

        this.selectedmonth = toMonth;
        this.selectedyear = toYear;

        this.to_year2 = toYear;

        while(toCheck > fromCheck || fromCheck.format('M') === toCheck.format('M')){
            let monthyear = fromCheck.format('M') + '/' + fromCheck.format('YYYY');
            this.months2.push(monthyear);
            fromCheck.add(1,'month');
        }

        console.log('From Date -> ',fromMonth,fromYear,' - To Date -> ',toMonth,toYear);
        console.log('Months -> ',this.months2);

        // console.log('Chart Clicked2 -> ',this.ReportDetailsData);

        this.getdati2(toMonth,toYear);
    }

    getdati1(toMonth,toYear) {
        this.periodFilter = 1;
        let month;
        let year;
        if(toMonth<10){
            month = '0' + toMonth;
        }else{
            month = toMonth;
        }
        //year = '2018';
        year = toYear;
        let kpiId = this.ReportDetailsData.globalruleid;
        localStorage.setItem('globalruleid', JSON.stringify(this.ReportDetailsData.globalruleid));
        // let month = '08';
        // let year = '2018';
        //let kpiId = 39412;
        this.loadingModalDati = true;
        this.isLoadedDati=1;

        console.log('getdati1 -> ',kpiId,month,year);

        this.apiService.getKpiRawData(kpiId, month, year).subscribe((dati: any) => {
            this.fitroDataById = dati;
            //console.log(dati);
            Object.keys(this.fitroDataById).forEach(key => {
                this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data);
                switch (this.fitroDataById[key].event_state_id) {
                    case 1:
                        this.fitroDataById[key].event_state_id = "Originale";
                        break;
                    case 2:
                        this.fitroDataById[key].event_state_id = "Sovrascritto";
                        break;
                    case 3:
                        this.fitroDataById[key].event_state_id = "Eliminato";
                        break;
                    case 4:
                        this.fitroDataById[key].event_state_id = "Correzione";
                        break;
                    case 5:
                        this.fitroDataById[key].event_state_id = "Correzione eliminata";
                        break;
                    case 6:
                        this.fitroDataById[key].event_state_id = "Business";
                        break;
                    default:
                        this.fitroDataById[key].event_state_id = this.fitroDataById[key].event_state_id;
                        break;
                }
                this.fitroDataById[key].event_type_id = this.eventTypes[this.fitroDataById[key].event_type_id] ? this.eventTypes[this.fitroDataById[key].event_type_id] : this.fitroDataById[key].event_type_id;
                this.fitroDataById[key].resource_id = this.resources[this.fitroDataById[key].resource_id] ? this.resources[this.fitroDataById[key].resource_id] : this.fitroDataById[key].resource_id;
                this.fitroDataById[key].modify_date = moment(this.fitroDataById[key].modify_date).format('DD/MM/YYYY HH:mm:ss');
                this.fitroDataById[key].create_date = moment(this.fitroDataById[key].create_date).format('DD/MM/YYYY HH:mm:ss');
                this.fitroDataById[key].time_stamp = moment(this.fitroDataById[key].time_stamp).format('DD/MM/YYYY HH:mm:ss');
            })
            this.getCountCampiData();

            let max = this.countCampiData.length;

            Object.keys(this.fitroDataById).forEach(key => {
                let temp = Object.keys(this.fitroDataById[key].data).length;
                if (temp < max) {
                    for (let i = 0; i < (max - temp); i++) {
                        this.fitroDataById[key].data['empty#' + i] = '##empty##';
                    }
                }
            })
            console.log('dati', dati);
            this.loadingModalDati = false;
        },
        error => {
            this.loadingModalDati = false;
        });
    }

    getdati2(toMonth,toYear) {
        this.periodFilter = 1;
        let month;
        let year;
        if(toMonth<10){
            month = '0' + toMonth;
        }else{
            month = toMonth;
        }
        // let month = '10';
        //year = '2018';
        year = toYear;
        let kpiId = this.ReportDetailsData.globalruleid;
        //let kpiId = 39412;
        this.loadingModalDati2 = true;
        this.isLoadedDati2=1;

        console.log('getdati2 -> ',kpiId,month,year);

        this.apiService.getKpiRawData(kpiId, month, year).subscribe((dati: any) => {
            this.fitroDataById2 = dati;
            //console.log(dati);
            Object.keys(this.fitroDataById2).forEach(key => {
                this.fitroDataById2[key].data = JSON.parse(this.fitroDataById2[key].data);
                switch (this.fitroDataById2[key].event_state_id) {
                    case 1:
                        this.fitroDataById2[key].event_state_id = "Originale";
                        break;
                    case 2:
                        this.fitroDataById2[key].event_state_id = "Sovrascritto";
                        break;
                    case 3:
                        this.fitroDataById2[key].event_state_id = "Eliminato";
                        break;
                    case 4:
                        this.fitroDataById2[key].event_state_id = "Correzione";
                        break;
                    case 5:
                        this.fitroDataById2[key].event_state_id = "Correzione eliminata";
                        break;
                    case 6:
                        this.fitroDataById2[key].event_state_id = "Business";
                        break;
                    default:
                        this.fitroDataById2[key].event_state_id = this.fitroDataById2[key].event_state_id;
                        break;
                }
                this.fitroDataById2[key].event_type_id = this.eventTypes[this.fitroDataById2[key].event_type_id] ? this.eventTypes[this.fitroDataById2[key].event_type_id] : this.fitroDataById2[key].event_type_id;
                this.fitroDataById2[key].resource_id = this.resources[this.fitroDataById2[key].resource_id] ? this.resources[this.fitroDataById2[key].resource_id] : this.fitroDataById2[key].resource_id;
                this.fitroDataById2[key].modify_date = moment(this.fitroDataById2[key].modify_date).format('DD/MM/YYYY HH:mm:ss');
                this.fitroDataById2[key].create_date = moment(this.fitroDataById2[key].create_date).format('DD/MM/YYYY HH:mm:ss');
                this.fitroDataById2[key].time_stamp = moment(this.fitroDataById2[key].time_stamp).format('DD/MM/YYYY HH:mm:ss');
            })
            this.getCountCampiData2();

            let max = this.countCampiData.length;

            Object.keys(this.fitroDataById2).forEach(key => {
                let temp = Object.keys(this.fitroDataById2[key].data).length;
                if (temp < max) {
                    for (let i = 0; i < (max - temp); i++) {
                        this.fitroDataById2[key].data['empty#' + i] = '##empty##';
                    }
                }
            })
            //console.log('dati', dati);
            this.loadingModalDati2 = false;
        },
        error => {
            this.loadingModalDati2 = false;
        });
    }


    getCountCampiData() {
        let maxLength = 0;
        this.fitroDataById.forEach(f => {
            //let data = JSON.parse(f.data);
            if (Object.keys(f.data).length > maxLength) {
                maxLength = Object.keys(f.data).length;
            }
        });
        this.countCampiData = [];
        for (let i = 1; i <= maxLength; i++) {
            this.countCampiData.push(i);
        }
    }
    
    getCountCampiData2() {
        let maxLength = 0;
        this.fitroDataById2.forEach(f => {
            //let data = JSON.parse(f.data);
            if (Object.keys(f.data).length > maxLength) {
                maxLength = Object.keys(f.data).length;
            }
        });
        this.countCampiData = [];
        for (let i = 1; i <= maxLength; i++) {
            this.countCampiData.push(i);
        }
    }

    selectedMonth(e){
        let stringToSplit = this.monthVar;
        let split = stringToSplit.split("/");
        let month = split[0];
        let year = split[1];

        console.log('KPI ID -> ',this.ReportDetailsData.globalruleid,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.selectedmonth = month;
        this.selectedyear = year;

        this.getdati1(month,year);
    }

    selectedMonth2(e){
        let stringToSplit = this.monthVar2;
        let split = stringToSplit.split("/");
        let month = split[0];
        let year = split[1];

        console.log('KPI ID -> ',this.ReportDetailsData.globalruleid,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.selectedmonth = month;
        this.selectedyear = year;

        this.getdati2(month,year);
    }


}

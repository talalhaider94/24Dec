import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService, DashboardService } from '../../../_services';
import { DateTimeService } from '../../../_helpers';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
import * as Highcharts from 'highcharts';
import { chartExportTranslations } from '../../../_helpers';
declare var $;
var $this;

@Component({
    templateUrl: './personal-report.component.html',
    styleUrls: ['./personal-report.component.scss']
})

export class PersonalReportComponent implements OnInit {
    @ViewChild('personaliModal') public personaliModal: ModalDirective;
    @ViewChild('configModal') public configModal: ModalDirective;
    @ViewChild('ConfigurationTable') block: ElementRef;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;

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
    dayDrillPeriod;
    dayDrillPeriod2;
    isDayDrill=0;
    campoData: any = [];
    reportData;
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

    ReportDetailsData: any = [];
    ReportDetailsData1: any = [];
    ReportData: any = [];
    chartUpdateFlag: boolean = true;
    chartUpdateFlag2: boolean = true;
    dayChartUpdateFlag: boolean = true;
    highcharts = Highcharts;
    reportsDataLength;

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
    loading: boolean = false;
    dtTrigger: Subject<any> = new Subject();
    PersonalReportData: any = [];
    formArray: any = [];
    personalReportForm: FormGroup;
    allContractParties: Array<any> = [{ key: '', value: 'Select Contract Parties' }];
    filterContracts: Array<any> = [{ key: '', value: 'Select Contracts' }];
    filterKpis: Array<any> = [{ key: '', value: `Select KPI's` }];
    allAggregationOptions: Array<any> = [
        { key: '', value: 'Select Aggregation' },
        { key: 'Period', value: 'period' },
        { key: 'Tracking Period', value: 'trackingperiod' },
    ];
    modalLoading: boolean = false;
    reportArray;

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

    ///////////////////////////////////

    dayChartOptions = {
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

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private _dashboardService: DashboardService,
        private _$localeService: BsLocaleService,
        private _dateTimeService: DateTimeService
    ) {
        $this = this;
        this._$localeService.use('it');
    }

    ngOnInit() {
        this.personalReportForm = this.formBuilder.group({
            name: [null, Validators.required],
            contractParties: [null, Validators.required],
            contracts: [null, Validators.required],
            GlobalRuleId: [null, Validators.required],
            aggregationoption: [null, Validators.required],
            startDate: [null, Validators.required],
			endDate: [null, Validators.required],
        });
        this.personalReportForm.get('contracts').disable();
        this.personalReportForm.get('GlobalRuleId').disable();
        this._dashboardService.getContractParties().subscribe(contractParties => {
           this.loading = false;
           contractParties.map(contractParty => this.allContractParties.push(contractParty));
           this.personalReportForm.patchValue({
               contractParties: ''
           });
        }, error => {
           this.loading = false;
           this.toastr.error('unable to get contract parties', 'Error!')
    });
        this.personalReportForm.patchValue({
            aggregationoption: 'Select Aggregation'
        });
    }

    ngAfterViewInit() {
        this.dtTrigger.next();
        // this.getPersonalReports();
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

    getPersonalReports() {
        this.loading = true;
        // this.apiService.getPersonalReports()
        this.apiService.getAllNormalReports().subscribe((data) => {
            this.PersonalReportData = data;

            console.log('PersonalReportData -> ', data);
            this.rerender();
        });
    }

    showConfigModal() {
        this.configModal.show();
    }

    contractPartiesDropDown(event) {
        this.modalLoading = true;
        this._dashboardService.getContract(0, +event.target.value).subscribe(contracts => {
            this.personalReportForm.get('contracts').enable();
            contracts.map(contract => this.filterContracts.push(contract));
            this.personalReportForm.patchValue({
                contracts: ''
            });
            this.modalLoading = false;
        }, error => {
            this.modalLoading = false;
            console.error('contractPartiesDropDown', error);
            this.toastr.error('Error', 'Unable to get Contracts');
        });
    }

    contractsDropDown(event) {
        this.modalLoading = true;
        this._dashboardService.getKPIs(0, +event.target.value).subscribe(kpis => {
            this.personalReportForm.get('GlobalRuleId').enable();
            kpis.map(kpi => this.filterKpis.push(kpi));
            this.personalReportForm.patchValue({
                GlobalRuleId: ''
            });
            this.modalLoading = false;
        }, error => {
            this.modalLoading = false;
            console.error('contractsDropDown', error);
            this.toastr.error('Error', 'Unable to get KPIs');
        });
    }

    onPersonalReportFormSubmit() {
        this.loading = true;
        this.months.length = 0;
        this.months2.length = 0;
        this.isLoadedDati=0;
        this.isLoadedDati2=0;
        this.isDayDrill=0;
        this.dayDrillPeriod='';
        this.dayDrillPeriod2='';

        console.log('Form values -> ',this.personalReportForm.value);
        this.formArray = this.personalReportForm.value;
        //console.log('Form values 2 -> ',this.formArray);
        const dateRange = this._dateTimeService.WidgetDateAndTime(this.personalReportForm.value.startDate,this.personalReportForm.value.endDate, true);
        this.reportData = this.personalReportForm.value;
        this.reportData.startDate = dateRange.startDate;
        this.reportData.endDate = dateRange.endDate;
        this.apiService.GetPersonalReport(this.reportData).subscribe((data) => {
            console.log('PersonalReportData -> ', data);
            this.reportArray=data;
            this.loading = false;
            this.personaliModal.show();
            this.getPeriod();
            this.showHighChartsData(data);
        });
        let reportId = 6497;
        //this.getReportDetails(reportId); 
    }

    // getReportDetails(reportId){
    //     this.months.length = 0;
    //     this.months2.length = 0;
    //     this.isLoadedDati=0;
    //     this.isLoadedDati2=0;
    //     this.isDayDrill=0;
    //     this.dayDrillPeriod='';
    //     this.dayDrillPeriod2='';
    //     this.loading = true;
        
    //     this.apiService.getReportDetails(reportId).subscribe((data) => {
    //         this.loading = false;         
    //         this.personaliModal.show();
    //         //for(let i=0; i<data.reports.length; i++){
    //             this.reportsDataLength = data.reports.length;
    //             this.ReportData = data;
    //             //console.log('this.reportsDataLength -> ',this.reportsDataLength);
    //             if(this.reportsDataLength==1){
    //                 this.ReportDetailsData = data.reports[0];
    //                 this.getPeriod();
    //                 this.showHighChartsData(data);
    //             }else if(this.reportsDataLength>1){
    //                 this.ReportDetailsData = data.reports[0];
    //                 this.ReportDetailsData1 = data.reports[1];
    //                 this.getPeriod();
    //                 this.showHighChartsData(data);
    //                 this.showHighChartsData2(data);
    //             }else{

    //             }
    //        // }
    //         console.log('ReportDetailsData -> ', this.ReportDetailsData);
    //         this.configModal.hide();
    //     }, error => {
    //         console.error('getReportDetails', error);
    //         this.loading = false;
    //         this.toastr.error('Error while fetching report data');
    //     });
    // }

    getPeriod(){
        this.months.length = 0;

        var fromCheck = moment(this.reportData.startDate, 'MM/YYYY');
        var toCheck = moment(this.reportData.endDate, 'MM/YYYY');

        var fromMonth = fromCheck.format('M');
        var fromYear  = fromCheck.format('YYYY');

        var toMonth = toCheck.format('M');
        var toYear  = toCheck.format('YYYY');

        while(toCheck > fromCheck || fromCheck.format('M') === toCheck.format('M')){
            let monthyear = fromCheck.format('M') + '/' + fromCheck.format('YYYY');
            this.months.push(monthyear);
            fromCheck.add(1,'month');
        }

        console.log('From Date -> ',fromMonth,fromYear,' - To Date -> ',toMonth,toYear);
        //console.log('Months -> ',this.months);
    }

    getDayLevelData(globalRuleId, month, year){
        this.apiService.GetDayLevelKPIData(globalRuleId,month,year).subscribe((data) => {
            console.log('GetDayLevelKPIData -> ',data);

            if(data.length==0){
                this.toastr.success('Nessun dato per il periodo '+month+'/'+year);
                this.isDayDrill=0;
            }else{    
                this.isDayDrill=1;

                const chartArray = data;

                let targetData = chartArray.filter(data => (data.zvalue === 'Target' || data.zvalue === 'Previsione' ));
                let providedData = chartArray.filter(data => (data.zvalue === 'Provided'));
                
                let allChartLabels = chartArray.map(label => label.xvalue);
                
                let allTargetData = targetData.map(data => data.yvalue);
                let allProvidedData = providedData.map(data => data.yvalue);

                this.dayChartOptions.xAxis = {
                    type: 'date',
                    categories: allChartLabels,
                }
                this.dayChartOptions.yAxis.title = {
                    text: 'Percent'
                }
                
                this.dayChartOptions.series[0] = {
                    type: 'scatter',
                    name: 'Target',
                    data: allTargetData,
                    marker: {
                        fillColor: '#1985ac'
                    },
                    dataLabels: {
                        color: '#1985ac',
                        // color: '#ffc107',
                    },
                };

                this.dayChartOptions.series[1] = {
                    type: 'scatter',
                    name: 'Provided',
                    data: allProvidedData,
                    marker: {
                        fillColor: '#379457'
                    },
                    dataLabels: {
                        color: '#379457',
                    },
                };
                
                this.dayChartUpdateFlag = true;
            }
        });
    }

    showHighChartsData(data) {
        const chartArray = data;
        //const data1 = data.reports[0].data[2];
        // Danial TODO: improve code later by modifying all data in a single loop
        let violationData = chartArray.filter(data => (data.result === 'Violation' || data.result === 'Violazione'));
        let compliantData = chartArray.filter(data => (data.result === 'Compliant' || data.result === 'Conforme'));
        let targetData = chartArray.filter(data => (data.result === 'Target' || data.result === 'Previsione' ));
        let minorData = chartArray.filter(data => (data.result === 'Minor' || data.result === 'Minore'));
        let criticalData = chartArray.filter(data => (data.result === 'Critical' || data.result === 'Critica'));
        let allChartLabels = chartArray.map(label => label.xvalue);
        let allViolationData = violationData.map(data => data.actual);
        let allCompliantData = compliantData.map(data => data.actual);
        let allTargetData = targetData.map(data => data.actual);
        let allMinorData = minorData.map(data => data.actual);
        let allCriticalData = criticalData.map(data => data.actual);

        this.chartOptions.xAxis = {
            type: 'date',
            categories: allChartLabels,
        }
        this.chartOptions.yAxis.title = {
            text: data.unit
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
                fillColor: '#1985ac'
            },
            dataLabels: {
                color: '#1985ac',
            },
        };
        if(allMinorData && allMinorData.length > 0){
            this.chartOptions.series[3] = {
                type: 'scatter',
                name: 'Escalation',
                data: allMinorData,
                marker: {
                    fillColor: '#ffc107'
                },
                dataLabels: {
                    color: '#ffc107',
                    style: {
                        textShadow: false, 
                        textOutline: false 
                    }
                },
            };
        }
        
        if(allCriticalData && allCriticalData.length > 0){
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
                fillColor: '#1985ac'
            },
            dataLabels: {
                color: '#1985ac'
            },
        };
        if(allMinorData && allMinorData.length > 0){
            this.chartOptions2.series[3] = {
                type: 'scatter',
                name: 'Escalation', // minor string is replaced with Escalation
                data: allMinorData,
                marker: {
                    fillColor: '#ffc107'
                },
                dataLabels: {
                    color: '#ffc107',
                    style: {
                        textShadow: false, 
                        textOutline: false 
                    }
                },
            };
        }
        
        if(allCriticalData && allCriticalData.length > 0){
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

        var fromCheck = moment(this.reportData.startDate, 'MM/YYYY');
        var toCheck = moment(this.reportData.endDate, 'MM/YYYY');

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

        var fromCheck = moment(this.reportData.startDate, 'MM/YYYY');
        var toCheck = moment(this.reportData.endDate, 'MM/YYYY');

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
        let kpiId = this.personalReportForm.value.GlobalRuleId;
        localStorage.setItem('globalruleid', JSON.stringify(this.personalReportForm.value.GlobalRuleId));
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
        let kpiId = this.personalReportForm.value.GlobalRuleId;
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

        console.log('KPI ID -> ',this.personalReportForm.value.GlobalRuleId,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.selectedmonth = month;
        this.selectedyear = year;

        this.getdati1(month,year);
    }

    selectedMonth2(e){
        let stringToSplit = this.monthVar2;
        let split = stringToSplit.split("/");
        let month = split[0];
        let year = split[1];

        console.log('KPI ID -> ',this.personalReportForm.value.GlobalRuleId,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.selectedmonth = month;
        this.selectedyear = year;

        this.getdati2(month,year);
    }

    selectedPeriod(){
        this.dayDrillPeriod2='';
        let stringToSplit = this.dayDrillPeriod;
        let split = stringToSplit.split("/");
        let month = split[0];
        let year = split[1];

        console.log('KPI ID -> ',this.personalReportForm.value.GlobalRuleId,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.getDayLevelData(this.personalReportForm.value.GlobalRuleId,month,year);
    }

    selectedPeriod2(){
        this.dayDrillPeriod='';
        let stringToSplit = this.dayDrillPeriod2;
        let split = stringToSplit.split("/");
        let month = split[0];
        let year = split[1];

        console.log('KPI ID -> ',this.personalReportForm.value.GlobalRuleId,' - Selected Month -> ',month,' - Selected Year -> ',year);
    
        this.getDayLevelData(this.personalReportForm.value.GlobalRuleId,month,year);
    }

    hideModal(){
        this.personaliModal.hide();
    }
}

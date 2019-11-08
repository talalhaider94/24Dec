import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService, DashboardService } from '../../../_services';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
declare var $;
var $this;

@Component({
    templateUrl: './personal-report.component.html'
})

export class PersonalReportComponent implements OnInit {
    @ViewChild('configModal') public configModal: ModalDirective;
    @ViewChild('ConfigurationTable') block: ElementRef;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
    category_id: number = 0;
    startDate;
    endDate;
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
    reportObject = {
        GlobalRuleId:0,
        StartDate:'',
        EndDate:'',
        AggregationOption:''
    }
    personalReportForm: FormGroup;
    allContractParties: Array<any> = [{ key: '', value: 'Select Contract Parties' }];
    filterContracts: Array<any> = [{ key: '', value: 'Select Contracts' }];
    filterKpis: Array<any> = [{ key: '', value: `Select KPI's` }];
    allAggregationOptions: Array<any> = [
        { key: '', value: `Select Aggregation` },
        { key: 0, value: 'Period' },
        { key: 1, value: 'Tracking Period' },
    ];
    modalLoading: boolean = false;
    constructor(
        private apiService: ApiService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private _dashboardService: DashboardService,
        private _$localeService: BsLocaleService,
    ) {
        $this = this;
        this._$localeService.use('it');
    }

    ngOnInit() {
        this.personalReportForm = this.formBuilder.group({
            GlobalFilterId: [0],
            // name: [null, Validators.required],
            // contractParties: [null, Validators.required],
            // contracts: [null, Validators.required],
            // kpi: [null, Validators.required],
            aggregationoption: [null, Validators.required],
            startDate: [null, Validators.required],
			endDate: [null, Validators.required],
        });
        // this.personalReportForm.get('contracts').disable();
        // this.personalReportForm.get('kpi').disable();
        // this._dashboardService.getContractParties().subscribe(contractParties => {
        //     this.loading = false;
        //     contractParties.map(contractParty => this.allContractParties.push(contractParty));
        //     this.personalReportForm.patchValue({
        //         contractParties: ''
        //     });
        // }, error => {
        //     this.loading = false;
        //     this.toastr.error('unable to get contract parties', 'Error!')
        // });
        this.personalReportForm.patchValue({
            aggregationoption: ''
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
            this.personalReportForm.get('kpi').enable();
            kpis.map(kpi => this.filterKpis.push(kpi));
            this.personalReportForm.patchValue({
                kpi: ''
            });
            this.modalLoading = false;
        }, error => {
            this.modalLoading = false;
            console.error('contractsDropDown', error);
            this.toastr.error('Error', 'Unable to get KPIs');
        });
    }

    onPersonalReportFormSubmit() {
        this.startDate = this.personalReportForm.value.startDate;
        this.endDate = this.personalReportForm.value.endDate;

        console.log('Object: ',this.personalReportForm.value);

        this.startDate = new Date(this.startDate).toUTCString();
        this.endDate = new Date(this.endDate).toUTCString();

        ///////////////////// From Month and Year ////////////////////
        let stringToSplit = this.startDate;
        let split = stringToSplit.split(",");

        let extra = split[1];
        let fromSplit = extra.split(" ");

        let day = fromSplit[1];
        let month = fromSplit[2];
        let fromMonth = moment().month(month).format("M");

        let from_month = +fromMonth;
        let fromYear = fromSplit[3];
        
        ///////////////////// To Month and Year ////////////////////

        let stringToSplit2 = this.endDate;
        let split2 = stringToSplit2.split(",");

        let extra2 = split2[1];
        let toSplit = extra2.split(" ");

        let day2 = toSplit[1];
        let month2 = toSplit[2];
        let toMonth = moment().month(month2).format("M");
        let toYear = toSplit[3];
        let to_month = +toMonth;

        ////////////////////////////////////////////////////

        let fmonth: any;
        let tmonth: any;

        if(from_month<10){
            fmonth = '0' + from_month;
        }else{
            fmonth = from_month;
        }

        if(to_month<10){
            tmonth = '0' + to_month;
        }else{
            tmonth = to_month;
        }

        let fromDate = fmonth+'/'+fromYear;
        let toDate = tmonth+'/'+toYear;
        
        //console.log('From: ',fromDate,' - To: ',toDate);
        
        this.reportObject.GlobalRuleId = 0;
        this.reportObject.AggregationOption = this.personalReportForm.value.aggregationoption;
        this.reportObject.StartDate = fromDate;
        this.reportObject.EndDate = toDate;

        console.log('reportObject -> ',this.reportObject);
        this.configModal.hide();

        this.apiService.GetPersonalReport(this.reportObject).subscribe((data) => {
            console.log('PersonalReportData -> ', data);
        });
    }
}

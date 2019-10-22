import { Component, OnInit, ComponentRef, ViewChild, ElementRef } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../../_services';
import { DateTimeService } from '../../../_helpers';
import { ActivatedRoute } from '@angular/router';
import { DashboardModel, DashboardContentModel, WidgetModel, ComponentCollection } from '../../../_models';
import { Subscription, forkJoin, interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../_services/api.service';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
    templateUrl: 'landingpage.component.html',
    styleUrls: ['landingpage.component.scss']
})
export class LandingPageComponent implements OnInit {
    @ViewChild('thresholdModal') public thresholdModal: ModalDirective;
    @ViewChild('compliantModal') public compliantModal: ModalDirective;
    @ViewChild('nonCompliantModal') public nonCompliantModal: ModalDirective;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
    @ViewChild('CompliantTable') block: ElementRef;
    @ViewChild('NonCompliantTable') block1: ElementRef;

    dtOptions: DataTables.Settings = {
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
    loading: boolean;
    dtTrigger: Subject<any> = new Subject();
    public period = '02/2019';
    gridsData: any = [];
    limitedData: any = [];
    bestContracts: any = [];
    KpiCompliants: any = [];
    KpiNonCompliants: any = [];
    monthVar: any;
    month: any;
    yearVar: any;
    count = 0;
    setViewAll = 0;
    thresholdkey = '@thresholdKey';
    thresholdvalue = 0;
    constructor(
        private dashboardService: DashboardService,
        private apiService: ApiService,
        private _route: ActivatedRoute,
        private emitter: EmitterService,
        private toastr: ToastrService,
        private formBuilder: FormBuilder,
        private dateTime: DateTimeService
    ) { }
    ngOnInit(): void {

        this.thresholdvalue = 0;
        this.setViewAll=0;

        this.apiService.getThresholdDetails(this.thresholdkey).subscribe((data: any) => {
            this.thresholdvalue = data;
        });

        this.month = moment().format('MMMM');
        this.monthVar = moment().format('MM');
        this.yearVar = moment().format('YYYY');
        this.getAnno();
        
        this.loading = true;
        this.apiService.getLandingPage(this.monthVar, this.yearVar).subscribe((data: any) => {
            this.gridsData = data;
            if(this.gridsData.length==0){
                this.toastr.error("Nessun contraente assegnato all'utente");
            }
            else if(this.gridsData.length>6){
                this.limitedData = this.gridsData.splice(0,6); 
            }else{
                this.limitedData = this.gridsData;
            }
            console.log("gridsData -> ", this.gridsData, this.limitedData);
            this.loading = false;
        });

        this.dtOptions = {
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
            destroy:true
        };
    }

    ngAfterViewInit() {
        this.dtTrigger.next();
        //this.getCOnfigurations();
    }

    ngOnDestroy(): void {
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

    populateDateFilter() {
        if (this.monthVar == null || this.yearVar == null) {
        } else {
            this.loading = true;
            this.apiService.getLandingPage(this.monthVar, this.yearVar).subscribe((data: any) => {
                this.gridsData = data;
                if(this.gridsData.length==0){
                    this.toastr.error("Nessun contraente assegnato all'utente");
                }
                else if(this.gridsData.length>6){
                    this.limitedData = this.gridsData.splice(0,6); 
                }else{
                    this.limitedData = this.gridsData;
                }
                console.log("gridsData -> ", this.gridsData, this.limitedData);
                this.loading = false;
            });
        }
    }

    anni = [];
    //+(moment().add('months', 6).format('YYYY'))
    getAnno() {
        for (var i = 2016; i <= +(moment().add(7,'months').format('YYYY')); i++) {
            this.anni.push(i);
        }
        return this.anni;
    }

    viewAll(){
        this.setViewAll=1;
    }

    details(contractpartyid,contractpartyname) {
        let params = { contractpartyid: contractpartyid, contractpartyname: contractpartyname, month:this.monthVar, year:this.yearVar };
        window.open(`/#/dashboard/landing-page-details/?contractpartyid=${params.contractpartyid}&contractpartyname=${params.contractpartyname}&month=${params.month}&year=${params.year}`,"_self");
    }

    setThreshold() {
        this.apiService.AddUpdateUserSettings(this.thresholdkey, this.thresholdvalue).subscribe((data: any) => {
            this.toastr.success('Threshold value updated');
        }, error => {
          this.toastr.error('Error while updating threshold value');
        });
        this.hideThresholdModal();
    }

    showThresholdModal() {
        this.thresholdModal.show();
    }

    hideThresholdModal() {
        this.thresholdModal.hide();
    }
    
    showCompliantModal(contractPartyId) {
        this.apiService.GetLandingPageKPIDetails(contractPartyId,this.monthVar,this.yearVar).subscribe((data: any) => {
            this.KpiCompliants = data;
            this.rerender();
        });
        this.compliantModal.show();
        
    }

    hideCompliantModal() {
        this.compliantModal.hide();
    }

    showNonCompliantModal(contractPartyId) {
        this.apiService.GetLandingPageKPIDetails(contractPartyId,this.monthVar,this.yearVar).subscribe((data: any) => {
            this.KpiNonCompliants = data;
            this.rerender();
        });
        this.nonCompliantModal.show();
    }

    hideNonCompliantModal() {
        this.nonCompliantModal.hide();
    }
}

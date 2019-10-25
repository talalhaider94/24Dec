import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
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
    templateUrl: 'landing-page-details.component.html',
    styleUrls: ['landing-page-details.component.scss']
})
export class LandingPageDetailsComponent implements OnInit {
    @ViewChild('thresholdModal') public thresholdModal: ModalDirective;
    @ViewChild('compliantModal') public compliantModal: ModalDirective;
    @ViewChild('nonCompliantModal') public nonCompliantModal: ModalDirective;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
    queryParams;

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
    contName: any = [];
    limitedData: any = [];
    bestContracts: any = [];
    monthVar: any;
    contractName:any;
    month: any;
    yearVar: any;
    contractpartyname: any;
    showMultiSelect  : boolean =false;
    count = 0;
    setViewAll = 0;
    thresholdkey = '@thresholdKey1';
    thresholdvalue = 0;
    setThresholdValue = 0;
    gridLength = 0;
    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute,
        private toastr: ToastrService
    ) { }

    ngOnInit(): void {

        this.apiService.getThresholdDetails(this.thresholdkey).subscribe((data: any) => {
            this.thresholdvalue = data;
        });

        this.thresholdvalue = 0;
        this.setThresholdValue=0;
        this.setViewAll=0;
        this.queryParams = this.route.snapshot.queryParamMap['params'];
        console.log('queryParams -> ', this.queryParams.contractpartyid, this.queryParams.contractpartyname,
        this.queryParams.month, this.queryParams.year);

        this.contractpartyname = this.queryParams.contractpartyname;
        this.month = moment().format('MMMM');
        //this.monthVar = moment().format('MM');
        //this.yearVar = moment().format('YYYY');
        this.monthVar = this.queryParams.month;
        this.yearVar = this.queryParams.year;
        this.getAnno();


        this.loading = true;
        this.apiService.getLandingPageLevel1(this.queryParams.contractpartyid,this.queryParams.month,this.queryParams.year).subscribe((data: any) => {
            this.gridsData = data;
            this.gridLength = this.gridsData.length;
	    //  this.contName = data;
            if(this.gridsData.length>6){
                this.limitedData = this.gridsData.splice(0,6);
            }else{
                this.limitedData = this.gridsData;
            }
            this.contName = this.gridsData;
            console.log("Level1 Data -> ", this.gridsData, this.limitedData);
            this.loading = false;
        });
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
            this.apiService.getLandingPageLevel1(this.queryParams.contractpartyid,this.monthVar, this.yearVar).subscribe((data: any) => {
                this.gridsData = data;
                this.gridLength = this.gridsData.length;
                if(this.gridsData.length>6){
                    this.limitedData = this.gridsData.splice(0,6);
                }else{
                    this.limitedData = this.gridsData;
                }
                console.log("Level1 Data -> ", this.gridsData, this.limitedData);
                this.contName = this.gridsData;
                this.loading = false;
            });
        }
    }

    multiSelect(){
      this.showMultiSelect = (this.showMultiSelect) ? false : true;
    }


    async customFilter(){

        let value:any = this.contractName;
        if(value == 'ALL'){
            this.loading = true;
            this.limitedData = this.contName;
            this.loading = false;
        }else{
            this.loading = true;
            var temp:any = this.contName
            var temp2:any = [];
            await value.forEach(async element => {
                await temp.forEach(ele =>  {
                    let e = element.item_text?element.item_text:element
                    if(ele.contractname == e){
                    temp2.push(ele);
                    }else{}});
            });
            await temp2.forEach((val, i) => temp2[i] =  {

                bestcontracts: temp2[i].bestcontracts?temp2[i].bestcontracts:'',
                complaintcontracts: temp2[i].complaintcontracts,
                complaintkpis: temp2[i].complaintkpis,
                contractpartyid: temp2[i].contractpartyid,
                contractname: temp2[i].contractname,
                noncomplaintcontracts: temp2[i].noncomplaintcontracts,
                noncomplaintkpis: temp2[i].noncomplaintkpis,
                totalcontracts: temp2[i].totalcontracts,
                totalkpis: temp2[i].totalkpis,
                worstcontracts: temp2[i].worstcontracts
            })
              this.limitedData = temp2;
            this.loading = false;
        }
     }

    anni = [];
    //+(moment().add('months', 6).format('YYYY'))
    getAnno() {
        for (var i = 2016; i <= +(moment().add('months', 7).format('YYYY')); i++) {
            this.anni.push(i);
        }
        return this.anni;
    }

    viewAll(){
        this.setViewAll=1;
    }

    setThreshold() {
        this.setThresholdValue=1;
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

    showCompliantModal() {
        this.compliantModal.show();
    }

    hideCompliantModal() {
        this.compliantModal.hide();
    }

    showNonCompliantModal() {
        this.nonCompliantModal.show();
    }

    hideNonCompliantModal() {
        this.nonCompliantModal.hide();
    }
}

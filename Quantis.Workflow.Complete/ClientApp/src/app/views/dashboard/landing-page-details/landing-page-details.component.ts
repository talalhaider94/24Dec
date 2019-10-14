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

    dtTrigger: Subject<any> = new Subject();
    public period = '02/2019';
    gridsData: any = [];
    bestContracts: any = [];
    monthVar: any;
    month: any;
    yearVar: any;
    contractpartyname: any;
    count = 0;
    thresholdvalue = 0;
    setThresholdValue = 0;
    constructor(
        private apiService: ApiService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.setThresholdValue=0;
        this.queryParams = this.route.snapshot.queryParamMap['params'];
        console.log('queryParams -> ', this.queryParams.contractpartyid, this.queryParams.contractpartyname, 
        this.queryParams.month, this.queryParams.year);

        this.thresholdvalue = 0;
        this.contractpartyname = this.queryParams.contractpartyname;
        this.month = moment().format('MMMM');
        //this.monthVar = moment().format('MM');
        //this.yearVar = moment().format('YYYY');
        this.monthVar = this.queryParams.month;
        this.yearVar = this.queryParams.year;
        this.getAnno();

        this.apiService.getLandingPageLevel1(this.queryParams.contractpartyid,this.queryParams.month,this.queryParams.year).subscribe((data: any) => {
            this.gridsData = data;
            console.log("Level1 Data -> ", this.gridsData);
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
        });
    }

    populateDateFilter() {
        if (this.monthVar == null || this.yearVar == null) {
        } else {
            this.apiService.getLandingPageLevel1(this.queryParams.contractpartyid,this.monthVar, this.yearVar).subscribe((data: any) => {
                this.gridsData = data;
                console.log("Level1 Data -> ", this.gridsData);
            });
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

    setThreshold() {
        console.log(this.thresholdvalue);
        this.setThresholdValue=1;
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

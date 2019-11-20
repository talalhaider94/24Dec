import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

declare var $;
var $this;

@Component({
    templateUrl: './organization.component.html'
})

export class OrganizationComponent implements OnInit {
    @ViewChild('addConfigModal') public addConfigModal: ModalDirective;
    @ViewChild('configModal') public configModal: ModalDirective;
    @ViewChild('ConfigurationTable') block: ElementRef;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;

    category_id: number = 0;

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

    modalData = {
        key: 0,
        value: ''
    };

    addOrganizationData = {
        Key: 0,
        Value: ''
    };

    dtTrigger: Subject<any> = new Subject();
    organizationsData: any = []
    specialReportsData: any = []

    constructor(
        private apiService: ApiService,
        private toastr: ToastrService,
    ) {
        $this = this;
    }
    value;
    isEdit=0;

    ngOnInit() {
    }

    populateModalData(data) {
        this.isEdit=1;
        this.modalData.key = data.key;
        this.value = data.value;
        this.showAddConfigModal();
    }

    addOrganization() {
        if(this.isEdit==1){
            this.addOrganizationData.Key = this.modalData.key;
        }else{
            this.addOrganizationData.Key = 0;
        }
        this.addOrganizationData.Value = this.value;

        console.log(this.isEdit,this.addOrganizationData.Key);

        this.toastr.info('Valore in aggiornamento..', 'Info');
        this.apiService.AddUpdateOrganizationUnit(this.addOrganizationData).subscribe(data => {
            this.GetAllOrganizationUnits();
            this.toastr.success('Valore aggiornato', 'Success');
            this.hideAddConfigModal();
        }, error => {
            this.toastr.error('Errore in aggiornato.', 'Error');
            this.hideAddConfigModal();
        });
    }

    updateConfig() {
        this.toastr.info('Valore in aggiornamento..', 'Info');
        this.apiService.updateSDMGroupConfig(this.modalData).subscribe(data => {
            this.GetAllOrganizationUnits(); 
            this.toastr.success('Valore Aggiornato', 'Success');
            this.hideConfigModal();
        }, error => {
            this.toastr.error('Errore durante update.', 'Error');
            this.hideConfigModal();
        });
    }

    deleteOrganization(data) {
        this.toastr.info('Valore in aggiornamento..', 'Confirm');
        this.apiService.DeleteOrganizationUnit(data.key).subscribe(data => {
            this.GetAllOrganizationUnits(); 
            this.toastr.success('Valore Aggiornato', 'Success');
        }, error => {
            this.toastr.error('Errore durante update.', 'Error');
        });
    }

    ngAfterViewInit() {
        this.dtTrigger.next();

        this.setUpDataTableDependencies();
        this.GetAllOrganizationUnits();
        this.GetAllReportSpecialValues();
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
    }

    rerender(): void {
        this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
            this.setUpDataTableDependencies();
        });
    }

    setUpDataTableDependencies() {
    }

    strip_tags(html) {
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    }

    GetAllOrganizationUnits() {
        this.apiService.GetAllOrganizationUnits().subscribe((data) => {
            this.organizationsData = data;
            console.log('Organizations Data -> ', data);
            this.rerender();
        });
    }

    GetAllReportSpecialValues() {
        this.apiService.GetAllReportSpecialValues().subscribe((data) => {
            this.specialReportsData = data;
            console.log('Special Reports Data -> ', data);
            this.rerender();
        });
    }

    onCancel(dismissMethod: string): void {
        console.log('Cancel ', dismissMethod);
    }

    addOrganizationModal(){
        this.isEdit=0;
        this.value='';
        this.showAddConfigModal();
    }

    showConfigModal() {
        this.configModal.show();
    }

    hideConfigModal() {
        this.configModal.hide();
    }

    showAddConfigModal() {
        this.addConfigModal.show();
    }

    hideAddConfigModal() {
        this.addConfigModal.hide();
    }
}

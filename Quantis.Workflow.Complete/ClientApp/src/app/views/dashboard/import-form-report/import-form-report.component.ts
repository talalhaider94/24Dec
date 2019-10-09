import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FreeFormReportService } from '../../../_services';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

declare var $;
var $this;

@Component({
    templateUrl: './import-form-report.component.html'
})

export class ImportFormReportComponent implements OnInit {
    @ViewChild('addConfigModal') public addConfigModal: ModalDirective;
    @ViewChild('configModal') public configModal: ModalDirective;
    @ViewChild('ConfigurationTable') block: ElementRef;
    // @ViewChild('searchCol1') searchCol1: ElementRef;
    @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
    category_id: number = 0;
    // handle: any = '';
    // name: any =  '';
    // step: any = '';

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
        // id: '',
        // handle: '',
        // name: '',
        // step: '',
        // category_id: 0
    };

    dtTrigger: Subject<any> = new Subject();
    ConfigTableBodyData: any = [];

    constructor(
        private _freeFormReport: FreeFormReportService,
        private toastr: ToastrService,
    ) {
        $this = this;
    }

    ngOnInit() {
    }

    populateModalData(data) {
        // this.modalData.id = data.id;
        // this.modalData.handle = data.handle;
        // this.modalData.name = data.name;
        // this.modalData.step = data.step;
        // this.modalData.category_id = data.category_id;
        // this.showConfigModal();
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngAfterViewInit() {
        this.dtTrigger.next();

        this.setUpDataTableDependencies();
        this.getCOnfigurations();
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
        });
    }

    setUpDataTableDependencies() {
    }

    strip_tags(html) {
        var tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText;
    }

    getCOnfigurations() {
        // this.apiService.getSDMGroupConfigurations().subscribe((data) =>{
        //   this.ConfigTableBodyData = data;
        //   console.log('Configs ', data);
        //   this.rerender();
        // });
    }

    onCancel(dismissMethod: string): void {
        console.log('Cancel ', dismissMethod);
    }

    showConfigModal() {
        this.configModal.show();
    }

    hideConfigModal() {
        this.configModal.hide();
    }
}

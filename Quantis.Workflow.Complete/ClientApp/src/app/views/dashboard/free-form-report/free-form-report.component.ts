import { Component, OnInit, ViewChild, ViewChildren, OnDestroy, QueryList } from '@angular/core';
import { FreeFormReportService } from '../../../_services';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-free-form-report',
  templateUrl: './free-form-report.component.html',
  styleUrls: ['./free-form-report.component.scss']
})
export class FreeFormReportComponent implements OnInit {
  assignedReportQueries: any = [];
  ownedReportQueries: any = [];
  
  loading: boolean = true;
  formLoading: boolean = false;
  submitted: boolean = false;

  modalTitle: string = 'Add Query Report';
  // @ViewChildren(DataTableDirective)
  // datatableElement: DataTableDirective;

  // @ViewChild(DataTableDirective)
  // datatableElement2: DataTableDirective;

  @ViewChildren(DataTableDirective)
  datatableElements: QueryList<DataTableDirective>;

  @ViewChild('addEditQueryReportModal')
  addEditQueryReportModal: ModalDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();
  dtOptions2: DataTables.Settings = {};
  dtTrigger2 = new Subject();

  addEditQueryForm: FormGroup;
  constructor(
    private _freeFormReport: FreeFormReportService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) { }

  get f() { return this.addEditQueryForm.controls; }
  
  ngOnInit() {

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
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
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      pageLength: 10,
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
    this.addEditQueryForm = this.formBuilder.group({
      id: [0, Validators.required],
      QueryName: ['', Validators.required],
      QueryText: ['', Validators.required],
      Parameters: ['']
    });
    this.getReportsData();
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dtTrigger2.next();
  }

  getReportsData() {
    const $assignedReportQueries = this._freeFormReport.getAssignedReportQueries();
    const $ownedReportQueries = this._freeFormReport.getOwnedReportQueries();

    forkJoin([$assignedReportQueries, $ownedReportQueries]).subscribe(result => {
      if (result) {
        const [assignedReportQueries, ownedReportQueries] = result;
        this.assignedReportQueries = assignedReportQueries;
        this.ownedReportQueries = ownedReportQueries;
        console.log('Queries -> ',this.assignedReportQueries,this.ownedReportQueries);
        // this.dtTrigger.next();
        // this.dtTrigger2.next();
        this.loading = false;
        this.rerender();
      }
    }, error => {
      this.toastr.error('Unable to get Free Form Reports Data.', 'Error');
      console.error('getReportsData', error);
      this.loading = false;
    });

  }

  addQueryModalOpen() {
    this.addEditQueryForm.patchValue({
      id: 0,
      Parameters: {}
    })
    this.addEditQueryReportModal.show();
  }

  onQueryReportFormSubmit() {
    this.submitted = true;
    if (this.addEditQueryForm.invalid) {
      this.addEditQueryReportModal.show();
    } else {
      this.addEditQueryReportModal.show();
      this.formLoading = true;
      this._freeFormReport.addEditReportQuery(this.addEditQueryForm.value).subscribe(dashboardCreated => {
        this.addEditQueryReportModal.hide();
        this.getReportsData();
        this.formLoading = false;
        this.toastr.success('Query created successfully');
      }, error => {
        this.addEditQueryReportModal.hide();
        this.formLoading = false;
        this.toastr.error('Error while creating Query');
      });
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }

  rerender(): void {
    this.datatableElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
        this.dtTrigger2.next();
      });
    });
  }

}

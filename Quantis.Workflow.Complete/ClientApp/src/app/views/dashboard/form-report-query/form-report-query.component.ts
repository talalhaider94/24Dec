import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FreeFormReportService } from '../../../_services';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';


@Component({
  selector: 'app-free-form-report',
  templateUrl: './form-report-query.component.html',
//   styleUrls: ['./free-form-report.component.scss']
})
export class FormReportQueryComponent implements OnInit { 

  assignedReportQueries: any = [];
  ownedReportQueries: any = [];
  QueryName;
  QueryText;
  key = [];
  value = [];
  form: FormGroup;
  
  loading: boolean = true;
  formLoading: boolean = false;
  submitted: boolean = false;

  modalTitle: string = 'Add Query Report';
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  @ViewChild('addEditQueryReportModal')
  addEditQueryReportModal: ModalDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  addEditQueryForm: FormGroup;
  constructor(
    private _freeFormReport: FreeFormReportService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private fb: FormBuilder
  ) {
      this.form = this.fb.group({
        published: true,
        credentials: this.fb.array([]),
      });
   }

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
      }
    };
    
    this.addEditQueryForm = this.formBuilder.group({
      id: [0, Validators.required],
      QueryName: ['', Validators.required],
      QueryText: ['', Validators.required],
      parameters: this.formBuilder.array([
          this.key = [''],
          this.value = ['']
      ]),
    //   key: this.formBuilder.array([
    //     ''
    //   ]),
    //   value: this.formBuilder.array([
    //       ''
    //   ])
    });
  }

  onQueryReportFormSubmit() {
      const creds = this.form.controls.credentials as FormArray;
      console.log('submit form -> ',this.addEditQueryForm.value);
    this.submitted = true;
    if (this.addEditQueryForm.invalid) {
    } else {
      this.formLoading = true;
      this._freeFormReport.addEditReportQuery(this.addEditQueryForm.value).subscribe(dashboardCreated => {
        //this.getReportsData();
        this.formLoading = false;
        this.toastr.success('Query created successfully');
      }, error => {
        this.formLoading = false;
        this.toastr.error('Error while creating Query');
      });
    }
  }

//   ngOnDestroy(): void {
//     this.dtTrigger.unsubscribe();
//   }

//   rerender(): void {
//     this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
//       dtInstance.destroy();
//       this.dtTrigger.next();
//     });
//   }
  
  addCreds() {
    const creds = this.form.controls.credentials as FormArray;
    creds.push(this.fb.group({
      key: '',
      value: '',
    }));
  }

}

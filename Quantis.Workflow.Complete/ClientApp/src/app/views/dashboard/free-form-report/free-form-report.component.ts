import { Component, OnInit, ViewChild, ViewChildren, OnDestroy, QueryList, ElementRef } from '@angular/core';
import { FreeFormReportService } from '../../../_services';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-free-form-report',
  templateUrl: './free-form-report.component.html',
  styleUrls: ['./free-form-report.component.scss']
})

export class FreeFormReportComponent implements OnInit {
  @ViewChild('configModal') public configModal: ModalDirective;
  @ViewChild('viewAssignedModal') public viewAssignedModal: ModalDirective;
  @ViewChild('executeModal') public executeModal: ModalDirective;
  @ViewChild('parametersModal') public parametersModal: ModalDirective;

  assignedReportQueries: any = [];
  assignedQueriesBodyData: any = [];
  viewAssignedData: any = [];
  ownedReportQueries: any = [];
  reportQueryDetail: any = [];
  ownername;
  
  loading: boolean = true;
  formLoading: boolean = false;
  submitted: boolean = false;
  queryId=0;
  count=0;
  isSubmit=0;
  isReadonly=0;
  isDebug=0;
  debugResult;
  hideData=0;
  assignedUsers = [];
  params = {
    id: 0,
    ids: []
  }
  debugQueryData: any = [];
  debugQueryValue: any = [];
  editQueryData = {
    id: 0,
    QueryName: '',
    QueryText: '',
    Parameters: [{
      key: '',
      value: ''
    }]
  }
  executeQueryData = {
    QueryText: '',
    Parameters: [{
      key: '',
      value: ''
    }]
  }

  modalTitle: string = 'Users Assigned Queries';
  assigendModalTitle: string = 'Free Form Report Assegnati';
  ownedModalTitle: string = 'Propri Free Form Report';
  executeModalTitle: string = '';

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
  dtOptions3: DataTables.Settings = {};
  dtTrigger3 = new Subject();
  filters: any = {
    searchUsersText: ''
  }

  addEditQueryForm: FormGroup;
  Parameters: FormArray;

  constructor(
    private _freeFormReport: FreeFormReportService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder
  ) { }

  get f() { return this.addEditQueryForm.controls; }
  
  ngOnInit() {

    this.getReportQueryDetailByID();

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
    this.dtOptions3 = {
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
      Parameters: this.formBuilder.array([])
    });

    this.getReportsData();

    this.debugQueryData = [];
    this.debugQueryValue = [];
  }

  createParameters(): FormGroup {
    return this.formBuilder.group({
      key: '',
      value: ''
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.dtTrigger2.next();
    this.dtTrigger3.next();
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

  onQueryReportFormSubmit(event) {
    console.log('submit form -> ',this.addEditQueryForm.value);
    if(event=='debug'){
      this.debug();
    }else{
      this.submitted = true;
      if (this.addEditQueryForm.invalid) {
      } else {
        this.formLoading = true;
        this._freeFormReport.addEditReportQuery(this.addEditQueryForm.value).subscribe(dashboardCreated => {
          //this.getReportsData();
          this.formLoading = false;
          this.submitted = false;
          //this.addEditQueryForm.reset();
          this.getOwnedQueries();
          this.getAssignedQueries();
          this.toastr.success('Query created successfully');
        }, error => {
          this.formLoading = false;
          this.toastr.error('Error while creating Query');
        });
      }
      this.isSubmit=1;
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
  }

  rerender(): void {
    this.datatableElements.forEach((dtElement: DataTableDirective) => {
      dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
        this.dtTrigger2.next();
        this.dtTrigger3.next();
      });
    });
  }

  populateAssignedUsers(data,event){ 
    if(event.target.checked==true){   
      this.assignedUsers[this.count] = data.ca_bsi_user_id;
      this.count++;
    }
  }

  save(){
    this.params.id = this.queryId;
    this.params.ids = this.assignedUsers;

    //console.log('save -> ',this.params.id,this.params.ids);

    this.toastr.info('Valore in aggiornamento..', 'Confirm');
    this._freeFormReport.setUserPermission(this.params).subscribe(data => {
      this.toastr.success('Valore Aggiornato', 'Success');
      this.hideConfigModal();
      this.getAssignedQueries();
      this.rerender();
    }, error => {
      this.toastr.error('Errore durante update.', 'Error');
      this.hideConfigModal();
    });
  }

  getReportQueryDetailByID(){
    this._freeFormReport.getReportQueryDetailByID().subscribe(data => {
      this.reportQueryDetail = data;
      console.log('reportQueryDetail -> ',this.reportQueryDetail);
    });
  }

  getOwnedQueries(){
    this._freeFormReport.getOwnedReportQueries().subscribe(data => {
      this.ownedReportQueries = data;
    });
  }
  
  getAssignedQueries(){
    this._freeFormReport.getAssignedReportQueries().subscribe(data => {
      this.assignedReportQueries = data;
    });
  }

  deleteQuery(data){
    this.toastr.info('Valore in aggiornamento..', 'Confirm');
    this._freeFormReport.DeleteReportQuery(data.id).subscribe(data => {
      this.getOwnedQueries();
      this.getAssignedQueries();
      this.toastr.success('Valore Aggiornato', 'Success');
    }, error => {
      this.toastr.error('Errore durante update.', 'Error');
    });
  }

  onCancel(dismissMethod: string): void {
    console.log('Cancel ', dismissMethod);
  }

  showConfigModal(row) {
    this.queryId = row.id;
    this._freeFormReport.GetAllUsersAssignedQueries(row.id).subscribe(data => {
      //console.log('GetAllUsersAssignedQueries -> ',data);
      this.assignedQueriesBodyData = data;
      this.configModal.show();
     });  
  }

  hideConfigModal() {
    this.configModal.hide();
  }

  showViewModal() {
    this.viewAssignedModal.show();
  }

  hideViewModal() {
    this.viewAssignedModal.hide();
  }
  
  showExecuteModal() {
    this.executeModal.show();
  }

  hideExecuteModal() {
    this.executeModal.hide();
  }

  showParametersModal() {
    this.parametersModal.show();
  }

  hideParametersModal() {
    this.parametersModal.hide();
  }

  viewAssigned(data){
    this.ownername = data.ownername;
    this._freeFormReport.getReportQueryDetailByID(data.id).subscribe(data => {
      this.viewAssignedData = data;
      console.log('viewAssignedData -> ',this.viewAssignedData)
      this.showViewModal();
    });
  }

  clearData(){
    this.debugQueryData = [];
    this.debugQueryValue = [];
  }

  valueCount = 0;
  // executeAssigned(data){
  //   this.valueCount = 0;
  //   this.clearData();
    
  //   this._freeFormReport.getReportQueryDetailByID(data.id).subscribe(data => {   
  //     this.executeQueryData.QueryText = data.querytext;
  //     this.executeQueryData.Parameters = data.parameters;
  //     console.log('Debug -> ',this.executeQueryData);

  //     this._freeFormReport.ExecuteReportQuery(this.executeQueryData).subscribe(data => {
  //       this.debugQueryData = Object.keys(data[0]);
  //       Object.keys(data[0]).forEach(key => {
  //         this.debugQueryValue[this.valueCount] = data[0][key];  
  //         this.valueCount++; 
  //       });
  //       console.log('Debug Result -> ',this.debugQueryData);
  //     });
  //   });
  // }

  editQuery(data,table){
    if(table=='owned'){
      this.isReadonly=0;
      this.executeModalTitle = this.ownedModalTitle;
    }else if(table=='assigned'){
      this.isReadonly=1;
      this.executeModalTitle = this.assigendModalTitle;
    }
    
    this._freeFormReport.getReportQueryDetailByID(data.id).subscribe(data => { 
      this.editQueryData.id = data.id;
      this.editQueryData.QueryName = data.queryname;
      this.editQueryData.QueryText = data.querytext;
      console.log('data.parameters -> ',data.parameters.length);
      if(data.parameters.length==0){   
      }else{
        this.editQueryData.Parameters = data.parameters;
        let a = this.addEditQueryForm.get('Parameters') as FormArray;
        a.push(this.createParameters());
      }
      this.addEditQueryForm.patchValue(this.editQueryData);
      console.log('Edit Query -> ',this.addEditQueryForm);
      this.showParametersModal();
    });
    //this.showViewModal();
    (this.addEditQueryForm.get("Parameters") as FormArray)['controls'].splice(0);
  }

  debug(){
    this.hideData=0;
    this.valueCount = 0;
    this.clearData();
    
    this.executeQueryData.QueryText = this.addEditQueryForm.value.QueryText;
    this.executeQueryData.Parameters = this.addEditQueryForm.value.Parameters;
    //console.log('Debug -> ',this.executeQueryData);
    this._freeFormReport.ExecuteReportQuery(this.executeQueryData).subscribe(data => {
      this.debugResult = data;
      console.log('Debug Result -> ',data);
      ////////////// Setting Key ///////////////
      this.debugQueryData = Object.keys(data[0]);
      ////////////// Setting Value ///////////////
      Object.keys(data[0]).forEach(key => {
        this.debugQueryValue[this.valueCount] = data[0][key];  
        this.valueCount++; 
      });
      //console.log('debugQueryValue -> ',this.debugQueryValue); 
      this.isDebug=1;
      if(data[0]=='O'){
        this.toastr.error('Errore esecuzione Free Form Report. ' +this.debugResult, 'Error');
        this.hideData=1;
      }
    });
    this.hideParametersModal();
  }
  

}

import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkFlowService, AuthService } from '../../_services';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileSaverService } from 'ngx-filesaver';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, forkJoin } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import * as moment from 'moment';
import { tick } from '@angular/core/src/render3';

const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';

declare var $;
let $this;

@Component({
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss']
})
export class KPIComponent implements OnInit, OnDestroy {

  @ViewChild('successModal') public successModal: ModalDirective;
  @ViewChild('infoModal') public infoModal: ModalDirective;
  @ViewChild('approveModal') public approveModal: ModalDirective;
  @ViewChild('rejectModal') public rejectModal: ModalDirective;
  @ViewChild('monthSelect') monthSelect: ElementRef;
  @ViewChild('yearSelect') yearSelect: ElementRef;

  submitted = false;
  allTickets: any = [];
  getTicketHistories: any = [];
  getTicketAttachments: any = [];
  loading: boolean = true;
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  // dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  dtTrigger = new Subject();
  bsValue = new Date();
  setActiveTicketId: Number;
  approveForm: FormGroup;
  rejectForm: FormGroup;
  selectedTickets: any = [];
  verificaCheckBoxForm: FormGroup;
  fileUploading = false;
  public uploader: FileUploader = new FileUploader({ url: URL });
  selectedAll: any;
  monthOption;
  yearOption;
  ticketsStatus: any = [];
  constructor(
    private router: Router,
    private workFlowService: WorkFlowService,
    private _FileSaverService: FileSaverService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    $this = this;
  }

  get approveValues() { return this.approveForm.controls; }
  get rejectValues() { return this.rejectForm.controls; }

  ngOnInit() {
    this.monthOption = moment().subtract(1, 'months').format('MM');
    this.yearOption = moment().format('YY');
    this.verificaCheckBoxForm = this.formBuilder.group({
      selectTicket: [''],
      selectAllTickets: ['']
    });
    this.approveForm = this.formBuilder.group({
      description: ['']
    });

    this.rejectForm = this.formBuilder.group({
      description: ['', [Validators.required]]
    });

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: false, // check here.
      dom: 'Bfrtip',
      search: {
        caseInsensitive: true
      },
      "columnDefs": [{
        "targets": 0,
        "orderable": false,
        "visible": true,
        "searchable": false
      },
    ],
      buttons: [
        {
          extend: 'colvis',
          text: '<i class="fa fa-file"></i> Toggle Columns',
          titleAttr: 'Toggle Columns',
          collectionLayout: 'fixed three-column',
          className: 'btn btn-primary mb-3'
        },
        {
          extend: 'csv',
          text: '<i class="fa fa-file"></i> Esporta CSV',
          titleAttr: 'Esporta CSV',
          className: 'btn btn-primary mb-3'
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

  }

  _getAllTickets() {
    this.workFlowService.getTicketsVerificationByUserVerifica(`${this.monthOption}/${this.yearOption}`).pipe(first()).subscribe(data => {
      console.log('getTicketsVerificationByUserVerifica', data);
      const appendSelectFalse = data.map(ticket => ({ ...ticket, selected: false }));
      this.allTickets = appendSelectFalse;
      //this.dtTrigger.next();
      this.rerender();
      this.loading = false;
    }, error => {
      console.error('getTicketsVerificationByUserVerifica', error);
      this.loading = false;
    });
  }

  onDataChange() {
    //this.rerender();
    this.loading = true;
    this._getAllTickets();
  }

  ngAfterViewInit() {
    // debugger
    this.dtTrigger.next();
    //this.setUpDataTableDependencies();
    this._getAllTickets();
  }
  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      //this.setUpDataTableDependencies();
    });
  }
  ticketActions(ticket) {
    this.loading = true;
    this.setActiveTicketId = +ticket.id;
    this.workFlowService.getTicketHistory(ticket.id).pipe(first()).subscribe(data => {
      if (!!data) {
        this.getTicketHistories = data;
        console.log('ticketActions', data);
      }
      this.successModal.show();
      this.loading = false;
    }, error => {
      this.loading = false;
    });

  }


  ticketAttachments(ticket) {
    this.loading = true;
    this.setActiveTicketId = +ticket.id;
    this.workFlowService.getAttachmentsByTicket(ticket.id).pipe(first()).subscribe(data => {
      if (!!data) {
        this.getTicketAttachments = data;
        console.log('ticketAttachments', data);
      }
      this.infoModal.show();
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  downloadFile(fileName, fileHandler) {
    let extension = fileName.split('.').pop();
    let prefix = '';

    this.workFlowService.downloadAttachment(fileHandler).pipe(first()).subscribe(base64Data => {
      if (extension === 'pdf') {
        prefix = `data:application/pdf;base64,${base64Data}`;
      } else if (extension === 'png') {
        prefix = `data:image/png;base64,${base64Data}`;
      } else if (extension === 'jpg') {
        prefix = `data:image/jpg;base64,${base64Data}`;
      } else if (extension === 'csv') {
        prefix = `data:application/octet-stream;base64,${base64Data}`;
      } else if (extension === 'xlsx') {
        prefix = `data:application/vnd.ms-excel;base64,${base64Data}`;
      } else if (extension === 'txt') {
        prefix = `data:text/plain;base64,${base64Data}`;
      } else {
        console.log('DOWNLOADED FILE COULD BE CORRUPTED')
        prefix = `data:text/plain;base64,${base64Data}`;
      }
      fetch(prefix).then(res => res.blob()).then(blob => {
        this._FileSaverService.save(blob, fileName);
      });
    }, error => {
      this.toastr.error('Error while downloading from Server.')
      console.error('downloadFile ==>', error)
    })
  }

  rejectTicket() {
    const selectedTickets = this.allTickets.filter(ticket => ticket.selected);
    this.selectedTickets = selectedTickets;
    if (this.selectedTickets.length > 0) {
      if(this.selectedTickets.length === 1) {
        this.rejectModal.show();
      } else {
        this.toastr.info('Please select only one ticket.');  
      }
    } else {
      this.toastr.info('Please select a Ticket.');
    }
  }

  approveTicket() {
    const selectedTickets = this.allTickets.filter(ticket => ticket.selected);
    this.selectedTickets = selectedTickets;
    if (this.selectedTickets.length > 0) {
      this.approveModal.show();
    } else {
      this.toastr.info('Please select a Ticket.');
    }
  }

  approveFormSubmit() {
    this.submitted = true;
    const { description } = this.approveValues;
    this.loading = true;

    let observables = new Array();
    for (let ticket of this.selectedTickets) {
      observables.push(this.workFlowService.escalateTicketbyID(ticket.id, ticket.status, description.value));
    }
    forkJoin(observables).subscribe(data => {
      this.toastr.success('Ticket approved', 'Success');
      console.log('approveFormSubmit', data);
      if (data) {
        this.ticketsStatus = data;
        this.ticketsStatus.forEach(status => {
          if(status.isbsistatuschanged) {
            this.toastr.success('Success', 'BSI status true.');
          } else {
            this.toastr.error('Error', 'BSI status false.');
          }
          if(status.issdmstatuschanged){
            this.toastr.success('Success', 'SDM status true');
          } else {
            this.toastr.success('Error', 'SDM status false');
          }
        });
        this._getAllTickets();
      }
      this.approveModal.hide();
      this.loading = false;
    }, error => {
      console.error('approveFormSubmit', error);
      this.toastr.error('Error while approving form', 'Error');
      this.loading = false;
    });
  }

  rejectFormSubmit() {
    this.submitted = true;
    if (this.rejectForm.invalid) {
      return;
    } else {
      const { description } = this.rejectValues;
      this.loading = true;

      let observables = new Array();
      for (let ticket of this.selectedTickets) {
        observables.push(this.workFlowService.transferTicketByID(ticket.id, ticket.status, description.value));
      }
      forkJoin(observables).subscribe(data => {
        console.log('rejectFormSubmit', data);
        this.toastr.success('Ticket rejected', 'Success');
        if (data) {
          this.ticketsStatus = data;
          this.ticketsStatus.forEach(status => {
            if(status.isbsistatuschanged) {
              this.toastr.success('Success', 'BSI status true.');
            } else {
              this.toastr.error('Error', 'BSI status false.');
            }
            if(status.issdmstatuschanged){
              this.toastr.success('Success', 'SDM status true');
            } else {
              this.toastr.success('Error', 'SDM status false');
            }
          });
          // show toastr on reject
          this._getAllTickets();
        }
        this.rejectModal.hide();
        this.loading = false;
      }, error => {
        console.error('rejectFormSubmit', error);
        this.toastr.error('Error while rejecting form', 'Error');
        this.loading = false;
      });
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  fileUploadUI() {
    if (this.uploader.queue.length > 0) {
      console.log('this.uploader', this.uploader);
      this.uploader.queue.forEach((element, index) => {
        let file = element._file;
        this._getUploadedFile(file);
      });
    } else {
      this.toastr.info('Please upload a file');
    }
  }

  _getUploadedFile(file) {
    this.fileUploading = true;
    const reader: FileReader = new FileReader();
    reader.onloadend = (function (theFile, self) {
      let fileName = theFile.name;
      return function (readerEvent) {
        let binaryString = readerEvent.target.result;
        let base64Data = btoa(binaryString);
        self.fileUploading = false;
        self.workFlowService.uploadAttachmentToTicket(self.setActiveTicketId, fileName, base64Data).pipe().subscribe(data => {
          console.log('uploadAttachmentToTicket ==>', data);
          self.fileUploading = false;
          self.uploader.queue.pop();
          self.toastr.success(`${fileName} uploaded successfully.`);
          if (data.status === 200 || data.status === 204) {
                self.workFlowService.getAttachmentsByTicket(self.setActiveTicketId).pipe(first()).subscribe(data => {
                  if (!!data) {
                    self.getTicketAttachments = data;
                    console.log('ticketAttachments', data);
                  }
                  self.loading = false;
                }, error => {
                  self.loading = false;
                });

          }
        }, error => {
          console.error('uploadAttachmentToTicket ==>', error);
          self.fileUploading = false;
          self.toastr.error('Some error occurred while uploading file');
        });
      };
    })(file, this);
    reader.readAsBinaryString(file); // return only base64 string
  }

  selectAll() {
    for (var i = 0; i < this.allTickets.length; i++) {
      if(!this.allTickets[i].isclosed) {
        this.allTickets[i].selected = this.selectedAll;
      }
    }
  }

  checkIfAllSelected() {
    const notClosedTickets = this.allTickets.filter(ticket => !ticket.isclosed);

    this.selectedAll = notClosedTickets.every(function (ticket: any) {
      return ticket.selected == true;
    })
  }

  // search start

  setUpDataTableDependencies() {

    $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
      datatable_Ref.columns(12).every(function () {
        const that = this;
        that.search(moment().subtract(1, 'months').format('MM/YY')).draw();
        $($this.monthSelect.nativeElement).on('change', function () {
          that.search(`${$(this).val()}/${$this.yearSelect.nativeElement.value}`).draw();
        });
      });
    });

    $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
      datatable_Ref.columns(12).every(function () {
        const that = this;
        that.search(moment().subtract(1, 'months').format('MM/YY')).draw();
        $($this.yearSelect.nativeElement).on('change', function () {
          that.search(`${$this.monthSelect.nativeElement.value}/${$(this).val()}`).draw();
        });
      });
    });

  }
  //search end

}

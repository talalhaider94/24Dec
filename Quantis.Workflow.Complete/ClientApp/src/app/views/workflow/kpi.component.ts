import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
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

const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';
@Component({
  templateUrl: './kpi.component.html',
})
export class KPIComponent implements OnInit {

  @ViewChild('successModal') public successModal: ModalDirective;
  @ViewChild('infoModal') public infoModal: ModalDirective;
  @ViewChild('approveModal') public approveModal: ModalDirective;
  @ViewChild('rejectModal') public rejectModal: ModalDirective;

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
  fileUploading = true;
  public uploader: FileUploader = new FileUploader({ url: URL });

  constructor(
    private router: Router,
    private workFlowService: WorkFlowService,
    private _FileSaverService: FileSaverService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) { }

  get approveValues() { return this.approveForm.controls; }
  get rejectValues() { return this.rejectForm.controls; }

  ngOnInit() {
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
      dom: 'Bfrtip',
      // rowCallback: (row: Node, data: any[] | Object, index: number) => {
      //   const self = this;
      //   $('td', row).unbind('click');
      //   $('td', row).bind('click', () => {
      //     self.selectedTickets.push(data);
      //     console.log('DATA', data);
      //   });
      //   return row;
      // },
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
    this._getAllTickets();
  }

  _getAllTickets() {
    this.workFlowService.getTicketsVerificationByUserVerifica().pipe(first()).subscribe(data => {
      console.log('getAllTickets', data);
      this.allTickets = data;
      this.dtTrigger.next();
      this.loading = false;
    }, error => {
      console.error('getAllTickets', error);
      this.loading = false;
    });
  }

  ticketActions(ticket) {
    this.loading = true;
    this.setActiveTicketId = +ticket.id;
    this.workFlowService.getTicketHistory(ticket.id).pipe(first()).subscribe(data => {
      // this.getTicketHistories = data.filter(ticketHistory => ticketHistory.id === ticket.id);
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
      // this.getTicketAttachments = data.filter(ticketAttachment => ticketAttachment.id === ticket.id);
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
    if (this.selectedTickets.length > 0) {
      this.rejectModal.show();
    } else {
      this.toastr.info('Please select a Ticket.');
    }
  }

  approveTicket() {
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
      observables.push(this.workFlowService.escalateTicketbyID(ticket[1], ticket[5], description.value));
    }
    forkJoin(observables).subscribe(data => {
      // this._getAllTickets();
      this.toastr.success('Ticket approved', 'Success');
      this.loading = false;
    }, error => {
      this.toastr.error('Error while approving form', 'Error');
      this.loading = false;
    });
    // this.workFlowService.transferTicketByID('', '', description).pipe(first()).subscribe(data => {
    //   this.toastr.success('Ticket approved', 'Success');
    //   this.loading = false;
    // }, error => {
    //   console.log('approveFormSubmit: error', error);
    //   this.toastr.error('Error while approving form', 'Error');
    //   this.loading = false;
    // })

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
        observables.push(this.workFlowService.transferTicketByID(ticket[1], ticket[5], description.value));
      }
      forkJoin(observables).subscribe(data => {
        this.toastr.success('Ticket rejected', 'Success');
        // this._getAllTickets();
        this.loading = false;
      }, error => {
        this.toastr.error('Error while rejecting form', 'Error');
        this.loading = false;
      });

      // this.workFlowService.escalateTicketbyID('', '', description).pipe(first()).subscribe(data => {
      //   this.toastr.success('Ticket rejectd', 'Success');
      //   this.loading = false;
      // }, error => {
      //   console.log('rejectFormSubmit: error', error);
      //   this.toastr.error('Error while reject form', 'Error');
      //   this.loading = false;
      // })
    }
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
  
  onselectAllCheckboxChange(event) {
    this.verificaCheckBoxForm.setValue({ selectTicket: true, selectAllTickets: true })
  }
  onCheckboxChange(option, event) {
    if (event.target.checked) {
      this.selectedTickets.push(option);
    } else {
      if (this.selectedTickets.length > 0) {
        for (var i = 0; i < this.selectedTickets.length; i++) {
          if (this.selectedTickets[i].id == option.id) {
            this.selectedTickets.splice(i, 1);
          }
        }
      }
    }
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
        self.workFlowService.uploadAttachmentToTicket(self.setActiveTicketId, fileName, base64Data).pipe()
      };
    })(file, this);
    reader.readAsBinaryString(file); // return only base64 string
  }


}

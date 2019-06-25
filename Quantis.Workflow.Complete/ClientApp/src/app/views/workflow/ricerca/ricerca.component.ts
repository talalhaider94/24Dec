import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkFlowService } from '../../../_services';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileSaverService } from 'ngx-filesaver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ricerca',
  templateUrl: './ricerca.component.html',
  styleUrls: ['./ricerca.component.scss']
})
export class RicercaComponent implements OnInit, OnDestroy {
  @ViewChild('successModal') public successModal: ModalDirective;
  @ViewChild('infoModal') public infoModal: ModalDirective;
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
  public selected: any;
  constructor(
    private router: Router,
    private workFlowService: WorkFlowService,
    private _FileSaverService: FileSaverService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      dom: 'Bfrtip',
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
    this.workFlowService.getAllTickets().pipe(first()).subscribe(data => {
      console.log('getAllTickets', data);
      this.allTickets = data;
      this.dtTrigger.next();
      this.loading = false;
    }, error => {
      console.error('getAllTickets', error);
      this.loading = false;
    })
  }

  ticketActions(ticket) {
    this.loading = true;
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

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}

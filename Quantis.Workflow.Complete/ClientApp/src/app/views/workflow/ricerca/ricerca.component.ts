import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WorkFlowService } from '../../../_services';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';

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

  constructor(
    private router: Router,
    private workFlowService: WorkFlowService,
  ) { }

  ngOnInit() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      // Declare the use of the extension in the dom parameter
      dom: 'Bfrtip',
      // Configure the buttons
      buttons: [
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
    this.workFlowService.getTicketHistory().pipe(first()).subscribe(data => {
      this.getTicketHistories = data.filter(ticketHistory => ticketHistory.id === ticket.id);
      // this.getTicketHistories = data;
      this.successModal.show();
      this.loading = false;
    }, error => {
      this.loading = false;
    });
    
  }


  ticketAttachments(ticket) {
    this.loading = true;
    this.workFlowService.getAttachmentsByTicket().pipe(first()).subscribe(data => {
      // this.getTicketAttachments = data.filter(ticketAttachment => ticketAttachment.id === ticket.id);
      this.getTicketAttachments = data;
      this.infoModal.show();
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }


  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}

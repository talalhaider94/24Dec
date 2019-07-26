import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-amministrazione',
  templateUrl: './amministrazione.component.html',
  styleUrls: ['./amministrazione.component.scss']
})
export class AmministrazioneComponent implements OnInit {
  monthOption;
  yearOption;
  isCollapsed = true;
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  dtOptions: any = {};
  dtTrigger = new Subject();
  @ViewChild('successModal') public successModal: ModalDirective;
  approveForm: FormGroup;
  loading: boolean = true;
  ticket: any;
  approveModal: any;
  constructor() { }
  ngOnInit() {
    this.monthOption = moment().subtract(1, 'months').format('MM');
    this.yearOption = moment().format('YY');
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      destroy: false,
      dom: 'Bfrtip',
      search: {
        caseInsensitive: true
      },
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
        emptyTable: "Nessun Ticket Trovato.",
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

  openModal(row) {
    this.successModal.show();
  }
}

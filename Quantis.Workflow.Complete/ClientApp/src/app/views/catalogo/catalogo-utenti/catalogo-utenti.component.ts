import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

declare var $;
var $this;

@Component({
  selector: 'app-catalogo-utenti',
  templateUrl: './catalogo-utenti.component.html',
  styleUrls: ['./catalogo-utenti.component.scss']
})
export class CatalogoUtentiComponent implements OnInit {
  @ViewChild('UserTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild('searchCol2') searchCol2: ElementRef;
  @ViewChild('btnExportCSV') btnExportCSV: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;

  dtOptions: DataTables.Settings = {
    // 'dom': 'rtip',
    // 'pagingType': 'full_numbers'
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
    id: '',
    ca_bsi_account: '',
    name: '',
    surname: '',
    organization: '',
    mail: '',
    userid: '',
    manager: '',
    user_admin: '',
    user_sadmin: ''
  };

  dtTrigger: Subject<any> = new Subject();
  UtentiTableBodyData: any = [
    {
      id: '1',
      ca_bsi_account: 'BSI ACCOUNT',
      name: 'NOME',
      surname: 'COGNOME',
      organization: 'STRUTTURA',
      mail: 'MAIL',
      userid: 'USERID',
      manager: 'RESPONSABILE',
      user_admin: 'USER_ADMIN',
      user_sadmin: 'USER_SADMIN'
    }
  ]

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
  ) {
    $this = this;
  }
  
  ngOnInit() {
  }

  populateModalData(data) {
    this.modalData.id = data.id;
    this.modalData.ca_bsi_account = data.ca_bsi_account;
    this.modalData.name = data.name;
    this.modalData.surname = data.surname;
    this.modalData.organization = data.organization;
    this.modalData.mail = data.mail;
    this.modalData.userid = data.userid;
    this.modalData.manager = data.manager;
    this.modalData.user_admin = data.user_admin;
    this.modalData.user_sadmin = data.user_sadmin;
  }

  updateUtenti() {
    this.toastr.info('Valore in aggiornamento..', 'Info');
    this.apiService.updateCatalogUtenti(this.modalData).subscribe(data => {
      this.getUsers(); // this should refresh the main table on page
      this.toastr.success('Valore Aggiornato', 'Success');
      $('#utentiModal').modal('toggle').hide();
    }, error => {
      this.toastr.error('Errore durante update.', 'Error');
      $('#utentiModal').modal('toggle').hide();
    });
  }
 
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();

    this.setUpDataTableDependencies();
    //this.getUsers1();
    this.getUsers();

    /*this.apiService.getCatalogoUsers().subscribe((data:any)=>{
      this.UtentiTableBodyData = data;
      this.rerender();
    });*/
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

  // getKpiTableRef(datatableElement: DataTableDirective): any {
  //   return datatableElement.dtInstance;
  // }

  setUpDataTableDependencies(){
      // #column3_search is a <input type="text"> element
      $(this.searchCol1.nativeElement).on( 'keyup', function () {
        $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
        datatable_Ref
            .columns( 1 )
            .search( this.value )
            .draw();
      });
      });
      $(this.searchCol2.nativeElement).on( 'keyup', function () {
        $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
        datatable_Ref
            .columns( 2 )
            .search( this.value )
            .draw();
      });
      });

      // export only what is visible right now (filters & paginationapplied)
      $(this.btnExportCSV.nativeElement).click(function (event) {
          event.preventDefault();
          $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
          $this.table2csv(datatable_Ref, 'visible', '.kpiTable');
        });
      });
    }

    table2csv(oTable, exportmode, tableElm) {
      var csv = '';
      var headers = [];
      var rows = [];
  
      // Get header names
      $(tableElm+' thead').find('th').each(function() {
          var $th = $(this);
          var text = $th.text();
          var header = '"' + text + '"';
          // headers.push(header); // original code
          if(text != "") headers.push(header); // actually datatables seems to copy my original headers so there ist an amount of TH cells which are empty
      });
      csv += headers.join(',') + "\n";
  
      // get table data
      if (exportmode == "full") { // total data
          var totalRows = oTable.data().length;
          for(let i = 0; i < totalRows; i++) {
              var row = oTable.row(i).data();
              console.log(row)
              row = $this.strip_tags(row);
              rows.push(row);
          }
      } else { // visible rows only
          $(tableElm+' tbody tr:visible').each(function(index) {
              var row = [];
              $(this).find('td').each(function(){
                  var $td = $(this);
                  var text = $td.text();
                  var cell = '"' +text+ '"';
                  row.push(cell);
              });
              rows.push(row);
          })
      }
      csv += rows.join("\n");
       console.log(csv);
      var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "CatalogUtenti.csv");
    }
  
    strip_tags(html) {
      var tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent||tmp.innerText;
    }

  getUsers() {
    this.apiService.getCatalogoUsers().subscribe((data) => {
      this.UtentiTableBodyData = data;
      this.rerender();
    });
  }
  /*getUsers1() {
    this.apiService.getCatalogoUsers().subscribe((data: any) => {
    });
  }*/

  }

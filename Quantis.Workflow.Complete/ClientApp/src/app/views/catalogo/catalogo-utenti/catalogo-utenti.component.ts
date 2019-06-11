import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';

declare var $;
var $this;

@Component({
  selector: 'app-catalogo-utenti',
  templateUrl: './catalogo-utenti.component.html',
  styleUrls: ['./catalogo-utenti.component.scss']
})
export class CatalogoUtentiComponent implements OnInit {
  @ViewChild('kpiTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild('searchCol2') searchCol2: ElementRef;
  @ViewChild('btnExportCSV') btnExportCSV: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;


  dtOptions: DataTables.Settings = {
    'dom': 'rtip',
    'pagingType': 'full_numbers'
  };


  modalData = {
    BSI_ACCOUNT: '',
    NOME: '',
    COGNOME: '',
    STRUTTURA: '',
    MAIL: '',
    USERID: '',
    RESPONSABILE: ''
  };

  UtentiTableBodyData: any = [
    {
      id: '1',
      BSI_ACCOUNT: 'BSI ACCOUNT',
      NOME: 'NOME',
      COGNOME: 'COGNOME',
      STRUTTURA: 'STRUTTURA',
      MAIL: 'MAIL',
      USERID: 'USERID',
      RESPONSABILE: 'RESPONSABILE'
    }
  ]

  constructor(private apiService: ApiService) {
    $this = this;
  }
  
    ngOnInit() {
    }


  populateModalData(data) {
    this.modalData.BSI_ACCOUNT = data.ca_bsi_account;
    this.modalData.NOME = data.name;
    this.modalData.COGNOME = data.surname;
    this.modalData.STRUTTURA = data.organization;
    this.modalData.MAIL = data.mail;
    this.modalData.USERID = data.userid;
    this.modalData.RESPONSABILE = data.manager;
  }

  updateUtenti() {
    this.apiService.updateCatalogUtenti(this.modalData).subscribe((data: any) => {
      this.getUsers(); // this should refresh the main table on page
    });
  }

  getUsers() {
    this.apiService.getCatalogoUsers().subscribe((data) =>{
      this.UtentiTableBodyData = data;
      console.log('Configs ', data);
    });
  }
  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.getKpiTableRef(this.datatableElement).then((dataTable_Ref)=>{
      this.setUpDataTableDependencies(dataTable_Ref);
    });
    this.apiService.getCatalogoUsers().subscribe((data)=>{
      this.UtentiTableBodyData = data;
      console.log('kpis ', data);
    })
  }

  getKpiTableRef(datatableElement: DataTableDirective): any {
    return datatableElement.dtInstance;
  }

  setUpDataTableDependencies(datatable_Ref){
      // #column3_search is a <input type="text"> element
      $(this.searchCol1.nativeElement).on( 'keyup', function () {
        datatable_Ref
            .columns( 1 )
            .search( this.value )
            .draw();
      });
      $(this.searchCol2.nativeElement).on( 'keyup', function () {
        datatable_Ref
            .columns( 2 )
            .search( this.value )
            .draw();
      });
   
   
      // export only what is visible right now (filters & paginationapplied)
      $(this.btnExportCSV.nativeElement).click(function (event) {
          event.preventDefault();
          //$this.table2csv(datatable_Ref, 'visible', 'table.dataTables-reports');
          $this.table2csv(datatable_Ref, 'full', 'table.dataTables-reports');
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
    
  }

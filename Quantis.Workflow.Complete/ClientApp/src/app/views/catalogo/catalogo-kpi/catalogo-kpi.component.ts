import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';
import { Subject } from 'rxjs';

declare var $;
let $this;


@Component({
  selector: 'app-catalogo-kpi',
  templateUrl: './catalogo-kpi.component.html',
  styleUrls: ['./catalogo-kpi.component.scss']
})
export class CatalogoKpiComponent implements OnInit {



  constructor(private apiService: ApiService) {
    $this = this;
  }
  public des = '';
  public ref: any[] ;
  public reft: string;
  public ref1: string;
  public ref2: string;
  public ref3: string;




  @ViewChild('kpiTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild('searchCol2') searchCol2: ElementRef;
  @ViewChild('searchCol3') searchCol3: ElementRef;
  @ViewChild('searchCol4') searchCol4: ElementRef;
  @ViewChild('searchCol5') searchCol5: ElementRef;
  @ViewChild('btnExportCSV') btnExportCSV: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;


  dtOptions: DataTables.Settings = {
    //'dom': 'rtip',
    // "columnDefs": [{
    // "targets": [0,2],
    // "data": null,
    // "defaultContent": '<input type="checkbox" />'
    // }]
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
    contract: '',
    id_kpi: '',
    short_name: '',
    source_type: '',
    tracking_period: '',
    wf_last_sent: '',
    rm_last_sent: ''
  };

  dtTrigger: Subject<any> = new Subject();
  kpiTableHeadData = [
    {
      ABILITATO: 'ABILITATO',
      REMINDER: 'REMINDER',
      WORKFLOW: 'WORKFLOW',
      CONTRACT: 'CONTRACT',
      ID_KPI: 'ID_KPI',
      TITOLO_BREVE: 'TITOLO_BREVE',
      CARICAMENTO: 'CARICAMENTO',
      FREQUENZA: 'FREQUENZA',
      DATA_WF: 'DATA_WF',
      DATA_WM: 'DATA_WM',
      REFERENTI: 'REFERENTI',
      CALCOLO: 'CALCOLO'
    }];

  kpiTableBodyData: any = [
    {
      id: '1',
      short_name: '',
      group_type: '',
      id_kpi: '',
      id_form: '',
      kpi_description: '',
      source_type: '',
      tracking_period: '',
      wf_last_sent: '',
      rm_last_sent: '',
      measure_unit: '',
      contract: ''
    }
  ];

  coloBtn( id: string): void {
    this.des = id;
  }


  refren( idd: string): void {
    console.log(idd);


    console.log(this.kpiTableBodyData);
    for (const i of this.kpiTableBodyData) {
      if (i.id == idd) {
        this.reft = i.referent;
        this.ref1 = i.referent_1;
        this.ref2 = i.referent_2;
        this.ref3 = i.referent_3;

      }
    }
  }


  ngOnInit() {
  }


  populateModalData(data) {
    this.modalData.contract = data.contract;
    this.modalData.id_kpi = data.id_kpi;
    this.modalData.short_name = data.short_name;
    this.modalData.source_type = data.source_type;
    this.modalData.tracking_period = data.tracking_period;
    this.modalData.wf_last_sent = data.wf_last_sent;
    this.modalData.rm_last_sent = data.rm_last_sent;
  }

  updateKpi() {
    this.apiService.updateCatalogKpi(this.modalData).subscribe((data: any) => {
      this.getKpis(); // this should refresh the main table on page
    });
  }

  // getKpis() {
  //   this.apiService.getCatalogoKpis().subscribe((data) =>{
  //     this.kpiTableBodyData = data;
  //     console.log('Kpis ', data);
  //   });
  // }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();

    this.setUpDataTableDependencies();
    this.getKpis();
    this.apiService.getCatalogoKpis().subscribe((data:any)=>{
      this.kpiTableBodyData = data;
      this.rerender();
    });
    // this.getKpiTableRef(this.datatableElement).then((dataTable_Ref) => {
    //   this.setUpDataTableDependencies(dataTable_Ref);
    // });
    // this.apiService.getCatalogoKpis().subscribe((data) => {
    //   this.kpiTableBodyData = data;
    //   console.log('kpis ', data);
    // });
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
  //   // .then((dtInstance: DataTables.Api) => {
  //   //     console.log(dtInstance);
  //   // });
  // }



  setUpDataTableDependencies() {

    // let datatable_Ref = $(this.block.nativeElement).DataTable({
    //   'dom': 'rtip'
    // });

    // #column3_search is a <input type="text"> element
    $(this.searchCol1.nativeElement).on( 'keyup', function () {
      $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
        datatable_Ref
          .columns(4)
          .search(this.value)
          .draw();
      });
    });



    $(this.searchCol2.nativeElement).on( 'keyup', function () {
      $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
      datatable_Ref
        .columns( 5 )
        .search( this.value )
        .draw();
    });
    });
    $(this.searchCol3.nativeElement).on( 'keyup', function () {
      $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
      datatable_Ref
        .columns( 10 )
        .search( this.value )
        .draw();
    });
    });

    $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
    datatable_Ref.columns(3).every( function () {
      const that = this;

      // Create the select list and search operation
      const select = $($this.searchCol4.nativeElement)
        .on( 'change', function () {
          that
            .search( $(this).val() )
            .draw();
        } );

      // Get the search data for the first column and add to the select list
      this
        .cache( 'search' )
        .sort()
        .unique()
        .each( function ( d ) {
          select.append( $('<option value="' + d + '">' + d + '</option>') );
        } );
    });
    });

    $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
    datatable_Ref.columns(7).every( function () {
      const that = this;

      // Create the select list and search operation
      const select = $($this.searchCol5.nativeElement)
        .on( 'change', function () {
          that
            .search( $(this).val() )
            .draw();
        } );

      // Get the search data for the first column and add to the select list
      this
        .cache( 'search' )
        .sort()
        .unique()
        .each( function ( d ) {
          select.append( $('<option value="' + d + '">' + d + '</option>') );
        } );
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
    var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
    saveAs(blob, 'KpiTable.csv');
  }

  strip_tags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
  }

  getKpis(){
    this.apiService.getCatalogoKpis().subscribe((data: any) => {
    });
  }

}

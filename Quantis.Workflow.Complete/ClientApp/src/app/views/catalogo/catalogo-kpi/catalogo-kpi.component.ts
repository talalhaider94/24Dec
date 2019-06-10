import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';

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
    'dom': 'rtip',
    // "columnDefs": [{
    // "targets": [0,2],
    // "data": null,
    // "defaultContent": '<input type="checkbox" />'
    // }]
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
      short_name: 'short name',
      group_type: 'group type',
      id_kpi: 'id kpi',
      id_form: 'id form',
      kpi_description: 'kpi description',
      source_type: 'source_type',
      tracking_period: 'tracking_period',
      wf_last_sent: 'wf_last_sent',
      rm_last_sent: 'rm_last_sent',
      measure_unit: 'measure unit',
      contract: 'contract'
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

  getKpis() {
    this.apiService.getCatalogoKpis().subscribe((data) =>{
      this.kpiTableBodyData = data;
      console.log('Kpis ', data);
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.getKpiTableRef(this.datatableElement).then((dataTable_Ref) => {
      this.setUpDataTableDependencies(dataTable_Ref);
    });
    this.apiService.getCatalogoKpis().subscribe((data) => {
      this.kpiTableBodyData = data;
      console.log('kpis ', data);
    });
  }

  getKpiTableRef(datatableElement: DataTableDirective): any {
    return datatableElement.dtInstance;
    // .then((dtInstance: DataTables.Api) => {
    //     console.log(dtInstance);
    // });
  }



  setUpDataTableDependencies(datatable_Ref) {

    // let datatable_Ref = $(this.block.nativeElement).DataTable({
    //   'dom': 'rtip'
    // });

    // #column3_search is a <input type="text"> element
    $(this.searchCol1.nativeElement).on( 'keyup', function () {
      datatable_Ref
        .columns( 4 )
        .search( this.value )
        .draw();
    });



    $(this.searchCol2.nativeElement).on( 'keyup', function () {
      datatable_Ref
        .columns( 5 )
        .search( this.value )
        .draw();
    });
    $(this.searchCol3.nativeElement).on( 'keyup', function () {
      datatable_Ref
        .columns( 10 )
        .search( this.value )
        .draw();
    });
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
    } );
    datatable_Ref.columns(9).every( function () {
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
    } );


    // export only what is visible right now (filters & paginationapplied)
    $(this.btnExportCSV.nativeElement).click(function (event) {
      event.preventDefault();
      // $this.table2csv(datatable_Ref, 'visible', 'table.dataTables-reports');
      $this.table2csv(datatable_Ref, 'full', 'table.dataTables-reports');
    });
  }

  table2csv(oTable, exportmode, tableElm) {
    let csv = '';
    const headers = [];
    const rows = [];

    // Get header names
    $(tableElm + ' thead').find('th').each(function() {
      const $th = $(this);
      const text = $th.text();
      const header = '"' + text + '"';
      // headers.push(header); // original code
      // tslint:disable-next-line:max-line-length
      if (text != '') { headers.push(header); } // actually datatables seems to copy my original headers so there ist an amount of TH cells which are empty
    });
    csv += headers.join(',') + '\n';

    // get table data
    if (exportmode == 'full') { // total data
      const totalRows = oTable.data().length;
      for (let i = 0; i < totalRows; i++) {
        let row = oTable.row(i).data();
        console.log(row);
        row = $this.strip_tags(row);
        rows.push(row);
      }
    } else { // visible rows only
      $(tableElm + ' tbody tr:visible').each(function(index) {
        const row = [];
        $(this).find('td').each(function() {
          const $td = $(this);
          const text = $td.text();
          const cell = '"' + text + '"';
          row.push(cell);
        });
        rows.push(row);
      });
    }
    csv += rows.join('\n');
    console.log(csv);
    const blob = new Blob([csv], {type: 'text/plain;charset=utf-8'});
    // saveAs(csv, "myfile.txt")
    saveAs(blob, 'myfile.txt');
  }

  strip_tags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
  }



}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';

declare var $;
var $this;


@Component({
  templateUrl: './archivedkpi.component.html'
})
export class ArchivedKpiComponent implements OnInit {
  @ViewChild('ArchivedkpiTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
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
    id_kpi: '',
    name_kpi: '',
    interval_kpi: '',
    value_kpi: '',
    ticket_id: '',
    close_timestamp_ticket: '',
    archived: ''
  };

  ArchivedKpiBodyData: any = [
    {
      id_kpi: 'id_kpi',
      name_kpi: 'name_kpi',
      interval_kpi: 'interval_kpi',
      value_kpi: 'value_kpi',
      ticket_id: 'ticket_id',
      close_timestamp_ticket: 'close_timestamp_ticket',
      archived: 'archived'
    }
  ]
  constructor(private apiService: ApiService) {
    $this = this;
  }

  ngOnInit() {
  }

  populateModalData(data) {
    this.modalData.id_kpi = data.id_kpi;
    this.modalData.name_kpi = data.name_kpi;
    this.modalData.interval_kpi = data.interval_kpi;
    this.modalData.value_kpi = data.value_kpi;
    this.modalData.ticket_id = data.ticket_id;
    this.modalData.close_timestamp_ticket = data.close_timestamp_ticket;
    this.modalData.archived = data.archived;
  }

  getKpis() {
    this.apiService.getArchivedKpis().subscribe((data) =>{
      this.ArchivedKpiBodyData = data;
      console.log('Archived Kpis ', data);
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.getKpiTableRef(this.datatableElement).then((dataTable_Ref) => {
      this.setUpDataTableDependencies(dataTable_Ref);
    });
    this.apiService.getArchivedKpis().subscribe((data) => {
      this.ArchivedKpiBodyData = data;
      console.log('kpis ', data);
    });
  }

  getKpiTableRef(datatableElement: DataTableDirective): any {
    return datatableElement.dtInstance;
  }

  setUpDataTableDependencies(datatable_Ref){

    // #column3_search is a <input type="text"> element
    $(this.searchCol1.nativeElement).on( 'keyup', function () {
      datatable_Ref
        .columns( 0 )
        .search( this.value )
        .draw();
    });

  }

  strip_tags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
  }


}

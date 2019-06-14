import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject } from 'rxjs';

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
    id_kpi: '',
    name_kpi: '',
    interval_kpi: '',
    value_kpi: '',
    ticket_id: '',
    close_timestamp_ticket: '',
    archived: ''
  };

  kpisData = [];

  dtTrigger: Subject<any> = new Subject();
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
  monthVar: any;
  yearVar: any;
  constructor(private apiService: ApiService) {
    $this = this;
  }

  ngOnInit() {
  }

  populateModalData(data) {
    // this.modalData.id_kpi = data.id_kpi;
    // this.modalData.name_kpi = data.name_kpi;
    // this.modalData.interval_kpi = data.interval_kpi;
    // this.modalData.value_kpi = data.value_kpi;
    // this.modalData.ticket_id = data.ticket_id;
    // this.modalData.close_timestamp_ticket = data.close_timestamp_ticket;
    // this.modalData.archived = data.archived;
    this.apiService.getAllArchivedKpis(data.id_kpi).subscribe((kpis: any) => {
      this.kpisData = kpis;
    });

  }

  populateDateFilter() {
    this.apiService.getDateKpis(this.monthVar, this.yearVar).subscribe((data: any) => {
      this.ArchivedKpiBodyData = data;
      this.rerender();
    });

  }


  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();

    this.setUpDataTableDependencies();
    this.getKpis1();

    this.apiService.getArchivedKpis().subscribe((data:any)=>{
      this.ArchivedKpiBodyData = data;
      this.rerender();
    });
  }


  // ngOnDestroy(): void {
  //   // Do not forget to unsubscribe the event
  //   this.dtTrigger.unsubscribe();
  // }

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
          .columns( 0 )
          .search( this.value )
          .draw();
      });
    });

  }

  strip_tags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
  }

  getKpis() {
    this.apiService.getArchivedKpis().subscribe((data) =>{
      this.ArchivedKpiBodyData = data;
      console.log('Archived Kpis ', data);
    });
  }

  getKpis1() {
    this.apiService.getArchivedKpis().subscribe((data: any) => {
    });
  }

}

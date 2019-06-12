import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject } from 'rxjs';

declare var $;
var $this;


@Component({
  templateUrl: './tconfiguration.component.html'
})

export class TConfigurationComponent implements OnInit {
  @ViewChild('ConfigurationTable') block: ElementRef;
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
    key: '',
    value: ''
  };

  dtTrigger: Subject<any> = new Subject();
  ConfigTableBodyData: any = [
    {
      key: 'key',
      value: 'value'
    }
  ]

  constructor(private apiService: ApiService) {
    $this = this;
  }

  ngOnInit() {
  }

  populateModalData(data) {
    this.modalData.key = data.key;
    this.modalData.value = data.value;
  }

  updateConfig() {
    this.apiService.updateConfig(this.modalData).subscribe((data: any) => {
      this.getCOnfigurations(); // this should refresh the main table on page
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();

    this.setUpDataTableDependencies();
    this.getCOnfigurations1();

    this.apiService.getConfigurations().subscribe((data:any)=>{
      this.ConfigTableBodyData = data;
      this.rerender();
    });
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

  // getConfigTableRef(datatableElement: DataTableDirective): any {
  //   return datatableElement.dtInstance;
  //   // .then((dtInstance: DataTables.Api) => {
  //   //     console.log(dtInstance);
  //   // });
  // }

  setUpDataTableDependencies(){
    // let datatable_Ref = $(this.block.nativeElement).DataTable({
    //   'dom': 'rtip'
    // });

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

  getCOnfigurations() {
    this.apiService.getConfigurations().subscribe((data) =>{
      this.ConfigTableBodyData = data;
      console.log('Configs ', data);
    });
  }

  getCOnfigurations1() {
    this.apiService.getConfigurations().subscribe((data: any) => {
    });

  }
}

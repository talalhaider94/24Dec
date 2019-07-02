import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

declare var $;
var $this;


@Component({
  templateUrl: './sdmstatus.component.html'
})

export class SdmStatusComponent implements OnInit {
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
    id: '',
    handle: '',
    step: '',
    name: ''
  };

  addData = {
    handle: '',
    step: '',
    name: ''
  };

  dtTrigger: Subject<any> = new Subject();
  ConfigTableBodyData: any = [
    {
      handle: 'handle',
      name: 'name',
      step: 1
    }
  ]

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
  ) {
    $this = this;
  }
  public handle: any;
  public step: any;
  public name: any;

  ngOnInit() {
  }

  populateModalData(data) {
    this.modalData.id = data.id;
    this.modalData.handle = data.handle;
    this.modalData.step = data.step;
    this.modalData.name = data.name;
  }

  add() {
    this.addData.handle = this.handle;
    this.addData.step = this.step;
    this.addData.name = this.name;

    this.toastr.info('Valore in aggiornamento..', 'Info');
    this.apiService.addSDMStatus(this.addData).subscribe(data => {
        this.getCOnfigurations(); // this should refresh the main table on page
        this.toastr.success('Valore Aggiornato', 'Success');
        $('#addConfigModal').modal('toggle').hide();
    }, error => {
        this.toastr.error('Errore durante update.', 'Error');
        $('#addConfigModal').modal('toggle').hide();
    });
  }

  updateConfig() {
    this.toastr.info('Valore in aggiornamento..', 'Info');
    this.apiService.updateSDMStatusConfig(this.modalData).subscribe(data => {
      this.getCOnfigurations(); // this should refresh the main table on page
      this.toastr.success('Valore Aggiornato', 'Success');
      $('#configModal').modal('toggle').hide();
    }, error => {
      this.toastr.error('Errore durante update.', 'Error');
      $('#configModal').modal('toggle').hide();
      });
  }

  deleteSDMRow(data) {
    this.toastr.info('Valore in aggiornamento..', 'Confirm');
    this.apiService.deleteSDMStatusConfiguration(data.id).subscribe(data => {
      this.getCOnfigurations(); // this should refresh the main table on page
      this.toastr.success('Valore Aggiornato', 'Success');
      // $('#configModal').modal('toggle').hide();
    }, error => {
      this.toastr.error('Errore durante update.', 'Error');
      // $('#configModal').modal('toggle').hide();
      });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();

    this.setUpDataTableDependencies();
    this.getCOnfigurations();

    /*this.apiService.getConfigurations().subscribe((data:any)=>{
      this.ConfigTableBodyData = data;
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
    this.apiService.getSDMStatusConfigurations().subscribe((data) =>{
      this.ConfigTableBodyData = data;
      console.log('Configs ', data);
      this.rerender();
    });
  }
  
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';

declare var $;
var $this;


@Component({
  templateUrl: './bsi-report.component.html'
})

export class BSIReportComponent implements OnInit {
  @ViewChild('addConfigModal') public addConfigModal: ModalDirective;
  @ViewChild('configModal') public configModal: ModalDirective;
  @ViewChild('ConfigurationTable') block: ElementRef;
  // @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
  category_id : number = 0;
  // handle: any = '';
  // name: any =  '';
  // step: any = '';

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
  loading: boolean = true;
  dtTrigger: Subject<any> = new Subject();
  AllNormalReportsData: any = [];
  ReportDetailsData: any = [];

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
  ) {
    $this = this;
  }

  ngOnInit() {
    //this.getAllNormalReports();
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();
    this.getAllNormalReports();
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
      this.loading = false;
    });
  }

  strip_tags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
  }

  getAllNormalReports() {
    this.loading = true;
    this.apiService.getAllNormalReports().subscribe((data) =>{
      this.AllNormalReportsData = data;
      console.log('AllNormalReportsData -> ', data);
      this.rerender();
    });
  }

  getReportDetails(reportId){
    this.apiService.getReportDetails(reportId).subscribe((data) =>{
      this.ReportDetailsData = data;
      console.log('ReportDetailsData -> ', data);
      this.rerender();
    });
  }

  onCancel(dismissMethod: string): void {
    console.log('Cancel ', dismissMethod);
  }
  
  showConfigModal() {
    this.configModal.show();
  }

  hideConfigModal() {
    this.configModal.hide();
  }
  
}

import { Component, OnInit, ViewChild, ElementRef, Pipe } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject, from, BehaviorSubject, interval } from 'rxjs';
import { DatePipe, formatDate,getLocaleDateFormat } from '@angular/common'
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { Key } from 'protractor';

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
    interval_kpi: null,
    value_kpi: '',
    ticket_id: '',
    close_timestamp_ticket: '',
    archived: ''
  };

  kpisData = [];
  datiGrezzi=[];
  countCampiData=[];
  p = null;
  monthVar: any;
  yearVar: any;
  id: any;
  currentKPI = 'test';

  fitroDataById: any = [
    {
      event_type_id: ' event_type_id  ',
      resource_id: 'resource_id',
      time_stamp : 'time_stamp ',
      raw_data_id: 'raw_data_id',
      create_date : 'create_date ',
      data:this.datiGrezzi,
      modify_date:'modify_date',
      reader_id: 'reader_id',
      event_source_type_id : 'event_source_type_id ',
      event_state_id: 'event_state_id ',
      partner_raw_data_id : 'partner_raw_data_id ',
    }
  ]
  
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
  
  constructor(private apiService: ApiService) {
    $this = this;
  }

  ngOnInit() {
   this.monthVar = moment().subtract(1, 'month').format('MM');
   this.yearVar = moment().subtract(1, 'month').format('YYYY');
  }

  populateModalData(data) {
    this.currentKPI = data.kpi_name;
    this.apiService.getArchivedKpiById(data.id_kpi).subscribe((kpis: any) => {
    this.kpisData = kpis;
    //console.log('pop',this.kpisData);
    });
  }

  populateDateFilter() {
    this.apiService.getArchivedKpis(this.monthVar, this.yearVar).subscribe((data: any) => {
      this.ArchivedKpiBodyData = data;
      this.rerender();
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
    this.setUpDataTableDependencies();
    //this.getKpis1();
    this.apiService.getDataKpis(this.monthVar, this.yearVar).subscribe((data:any)=>{
      this.ArchivedKpiBodyData = data;
      this.rerender();
    });
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
    this.apiService.getArchivedKpis(this.monthVar, this.yearVar).subscribe((data) => {
      this.ArchivedKpiBodyData = data;
      Object.keys(this.fitroDataById).forEach( key => {
        this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data);
      //console.log('Archived Kpis ', data);
      })
    });
  }

  /*getKpis1() {
    this.apiService.getArchivedKpis().subscribe((data: any) => {
    });
  }*/
  
  getdati(id_kpi, month = this.monthVar, year = this.yearVar){
    this.apiService.getKpiArchivedData(id_kpi,month, year).subscribe((dati: any) =>{
      this.fitroDataById = dati;
      Object.keys(this.fitroDataById).forEach( key => {
        this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data); 
    })
    //console.log('dati',dati);
    this.getCountCampiData();
    });
  }


/*spit(){
  const [first, second] = "10AM-4PM".split('-');
  console.log(first);
  console.log(second);
}*/

  getDatiSecondPop(id_kpi, interval){
    var mese=moment(interval).format('MM');
    var anno=moment(interval).format('YYYY');
    this.getdati(id_kpi,mese,anno);
  }

  getCountCampiData(){
    let maxLength = 0;
    this.fitroDataById.forEach( f => {
      //let data = JSON.parse(f.data);
      if(Object.keys(f.data).length > maxLength){
        maxLength = Object.keys(f.data).length;
      }  
    });
    this.countCampiData = [];
    for(let i=1;i<= maxLength; i++){
      this.countCampiData.push(i);
    }
  }


  
}

import { Component, OnInit, ViewChild, ElementRef, Pipe } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject, from, BehaviorSubject, interval } from 'rxjs';
import { DatePipe, formatDate,getLocaleDateFormat } from '@angular/common'
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';
import * as moment from 'moment';
import { first } from 'rxjs/operators';
import { Key } from 'protractor';
import { MatSort } from '@angular/material';
import { OrderPipe } from 'ngx-order-pipe'
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import { ToastrService } from 'ngx-toastr';

declare var $;
var $this;

var nome='';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  templateUrl: './archivedkpi.component.html'
})
export class ArchivedKpiComponent implements OnInit {
  @ViewChild('ArchivedkpiTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
  @ViewChild('table') table: ElementRef;
  
  public filter: string;
  
  public p: any;
  loading: boolean = false;
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


  fitroDataById: any = [
    {
      event_type_id: '   ',
      resource_id: '',
      time_stamp : ' ',
      raw_data_id: '',
      create_date : ' ',
      data:this.datiGrezzi,
      modify_date:'',
      reader_id: '',
      event_source_type_id : ' ',
      event_state_id: ' ',
      partner_raw_data_id : ' ',
    }
  ]



  dtTrigger: Subject<any> = new Subject();



  ArchivedKpiBodyData: any = [
    { 
      customer_name: '',
      contract_name:' ',
      id_kpi: '',
      name_kpi: '',
      interval_kpi: '',
      value_kpi: '',
      ticket_id: '',
      close_timestamp_ticket: '',
      archived: '',
     
    }
  ]



  
  monthVar: any;
  yearVar: any;
  id:any;
  sortedCollection: any[];
  constructor(private apiService: ApiService,private orderPipe: OrderPipe,private toastr: ToastrService) {
    $this = this;
    this.sortedCollection = orderPipe.transform(this.fitroDataById, 'info.name');
    console.log(this.sortedCollection);
  }

  ngOnInit() {
   this.getAnno();
   this.monthVar = moment().subtract(1, 'month').format('MM');
   this.yearVar = moment().subtract(1, 'month').format('YYYY');
   this.populateDateFilter();
   
  }

  populateModalData(data) {
    this.apiService.getArchivedKpiById(data.id_kpi).subscribe((kpis: any) => {
    this.kpisData = kpis;

    console.log('pop',this.kpisData);
    });
  }

  

  populateDateFilter() {
      this.apiService.getArchivedKpis(this.monthVar, this.yearVar).subscribe((data: any) => {
     
      this.ArchivedKpiBodyData = data;
      console.log("kpi1",data);
     // this.getNumeroContratti();
      
      this.rerender();
      this.numeroContratti();
      this.addChildren();
      },error=>{

        this.toastr.error("errore di connessione al sever");

      });
  }
  
  ngAfterViewInit() {
    this.dtTrigger.next();
    //this.getKpis1();
    
    this.apiService.getDataKpis(this.monthVar, this.yearVar).subscribe((data:any)=>{
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
     // this.setUpDataTableDependencies();
    });
  }
 

  // getKpiTableRef(datatableElement: DataTableDirective): any {
  //   return datatableElement.dtInstance;
  // }


  strip_tags(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
  }

  getKpis() {
    this.apiService.getArchivedKpis(this.monthVar, this.yearVar).subscribe((data) =>{
      this.ArchivedKpiBodyData = data;
      console.log("kpi",data);
      Object.keys(this.fitroDataById).forEach( key => {
        this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data);
      })
      
    });
  }

  eventTypeArray=[];
  getdati(id_kpi, month = this.monthVar, year = this.yearVar){
    this.loading = true;
    this.apiService.getKpiArchivedData(id_kpi,month, year).subscribe((dati: any) =>{
    
    this.fitroDataById = dati;
    Object.keys(this.fitroDataById).forEach( key => {
      this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data);
     
    })

  console.log('dati',dati);
  this.getCountCampiData();

  this.numeroEventi();
  this.loading = false;
  console.log(this.eventTypeArray);

  /*Object.keys(this.eventTypeArray).forEach( e=> {
    console.log(e + '#' + this.eventTypeArray[e]);
  })*/
},error=>{

  this.toastr.error("errore di connessione al server");

});
  }
arrayContratti=[];

numeroContratti()
{
  this.arrayContratti=[];
  this.ArchivedKpiBodyData.forEach( e => {
    var count = this.ArchivedKpiBodyData.reduce((acc, cur) => cur.contract_name === e.contract_name ? ++acc : acc, 0);
  // console.log('type:' + e.contract_name + ' # count:' +count);
    if(e.contract_name !=null)this.arrayContratti[e.contract_name]=count;
   // console.log('prova',this.arrayContratti);
   
})
}



numeroContrattoKpi=[];
arraykpi=[];
res:any={};

addChildren(){
  this.res={};
  this.ArchivedKpiBodyData.forEach((y:any) => {
    if(this.res[y.contract_name]){
      this.res[y.contract_name].push(y.name_kpi)
    }
    else{
      this.res[y.contract_name]=[];
      this.res[y.contract_name].push(y.name_kpi)
    }
   
     
      
      
     
     
       
    });
  

   console.log('contrattoKPI',this.res);
  }
    
 


  numeroEventi() {
  this.eventTypeArray = [];
  this.fitroDataById.forEach( e => {
    var count = this.fitroDataById.reduce((acc, cur) => cur.event_type_id === e.event_type_id ? ++acc : acc, 0);
   //console.log('type:' + e.event_type_id + ' # count:' +count);
    if(e.event_type_id > 0)this.eventTypeArray[e.event_type_id]=count;
   // console.log('prova',this.eventTypeArray);
   
})
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



        
      /*let resources = data["ArchivedKpiBodyData"];
      let resource = resources["interval_kpi"];
      console.log('stampa',resource);*/

  

  



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


/*getdati(id_kpi,monthVar,yearVar){
  this.apiService.getDateKpisById(id_kpi,monthVar,yearVar).subscribe(data => {
    let res = data[0]["fitroDataById"]; 
    let datiGrezzi = res['data'];
    this.datiGrezzi=.datiGrezzi 
    // this.dataChange.next(data) 
     console.log(this.datiGrezzi);
    });
}*/

anni=[];
//+(moment().add('months', 6).format('YYYY'))
getAnno(){
for (var i = 2016; i <=+(moment().add('months', 7).format('YYYY')); i++) {
 this.anni.push(i);
 
}
return this.anni;
console.log("aaaa",this.anni);
}
order: string = 'info.name';
reverse: boolean = false;

setOrder(value: string) {
  if (this.order === value) {
    this.reverse = !this.reverse;
  }

  this.order = value;
}


getNumeroKPI(){

    return this.ArchivedKpiBodyData.length;
  }

 /* getNumeroContratti(){
    var Length = 0;
    this.ArchivedKpiBodyData.forEach( f => {
      //let data = JSON.parse(f.data);
      if(Object.keys(f.contract_name).length){
        Length = Object.keys(f.contract_name).length;
        return Length;
      }  
    });
  
  }
*/  


  /*public exportAsExcelFile(json: any[], excelFileName: string): void {
    
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet',worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  } 
  

  exportAsXLSX():void {
    this.exportAsExcelFile(this.fitroDataById, 'sample');
  }*/
 
  fireEvent()
{
  const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  /* save to file */
  XLSX.writeFile(wb, 'Export.csv');
  
}

clear(){
  this.filter = '';
  this.fitroDataById=[];
  this.p=1;
  }
  reset() {
    this.kpisData = [];
  }


}

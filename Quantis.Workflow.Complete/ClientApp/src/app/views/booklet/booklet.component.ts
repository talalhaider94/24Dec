import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { FormControl,FormGroup,FormControlName } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ApiService } from '../../_services/api.service';
import { filter } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { deepStrictEqual } from 'assert';
import { DateAdapter } from '@angular/material';
import * as moment from 'moment';


declare var $;
var $this;


@Component({
  selector: 'app-booklet',
  templateUrl: './booklet.component.html',
  styleUrls: ['./booklet.component.scss']
})
export class BookletComponent implements OnInit {

  datacorrente : any;
  dataprecedente: any;
  documenti=[];
  array=[];
  @ViewChild('ArchivedkpiTable') block: ElementRef;

  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild('searchCol2') searchCol2: ElementRef;
  @ViewChild('btnExportCSV') btnExportCSV: ElementRef;
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
 

   contrattiDef:any=[{
     checked:false,
     clienti:'',
     contratto:''

   }]; 
   
  documentiDef: any=[{
    id:'documentid',
    nome:'documentname'
  }]





   

   
    dtTrigger: Subject<any> = new Subject();

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  constructor(private apiService:ApiService) {


    this.documenti=[
      {id:1,nome:'contratto1',cognome:'giacomo',status:'attivo',success:50,danger:10,warning:12},
      {id:2,nome:'contratto2',cognome:'rino',status:'attesa',success:200,danger:0,warning:0},
      {id:3,nome:'contratto3',cognome:'carmine',status:'null',success:100,danger:30,warning:12}, 
      {id:4,nome:'contratto4',cognome:'mary',status:'rifiutato',success:50,danger:10,warning:12},
      {id:5,nome:'contratto5',cognome:'fausto',status:'bel',success:50,danger:10,warning:32}

    ]
   }

  

  ngOnInit() {
   this.getDocumenti();
   this.getContratti();  
      
   this.getCheckedItemList();
   this.dataprecedente=moment().subtract(1, 'month').format('MM/YYYY');
   this.datacorrente=moment().format('MM/YYYY');
   
  }


  ngAfterViewInit() {
    this.dtTrigger.next();
   // this.apiService.getDocumentiBooklet().subscribe((data:any)=>{
      //this.contrattiDef=data; 
      
     // this.recuperoChildren();  
      this.rerender();
    
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
     
    });
  }
 
utente=JSON.parse(localStorage.getItem('currentUser')); 
 
getContratti(){
    this.apiService.getAllKpiHierarchy(this.utente.userid).subscribe((data:any)=>{
       this.contrattiDef=data;
       console.log('contrattiDef',this.contrattiDef);
       //this.recuperoChildren();
    });
    
  }



getDocumenti(){
    this.apiService.getBooklet().subscribe((data:any)=>{
       this.documentiDef=data;
       console.log('documentiDef',this.documentiDef);
       
      });
  }



/*recuperoChildren(){
  this.contrattiDef.forEach((x:any) => {
   // console.log('cliente',x.name);
    x.children.forEach((y:any) => {
      //cliente:x.name;
     // contratto:y.name
      console.log('contratti',x.name,'-',y.name);
      this.array.push({cliente:x.name,contratto:y.name,checked:false});
      
    });

    
  });
  console.log('array',this.array)
}*/
/*addItem(){
  this.getBooklet();
   this.documentiDef.map(item => {
  return {
      customer: item.name,
      
  }
}).forEach(item => this.array.push(item));
console.log(JSON.stringify(this.array))
}*/
 

  /*getUsers() {
    this.apiService.getCatalogoUsers().subscribe((data: any)=>{
      this.UtentiTableBodyData=data;
      console.log('user ', this.UtentiTableBodyData);
    });
}*/



checkedList = [];
consoleSelect(event){
  console.log(event);
  console.log(event.target.selectedOptions[0].value);
}


 getCheckedItemList(){
  this.checkedList = [];
   for (var i=0; i < this.array.length; i++) {
      if(this.array[i].checked)
      this.checkedList.push(this.array[i]);
  }
  console.log('data ', this.checkedList);
}




}
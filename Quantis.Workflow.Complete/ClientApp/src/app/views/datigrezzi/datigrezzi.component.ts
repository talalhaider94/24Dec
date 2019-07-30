import { Component, OnInit, ViewChild, ElementRef ,ViewContainerRef } from '@angular/core';
import { saveAs } from 'file-saver';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { LoadingFormService } from '../../_services/loading-form.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
declare var $;
let $this;


@Component({
  selector: 'app-catalogo-kpi',
  templateUrl: './datigrezzi.component.html',
  styleUrls: ['./datigrezzi.component.scss']
})
export class DatiGrezziComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private LoadingFormService: LoadingFormService,
  ) {
    $this = this;
  }
  loading: boolean = true;
  public des = '';
  public filter: string;
  public comparator: any;
  public p: any;

  @ViewChild('kpiTable') block: ElementRef;
  @ViewChild('searchCol1') searchCol1: ElementRef;
  @ViewChild('searchCol2') searchCol2: ElementRef;
  @ViewChild('searchCol4') searchCol4: ElementRef;
  @ViewChild('searchCol5') searchCol5: ElementRef;
  @ViewChild(DataTableDirective) private datatableElement: DataTableDirective;
  @ViewChild('table') table: ElementRef;

  viewModel = {
    filters: {
      idKpi: '',
      titoloBreve: '',
      tuttiContratti: '',
      tutteLeFrequenze: ''
    }
  };

  datiGrezzi=[];
  monthVar: any;
  yearVar: any;
  countCampiData=[];
id_kpi_temp = '';
loadingModalDati:boolean=false;
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

  dtOptions = {
    deferRender: true,
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


  dtTrigger: Subject<any> = new Subject();
  kpiTableHeadData = [
    {
      CONTRACT: 'CONTRACT',
      ID_KPI: 'ID_KPI',
      TITOLO_BREVE: 'TITOLO_BREVE',
      FREQUENZA: 'FREQUENZA',
    }];

  kpiTableBodyData: any = [];
  allForms: any = [];

  coloBtn( id: string): void {
    this.des = id;
  }



  ngOnInit() {

    this.dtOptions = {
      deferRender: true,
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
    this.monthVar = moment().format('MM');
    this.yearVar = moment().format('YYYY');
    //this.getdati1(this.id_kpi_temp,this.monthVar,this.yearVar);
    this.getAnno();
    //this.setUpDataTableDependencies();
  }



  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.dtTrigger.next();
    this.getKpis();
    this.setUpDataTableDependencies();
    
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

  setUpDataTableDependencies() {

    $(this.searchCol1.nativeElement).on( 'keyup', function () {
      $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
        datatable_Ref
          .columns(1)
          .search(this.value)
          .draw();
      });
    });
    $(this.searchCol2.nativeElement).on( 'keyup', function () {
      $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
        datatable_Ref
          .columns( 2 )
          .search( this.value )
          .draw();
      });
    });

    $this.datatableElement.dtInstance.then((datatable_Ref: DataTables.Api) => {
      datatable_Ref.columns(0).every( function () {
        const that = this;

        // Create the select list and search operation
        const select = $($this.searchCol4.nativeElement)
          .on( 'change', function () {
            that
              .search( $(this).val(),false,false,false )
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
      datatable_Ref.columns(4).every( function () {
        const that = this;
        // Create the select list and search operation
        const select = $($this.searchCol5.nativeElement)
          .on( 'change', function () {
            that
              .search( $(this).val() )
              .draw();
          } );
      });
    });


    
  }

  isNumber(val){
    return !isNaN(val);
  }


  strip_tags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText;
  }


  getKpis() {
 
    this.apiService.getCatalogoKpis().subscribe((data: any) => {
      this.kpiTableBodyData = data;
      console.log('Kpis ', data);
      this.rerender();
      this.loading = false;
    });
  }



  anni=[];
  //+(moment().add('months', 6).format('YYYY'))
  getAnno(){
  for (var i = 2016; i <=+(moment().add('months', 7).format('YYYY')); i++) {
   this.anni.push(i);
   
  }
  return this.anni;
  }

clear(){
  this.filter = '';
  this.fitroDataById=[];
  this.p=1;

  }

  getdati1(id_kpi, month = this.monthVar, year = this.yearVar){
    this.clear();
    
    this.id_kpi_temp = id_kpi;
    this.loadingModalDati = true;
  
    this.apiService.getKpiRawData(id_kpi,month,year).subscribe((dati: any) =>{
      this.fitroDataById = dati;
      console.log(dati);
      Object.keys(this.fitroDataById).forEach(key => {
     
        this.fitroDataById[key].data = JSON.parse(this.fitroDataById[key].data);
          switch (this.fitroDataById[key].event_state_id) {
            case 1:
              this.fitroDataById[key].event_state_id = "Originale";
              break;
            case 2:
              this.fitroDataById[key].event_state_id = "Sovrascritto";
              break;
            case 3:
              this.fitroDataById[key].event_state_id = "Eliminato";
              break;
            case 4:
              this.fitroDataById[key].event_state_id = "Correzione";
              break;
            case 5:
              this.fitroDataById[key].event_state_id = "Correzione eliminata";
              break;
            case 6:
              this.fitroDataById[key].event_state_id = "Business";
              break;
            default:
              this.fitroDataById[key].event_state_id = this.fitroDataById[key].event_state_id;
              break;
          }
          this.fitroDataById[key].modify_date=moment(this.fitroDataById[key].modify_date).format('DD/MM/YYYY HH:mm:ss');
          this.fitroDataById[key].create_date=moment(this.fitroDataById[key].create_date).format('DD/MM/YYYY HH:mm:ss');
          this.fitroDataById[key].time_stamp=moment(this.fitroDataById[key].time_stamp).format('DD/MM/YYYY HH:mm:ss');
      })
      this.getCountCampiData();
      
      let max = this.countCampiData.length;
      

      Object.keys(this.fitroDataById).forEach(key => {
        let temp = Object.keys(this.fitroDataById[key].data).length;
        if (temp < max) {
          for (let i = 0; i < (max - temp); i++) {
            this.fitroDataById[key].data['empty#'+i] = '##empty##';
          }
        }
      })
        

        //****console.log("array tempo",this.arrayPeriodo);
        console.log('dati', dati);
        //****console.log('key', this.fitroDataById);
       /**** this.getCountCampiData();
        this.numeroEventi();****/

        //****console.log(this.eventTypeArray);

        /*Object.keys(this.eventTypeArray).forEach( e=> {
          console.log(e + '#' + this.eventTypeArray[e]);
        })*/
        this.loadingModalDati = false;
    });
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
  

  fireEvent()
{
const ws: XLSX.WorkSheet=XLSX.utils.table_to_sheet(this.table.nativeElement);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Export.csv');
  
    

}



}

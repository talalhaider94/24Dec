import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';

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
    'dom': 'rtip',
    // "columnDefs": [{
    // "targets": [0,2],
    // "data": null,
    // "defaultContent": '<input type="checkbox" />'
    // }]
  };

  modalData = {
    key: '',
    value: ''
  };

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

  getCOnfigurations() {
    this.apiService.getConfigurations().subscribe((data) =>{
      this.ConfigTableBodyData = data;
      console.log('Configs ', data);
    });
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngAfterViewInit() {
    this.getConfigTableRef(this.datatableElement).then((dataTable_Ref)=>{
      this.setUpDataTableDependencies(dataTable_Ref);
    });
    this.getCOnfigurations();
  }

  getConfigTableRef(datatableElement: DataTableDirective): any {
    return datatableElement.dtInstance;
    // .then((dtInstance: DataTables.Api) => {
    //     console.log(dtInstance);
    // });
  }

  setUpDataTableDependencies(datatable_Ref){
    // let datatable_Ref = $(this.block.nativeElement).DataTable({
    //   'dom': 'rtip'
    // });

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

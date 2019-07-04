import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: './userprofiling.component.html',
  styleUrls: ['./userprofiling.component.scss']
})

export class UserProfilingComponent implements OnInit {
  @ViewChild('myTree') myTree: ElementRef;

  // defined the array of data
  public treeData: Object[] = [
    {
        id: '1', name: 'Documents',
        children: [
            { id: '11', name: 'Team management.docx' },
            { id: '12', name: 'Entity Framework Core.pdf' },
        ]
    },
    {
        id: '2', name: 'Downloads',
        children: [
            { id: '21', name: 'Sales report.ppt' },
            { id: '22', name: 'Introduction to Angular.pdf' },
            { id: '23', name: 'Paint.exe' },
            { id: '24', name: 'TypeScript sample.zip' },
        ]
    },
    {
        id: '3', name: 'Music',
        children: [
            { id: '31', name: 'Crazy tone.mp3' }
        ]
    },
    {
      id: '4', name: 'Videos',
      children: [
          { id: '41', name: 'Angular tutorials.mp4' },
          { id: '42', name: 'Basics of Programming.mp4' },
      ]
    }
  ];

  public treeFields: any = {
      dataSource: this.treeData,
      id: 'id',//'nodeId',
      text: 'name',//'nodeText',
      child: 'children',//'nodeChild'
  };


  gatheredData = {
    usersList: [],
    assignedKpis: []
  }
  selectedData = {
    userid: null,
    name: '',
    checked: null,
    selected: null
  }
  filters = {
    searchUsersText: ''
  }
  loading = {
    users: false
  }



  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {

    this.loading.users = true;
    this.apiService.getCatalogoUsers().subscribe((res)=>{
      this.gatheredData.usersList = res;
      //console.log(res);
      this.loading.users = false;
    });


    this.apiService.getAllKpiHierarchy().subscribe(data=>{
      console.log('aaaaaaaaaaaaaaa ', data);
      //this.treeFields.dataSource = data;
    });
  
  }

  selectUserItem(user, $event) {
    //console.log(user, $event);
    $('.role-permissions-lists ul.users-list li').removeClass('highlited-user');
    $($event.target).addClass('highlited-user');
    this.selectedData.userid = user.ca_bsi_user_id;//user.ca_bsi_user_id;
    this.selectedData.name = user.userid + ' - ' + user.name + ' ' + user.surname + '[' + user.ca_bsi_account + ']';//user.ca_bsi_user_id;
    if(this.selectedData.userid){
      this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
        console.log('bbbbbbbbbbbbbbb ', data);
      });
    }
  }


  ngAfterViewInit() {
  }

  ngOnDestroy(): void {
  }

}

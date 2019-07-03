import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ApiService } from '../../_services/api.service';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FilterUsersPipe } from './../../_pipes/filterUsers.pipe';


declare var $;
var $this;


@Component({
  templateUrl: './userprofiling.component.html',
  styleUrls: ['./userprofiling.component.scss']
})

export class UserProfilingComponent implements OnInit {

  public treeDataa: Object[] = [
    {
        nodeId: '1', nodeText: 'Documents',
        nodeChild: [
            { nodeId: '11', nodeText: 'Team management.docx' },
            { nodeId: '12', nodeText: 'Entity Framework Core.pdf' },
        ]
    },
    {
        nodeId: '2', nodeText: 'Downloads',
        nodeChild: [
            { nodeId: '21', nodeText: 'Sales report.ppt' },
            { nodeId: '22', nodeText: 'Introduction to Angular.pdf' },
            { nodeId: '23', nodeText: 'Paint.exe' },
            { nodeId: '24', nodeText: 'TypeScript sample.zip' },
        ]
    },
    {
        nodeId: '3', nodeText: 'Music',
        nodeChild: [
            { nodeId: '31', nodeText: 'Crazy tone.mp3' }
        ]
    },
    {
        nodeId: '4', nodeText: 'Videos',
        nodeChild: [
            { nodeId: '41', nodeText: 'Angular tutorials.mp4' },
            { nodeId: '42', nodeText: 'Basics of Programming.mp4' },
        ]
    }
];
 
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
      dataSource: [{
        id: '4', name: 'Videos',
        children: [
            { id: '41', name: 'Angular tutorials.mp4' },
            { id: '42', name: 'Basics of Programming.mp4' },
        ]
    }],
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
    name: ''
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
    $this = this;
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
      this.treeFields.dataSource = data;
      console.log(this.treeFields.dataSource, this.treeDataa);
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

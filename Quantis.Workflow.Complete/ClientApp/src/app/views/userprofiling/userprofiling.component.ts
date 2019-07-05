import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { ToastrService } from 'ngx-toastr';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';



@Component({
  templateUrl: './userprofiling.component.html',
  styleUrls: ['./userprofiling.component.scss']
})

export class UserProfilingComponent implements OnInit {
  @ViewChild('permissionsTree') permissionsTree: TreeViewComponent;

  isTreeLoaded = false;

  public treeFields: any = {
      dataSource: [],
      id: 'id',//'nodeId',
      text: 'name',//'nodeText',
      child: 'children',//'nodeChild'
  };


  gatheredData = {
    usersList: [],
    rolesList: [],
    assignedPermissions: []
  }
  selectedData = {
    userid: null,
    roleid: null,
    name: '',
    checked: null,
    selected: null
  }
  filters = {
    searchUsersText: ''
  }
  loading = {
    users: false,
    roles: false
  }


  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {

    this.loading.roles = true;
    this.apiService.getAllRoles().subscribe((res)=>{
      console.log('getAllRoles ==> ', res);
      this.gatheredData.rolesList = res;
      this.loading.roles = false;
    });


    this.apiService.getAllKpiHierarchy().subscribe(data=>{
      console.log('getAllKpiHierarchy ==> ', data);
      this.treeFields.dataSource = data;//[].concat(data);
      this.isTreeLoaded = true;
    });
  
  }

  selectRoleItem(role, $event) {
    console.log(role, this.permissionsTree.checkedNodes, this.selectedData);
    $('.role-permissions-lists ul.users-list li').removeClass('highlited-user');
    $($event.target).addClass('highlited-user');
    this.selectedData.roleid = role.id;
    this.selectedData.name = role.name;
    if(this.selectedData.roleid){
      this.apiService.getGlobalRulesByUserId(this.selectedData.roleid).subscribe(data=>{
        console.log('getGlobalRulesByUserId ==> ', data);
        //selectedData.checked = data;
      });
    }
  }

  saveAssignedPermissions(){
    if(this.selectedData.roleid) {
      let dataToPost = {Id: this.selectedData.roleid, Ids: this.permissionsTree.checkedNodes};
      // this.permissionsTree.checkedNodes.forEach((value, idx) => {
      //   dataToPost.Ids.push(value.id)
      // });
      this.apiService.assignGlobalRulesToUserId(dataToPost).subscribe(data => {
        this.toastr.success('Saved', 'Success');
      }, error => {
        this.toastr.error('Not Saved', 'Error');
      });
    }
  }
}

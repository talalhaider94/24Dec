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
      title: 'name'
  };

  innerMostChildrenNodeIds = [];
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
    this.apiService.getCatalogoUsers().subscribe((res)=>{
      console.log('getCatalogoUsers ==> ', res);
      this.gatheredData.usersList = res;
      this.loading.roles = false;
      this.selectedData.userid = res.ca_bsi_user_id;
    });


    this.apiService.getAllKpiHierarchy().subscribe(data=>{
      console.log('getAllKpiHierarchy ==> ', data);
      this.treeFields.dataSource = data;//[].concat(data);
      this.isTreeLoaded = true;
    });

    // if(this.selectedData.userid){
    //   this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
    //     console.log('getGlobalRulesByUserId ==> ', data);
    //     this.treeFields.dataSource = data;//[].concat(data);
    //     this.isTreeLoaded = true;
    //     this.selectedData.checked = data;
    //   });
    // }
  
  }

  selectRoleItem(user, $event) {
    console.log(user, this.permissionsTree.checkedNodes, this.selectedData);
    $('.role-permissions-lists ul.users-list li').removeClass('highlited-user');
    $($event.target).addClass('highlited-user');
    this.selectedData.userid = user.ca_bsi_user_id;
    this.selectedData.name = user.userid + ' - ' + user.name + ' ' + user.surname + '[' + user.ca_bsi_account + ']';;
    if(this.selectedData.userid){
      this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
        console.log('getGlobalRulesByUserId ==> ', data);
        this.selectedData.checked = data;
      });
    }
  }

  saveAssignedPermissions(){
    console.log(this.selectedData);
    if(this.selectedData.userid) {
      this.traverseNodes(this.treeFields.dataSource);
      //console.log('this.innerMostChildrenNodeIds => ', this.innerMostChildrenNodeIds);
      let dataToPost = {Id: this.selectedData.userid, Ids: this.innerMostChildrenNodeIds};
      console.log(dataToPost);
      // this.permissionsTree.checkedNodes.forEach((value, idx) => {
      //   dataToPost.Ids.push(value.id)
      // });
      this.apiService.assignGlobalRulesToUserId(dataToPost).subscribe(data => {
        this.toastr.success('Saved', 'Success');
        this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
          console.log('getGlobalRulesByUserId ==> ', data);
          this.selectedData.checked = data;
        });
      }, error => {
        this.toastr.error('Not Saved', 'Error');
      });
    }
  }

  syncSelectedNodesArray(event){
    this.selectedData.checked = this.permissionsTree.checkedNodes;
    //console.log(event);
  }

  traverseNodes(complexJson) {
    if (complexJson) {
      complexJson.forEach((item:any)=>{
        if (item.children) {
          this.traverseNodes(item.children);
        } else {
          if(this.permissionsTree.checkedNodes.includes(item.id.toString())){
            this.innerMostChildrenNodeIds.push(item.id);
          }
        }
      });
    }
  }
}
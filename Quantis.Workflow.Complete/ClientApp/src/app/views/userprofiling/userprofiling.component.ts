import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ApiService } from '../../_services/api.service';
import { ToastrService } from 'ngx-toastr';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { ITreeOptions, TreeComponent } from 'angular-tree-component';
import { TreeviewItem, TreeviewConfig } from 'ngx-treeview';


@Component({
  templateUrl: './userprofiling.component.html',
  styleUrls: ['./userprofiling.component.scss']
})

export class UserProfilingComponent implements OnInit {
  //@ViewChild('permissionsTree') permissionsTree: TreeViewComponent;
  @ViewChildren('permissionsTree') allTreesNodes !: QueryList<TreeViewComponent>;
  isTreeLoaded = false;
  treesArray = [];
	allCurrentChildIds = [];


  public treeFields: any = {
      dataSource: [],
      id: 'id',
      text: 'name',
      child: 'children',
      title: 'name'
  };

  innerMostChildrenNodeIds = [];
  gatheredData = {
    usersList: [],
    rolesList: [],
    assignedPermissions: [],
    allPermissions: []
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
    }, err => {this.loading.roles = true; this.toastr.warning('Connection error', 'Info')});


    this.apiService.getAllKpiHierarchy().subscribe(data=>{
      console.log('getAllKpiHierarchy ==> ', data);
      //this.treeFields.dataSource = data;
      this.gatheredData.allPermissions = data;
      this.createTrees(data);
    }, err => {this.isTreeLoaded = true; this.toastr.warning('Connection error', 'Info')});
  }

  createTrees(treesData){
    treesData.forEach((itm:any)=>{
      let settings = { dataSource: [itm], id: 'id', text: 'name', title: 'name', child: 'children', hasChildren: 'children' };
      this.treesArray.push({
        name: itm.name,
        settings: settings,
        checkedNodes: [],
        id: itm.id,
        elementId: `permissions_tree_${itm.id}`,
        loaded: true
       });
    });

    this.isTreeLoaded = true;
  }

  updateTrees(selectedNodesIdsArray){
    console.log('in update fun => ', new Date().toISOString());
    let _selectedData = selectedNodesIdsArray;
    this.treesArray.forEach((itm:any)=>{
      this.allCurrentChildIds = [];
      this.getAllLeafNodesIds(itm.settings.dataSource);
      let filteredIds = _selectedData.filter( value => this.allCurrentChildIds.indexOf(+value)>-1);
      // check if it is needed anymore
      filteredIds = filteredIds.map(function(item) {
        return parseInt(item, 10);
      });
      if(!filteredIds.length){
        //this.treesArray.forEach((tre:any)=>{
          itm.loaded = true;
        //});
      }
      itm.checkedNodes = filteredIds;
      //console.log(itm, _selectedData, filteredIds, this.allCurrentChildIds);
    });
    console.log('end update fun => ', new Date().toISOString());
  }

  selectRoleItem(user, $event) {
    $('.role-permissions-lists ul.users-list li').removeClass('highlited-user');
    $($event.target).addClass('highlited-user');
    this.selectedData.userid = user.ca_bsi_user_id;
    this.selectedData.name = user.userid + ' - ' + user.name + ' ' + user.surname + '[' + user.ca_bsi_account + ']';
    if(this.selectedData.userid){
      this.addLoaderToTrees();
      this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
        console.log('getGlobalRulesByUserId ==> ', data);
        this.updateTrees(data);
      }, err => {
        this.uncheckAllTrees();
        this.toastr.warning('Connection error', 'Info');
      });
    } else {
      this.uncheckAllTrees();
    }
  }
  addLoaderToTrees(add = true){
    let load = false;
    if(add === false){
      load = true;
    }
    this.treesArray.forEach((itm:any) => {
      itm.loaded = load;
    });
  }
  
  saveAssignedPermissions(){
    console.log('this.treesArray ', this.treesArray);
    if(this.selectedData.userid) {
      let allChkd = [];
      // this.treesArray.forEach((tre:any)=>{
      //   allChkd = [...allChkd, ...tre.checkedNodes];
      // });
      this.allTreesNodes.forEach((tre:any) => {
        allChkd = [...allChkd, ...tre.checkedNodes];
      });
      
      allChkd = allChkd.map(function(item) {
        return parseInt(item, 10);
      });

      console.log('allChkd', allChkd);

      this.traverseNodes(this.gatheredData.allPermissions, allChkd);
      let dataToPost = {Id: this.selectedData.userid, Ids: this.innerMostChildrenNodeIds};
      console.log('dataToPost ', dataToPost);
      this.apiService.assignGlobalRulesToUserId(dataToPost).subscribe(data => {
        this.toastr.success('Saved', 'Success');
        //this.apiService.getGlobalRulesByUserId(this.selectedData.userid).subscribe(data=>{
          //console.log('getGlobalRulesByUserId ==> ', data);
          //this.selectedData.checked = data;
        //});
      }, error => {
        this.toastr.error('Not Saved', 'Error');
      });
    }
  }

  uncheckAllTrees(){
    //this.updateTrees([]);
    this.addLoaderToTrees(false);
    this.allTreesNodes.forEach((itm:any) => {
      itm.uncheckAll();
    });
  }

  syncSelectedNodesArray(event, treeRef){
    console.log('chekedddddddddddddddd ');//, treeRef);
    treeRef.loaded = true;
    //this.selectedData.checked = this.permissionsTree.checkedNodes;
  }

  traverseNodes(complexJson, allChkdNodes) {
    if (complexJson) {
      complexJson.forEach((item:any)=>{
        if (item.children) {
          this.traverseNodes(item.children, allChkdNodes);
        } else {
          if(allChkdNodes.includes(item.id)){
            this.innerMostChildrenNodeIds.push(item.id);
          }
        }
      });
    }
  }

  getAllLeafNodesIds(complexJson) {
    if (complexJson) {
      complexJson.forEach((item:any)=>{
        if (item.children) {
          this.getAllLeafNodesIds(item.children);
        } else {
            this.allCurrentChildIds.push(item.id);
        }
      });
    }
  }

}
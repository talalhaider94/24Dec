import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../_services/api.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  templateUrl: './rolepermissions.component.html'
})

export class RolePermissionsComponent implements OnInit {

  urlId = 0;
  gatheredData = {
    roleId: 0,
    permissionsList: [],
    assignedPermissions: []
  };

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    //this.gatheredData.roleId = +this.route.snapshot.paramMap.get('id');
    this.route.params.subscribe((params) => {
      this.gatheredData.roleId = parseInt(params['id']) || 0;
      if(this.gatheredData.roleId){
        this.getAllPermissions();
      } else {
        this.toastr.warning('Invlid Role ID', 'Warning');
      }
    });
  }

  getAllPermissions(){
    this.apiService.getAllPermisisons().subscribe( data => {
      this.gatheredData.permissionsList = data;
      this.getPermissionsByRoldId();
    });
  }
  getPermissionsByRoldId(){
    this.apiService.getPermissionsByRoldId(this.gatheredData.roleId).subscribe( data => {
      this.gatheredData.assignedPermissions = data;
    });
  }

  onPermissionSelectDeselect($event){
    //console.log($event, this.gatheredData.assignedPermissions);
  }

  saveAssignedPermissions(){
    if(this.gatheredData.roleId) {
      let dataToPost = {Id: this.gatheredData.roleId, Ids:[]};
      this.gatheredData.assignedPermissions.forEach((value, idx) => {
        dataToPost.Ids.push(value.id);
      });
      console.log(dataToPost);
      this.apiService.assignPermissionsToRoles(dataToPost).subscribe(data => {
        this.toastr.success('Permissions assigned', 'Success');
      }, error => {
        this.toastr.error('Error assigning permissions', 'Error');
      });
    }

  }

  ngOnDestroy(): void {
  }

}

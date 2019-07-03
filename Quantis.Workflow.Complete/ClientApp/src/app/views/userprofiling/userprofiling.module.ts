import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfilingComponent } from './userprofiling.component';
import { UserRolePermissionsComponent } from './UserRolePermissions/userRolePermissions.component';
import { UserProfilingRoutingModule } from './userprofiling-routing.module';
import { FilterUsersPipe } from './../../_pipes/filterUsers.pipe';
import {DataTablesModule} from 'angular-datatables';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { FormsModule } from '@angular/forms';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { TreeviewModule } from 'ngx-treeview';



@NgModule({
  declarations: [UserProfilingComponent,UserRolePermissionsComponent, FilterUsersPipe, TreeViewComponent],
  imports: [
    CommonModule,
    UserProfilingRoutingModule,
    DataTablesModule,
    AngularDualListBoxModule,
    PerfectScrollbarModule,
    FormsModule,
    TreeviewModule.forRoot()
  ]
})
export class UserProfilingModule { }

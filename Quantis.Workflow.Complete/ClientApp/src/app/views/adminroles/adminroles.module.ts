import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRolesComponent } from './adminroles.component';
import { RolePermissionsComponent } from './rolePermissions/rolepermissions.component';
import { AdminRolesRoutingModule } from './adminroles-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { FormsModule } from '@angular/forms';
import { FilterUsersPipe } from './../../_pipes/filterUsers.pipe';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';


@NgModule({
  declarations: [AdminRolesComponent,RolePermissionsComponent,FilterUsersPipe],
  imports: [
    CommonModule,
    AdminRolesRoutingModule,
    AngularDualListBoxModule,
    DataTablesModule,
    PerfectScrollbarModule,
    FormsModule,
  ]
})
export class AdminRolesModule { }

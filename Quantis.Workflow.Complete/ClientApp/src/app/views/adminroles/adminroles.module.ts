import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppModule } from './../../app.module';
import { AdminRolesComponent } from './adminroles.component';
import { RolePermissionsComponent } from './rolePermissions/rolepermissions.component';
import { AdminRolesRoutingModule } from './adminroles-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { FormsModule } from '@angular/forms';
// import { FilterUsersPipe } from './../../_pipes/filterUsers.pipe';

@NgModule({
  declarations: [AdminRolesComponent,RolePermissionsComponent,/*FilterUsersPipe*/],
  imports: [
    AppModule,
    CommonModule,
    AdminRolesRoutingModule,
    AngularDualListBoxModule,
    DataTablesModule,
    FormsModule,
  ]
})
export class AdminRolesModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfilingComponent } from './userprofiling.component';
import { UserRolePermissionsComponent } from './UserRolePermissions/userRolePermissions.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfilingComponent,
    data: {
      title: 'T Configurations'
    }
  },
  {
    path: 'rolepermissions',
    component: UserRolePermissionsComponent,
    data: {
      title: 'User Roles & Permissions'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfilingRoutingModule {}

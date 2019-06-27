import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfilingComponent } from './userprofiling.component';

const routes: Routes = [
  {
    path: '',
    component: UserProfilingComponent,
    data: {
      title: 'T Configurations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserProfilingRoutingModule {}

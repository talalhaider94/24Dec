import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  // {
  //   path: '',
  //   component: DashboardComponent,
  //   data: {
  //     title: 'Dashboard'
  //   }
  // },
  { 
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard/1'
  },
  { 
    path: 'dashboard/:id',
    component: DashboardComponent,
    data: {
      title: 'Dashboard'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { DashboardComponent } from './dashboard.component';
import { DashboardListsComponent } from './dashboard-lists/dashboard-lists.component';
import { ChartDataComponent } from './chartdata/chartdata.component';
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
  { 
    path: 'public/:id',
    component: PublicComponent,
    data: {
      title: 'Public Dashboard'
    }
  },
  { 
    path: 'list',
    component: DashboardListsComponent,
    data: {
      title: 'Dashboards'
    }
  },
  { 
    path: 'chartdata',
    component: ChartDataComponent,
    data: {
      title: 'Chart Data'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}

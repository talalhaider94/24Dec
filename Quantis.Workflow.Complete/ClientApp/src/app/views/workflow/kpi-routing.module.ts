import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RicercaComponent } from './ricerca/ricerca.component';
import { KPIComponent } from './kpi.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Work Flow'
    },
    children: [
      {
        path: '',
        redirectTo: 'ricerca'
      },
      {
        path: 'ricerca',
        component: RicercaComponent,
        data: {
          title: 'Workflow Ricerca'
        }
      },
      {
        path: 'verifica',
        component: KPIComponent,
        data: {
          title: 'Workflow verifica'
        }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KPIRoutingModule { }

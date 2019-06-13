import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogoKpiComponent } from './catalogo-kpi/catalogo-kpi.component';
import { CatalogoUtentiComponent } from './catalogo-utenti/catalogo-utenti.component';

const routes: Routes = [
  {
    path: '',
    component: CatalogoKpiComponent,
    data: {
      title: 'KPI'
    }
  },
  {
    path: 'kpi',
    component: CatalogoKpiComponent,
    data: {
      title: 'Catalogo KPI'
    }
  },
  {
    path: 'utenti',
    component: CatalogoUtentiComponent,
    data: {
      title: 'Catalogo Utenti'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CatalogoRoutingModule {}

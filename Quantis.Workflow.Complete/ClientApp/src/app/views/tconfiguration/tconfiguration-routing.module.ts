import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TConfigurationComponent } from './tconfiguration.component';

const routes: Routes = [
  {
    path: '',
    component: TConfigurationComponent,
    data: {
      title: 'T Configurations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TConfigurationRoutingModule {}

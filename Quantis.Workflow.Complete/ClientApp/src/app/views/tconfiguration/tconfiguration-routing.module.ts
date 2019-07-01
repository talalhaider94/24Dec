import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TConfigurationComponent } from './tconfiguration.component';
import { TConfigurationAdvancedComponent } from './advanced/advanced.component';

const routes: Routes = [
  {
    path: '',
    component: TConfigurationComponent,
    data: {
      title: 'General  T Configurations'
    }
  },
  {
    path: 'advanced',
    component: TConfigurationAdvancedComponent,
    data: {
      title: 'Advanced T Configurations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TConfigurationRoutingModule {}

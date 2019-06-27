import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SdmGroupComponent } from './sdmgroup.component';

const routes: Routes = [
  {
    path: '',
    component: SdmGroupComponent,
    data: {
      title: 'Group'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SdmGroupRoutingModule {}

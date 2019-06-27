import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SdmStatusComponent } from './sdmstatus.component';

const routes: Routes = [
  {
    path: '',
    component: SdmStatusComponent,
    data: {
      title: 'Group'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SdmStatusRoutingModule {}

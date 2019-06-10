import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArchivedKpiComponent } from './archivedkpi.component';
import { ArchivedKpiRoutingModule } from './archivedkpi-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [ArchivedKpiComponent],
  imports: [
    CommonModule,
    ArchivedKpiRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class ArchivedKpiModule { }

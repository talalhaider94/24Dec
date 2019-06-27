import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SdmStatusComponent } from './sdmstatus.component';
import { SdmStatusRoutingModule } from './sdmstatus-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [SdmStatusComponent],
  imports: [
    CommonModule,
    SdmStatusRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class SdmStatusModule { }

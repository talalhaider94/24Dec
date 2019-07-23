import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SdmStatusComponent } from './sdmstatus.component';
import { SdmStatusRoutingModule } from './sdmstatus-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

@NgModule({
  declarations: [SdmStatusComponent],
  imports: [
    CommonModule,
    SdmStatusRoutingModule,
    DataTablesModule,
    SweetAlert2Module,
    FormsModule
  ]
})
export class SdmStatusModule { }

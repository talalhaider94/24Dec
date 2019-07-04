import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SdmGroupComponent } from './sdmgroup.component';
import { SdmGroupRoutingModule } from './sdmgroup-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [SdmGroupComponent],
  imports: [
    CommonModule,
    SdmGroupRoutingModule,
    DataTablesModule,
    SweetAlert2Module,
    FormsModule
  ]
})
export class SdmGroupModule { }

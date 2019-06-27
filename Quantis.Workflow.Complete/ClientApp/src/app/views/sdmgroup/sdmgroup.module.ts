import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SdmGroupComponent } from './sdmgroup.component';
import { SdmGroupRoutingModule } from './sdmgroup-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [SdmGroupComponent],
  imports: [
    CommonModule,
    SdmGroupRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class SdmGroupModule { }

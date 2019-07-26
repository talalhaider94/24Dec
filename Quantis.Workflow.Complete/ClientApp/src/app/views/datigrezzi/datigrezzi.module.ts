import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatiGrezziComponent } from './datigrezzi.component';
import { DatiRoutingModule } from './datigrezzi-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [DatiGrezziComponent],
  imports: [
    CommonModule,
    DatiRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class DatiModule { }

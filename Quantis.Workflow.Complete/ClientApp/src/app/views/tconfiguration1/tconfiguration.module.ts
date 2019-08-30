import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TConfigurationComponent } from './tconfiguration.component';
import { TConfigurationAdvancedComponent } from './advanced/advanced.component';
import { TConfigurationRoutingModule } from './tconfiguration-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [TConfigurationComponent,TConfigurationAdvancedComponent],
  imports: [
    CommonModule,
    TConfigurationRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class TConfigurationModule { }

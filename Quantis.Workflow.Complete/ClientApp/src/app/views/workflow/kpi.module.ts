import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CommonModule } from '@angular/common';
import { KPIComponent } from './kpi.component';
import { KPIRoutingModule } from './kpi-routing.module';
import { RicercaComponent } from './ricerca/ricerca.component';
import { DataTablesModule } from 'angular-datatables';
import { ModalModule } from 'ngx-bootstrap/modal';
@NgModule({
  imports: [
    FormsModule,
    KPIRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    DataTablesModule,
    CommonModule,
    ModalModule.forRoot()
  ],
  declarations: [ KPIComponent, RicercaComponent ]
})
export class KPIModule { }

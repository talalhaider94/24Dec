import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { CommonModule } from '@angular/common';
import { KPIComponent } from './kpi.component';
import { KPIRoutingModule } from './kpi-routing.module';
import { RicercaComponent } from './ricerca/ricerca.component';
import { DataTablesModule } from 'angular-datatables';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { FileUploadModule } from 'ng2-file-upload';
import { CollapseModule } from 'ngx-bootstrap/collapse';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    KPIRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    DataTablesModule,
    CommonModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    FileUploadModule,
    CollapseModule.forRoot(),
  ],
  declarations: [ KPIComponent, RicercaComponent ]
})
export class KPIModule { }

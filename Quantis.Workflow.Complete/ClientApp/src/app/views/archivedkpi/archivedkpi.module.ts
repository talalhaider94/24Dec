import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ArchivedKpiComponent } from './archivedkpi.component';
import { ArchivedKpiRoutingModule } from './archivedkpi-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { DatePipe } from '@angular/common';
import { KeysPipe } from './keys.pipe'
import {NgxPaginationModule} from 'ngx-pagination';


@NgModule({
  declarations: [ArchivedKpiComponent, KeysPipe],
  imports: [
    NgxPaginationModule,
    CommonModule,
    ArchivedKpiRoutingModule,
    DataTablesModule,
    FormsModule,
    MomentModule.forRoot(),
   
  ],
 
})
export class ArchivedKpiModule { }

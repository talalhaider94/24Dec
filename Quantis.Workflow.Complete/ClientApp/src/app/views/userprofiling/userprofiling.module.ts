import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfilingComponent } from './userprofiling.component';
import { UserProfilingRoutingModule } from './userprofiling-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [UserProfilingComponent],
  imports: [
    CommonModule,
    UserProfilingRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class UserProfilingModule { }

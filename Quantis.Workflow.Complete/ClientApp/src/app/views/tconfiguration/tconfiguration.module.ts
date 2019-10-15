import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TConfigurationComponent } from './tconfiguration.component';
import { TConfigurationAdvancedComponent } from './advanced/advanced.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { TConfigurationRoutingModule } from './tconfiguration-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
    declarations: [TConfigurationComponent, TConfigurationAdvancedComponent, WorkflowComponent],
    imports: [
        CommonModule,
        TConfigurationRoutingModule,
        DataTablesModule,
        FormsModule,
        ModalModule.forRoot(),
    ]
})
export class TConfigurationModule { }

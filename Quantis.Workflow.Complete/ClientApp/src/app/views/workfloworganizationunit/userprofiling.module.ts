import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { AppModule } from './../../app.module';
import { UserProfilingComponent } from './userprofiling.component';
import { UserProfilingRoutingModule } from './userprofiling-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { AngularDualListBoxModule } from 'angular-dual-listbox';
import { FormsModule } from '@angular/forms';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
//import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

@NgModule({
    declarations: [UserProfilingComponent],
    imports: [
        //AppModule,
        CommonModule,
        UserProfilingRoutingModule,
        DataTablesModule,
        AngularDualListBoxModule,
        PerfectScrollbarModule,
        FormsModule,
        TreeViewModule,
        ModalModule.forRoot(),
        ButtonsModule.forRoot()
    ]
})
export class UserProfilingModule { }

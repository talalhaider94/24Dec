import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogoKpiComponent } from './catalogo-kpi/catalogo-kpi.component';
import { CatalogoUtentiComponent } from './catalogo-utenti/catalogo-utenti.component';
import { AdminUtentiComponent } from './admin-utenti/admin-utenti.component';
import { CatalogoRoutingModule } from './catalogo-routing.module';
import {DataTablesModule} from 'angular-datatables';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [CatalogoKpiComponent, CatalogoUtentiComponent, AdminUtentiComponent],
  imports: [
    CommonModule,
    CatalogoRoutingModule,
    DataTablesModule,
    FormsModule
  ]
})
export class CatalogoModule { }

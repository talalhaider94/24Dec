import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { CommingsoonComponent } from './commingsoon.component';
import { ComingSoonRoutingModule } from './comingsoon-routing.module';

@NgModule({
  imports: [
    FormsModule,
    ComingSoonRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot()
  ],
  declarations: [ CommingsoonComponent ]
})
export class ComingSoonModule { }

import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { DynamicModule } from 'ng-dynamic-component';
import { GridsterModule } from 'angular-gridster2';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import {DataTablesModule} from 'angular-datatables';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { LineChartComponent } from '../../widgets/line-chart/line-chart.component';
import { DoughnutChartComponent } from '../../widgets/doughnut-chart/doughnut-chart.component';
import { BarchartComponent } from '../../widgets/barchart/barchart.component';
import { MenuComponent } from '../../widgets/menu/menu.component';
import { PublicComponent } from './public/public.component';
import { DashboardListsComponent } from './dashboard-lists/dashboard-lists.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { KpiCountSummaryComponent } from '../../widgets/kpi-count-summary/kpi-count-summary.component';
import { CatalogPendingCountTrendsComponent } from '../../widgets/catalog-pending-count-trends/catalog-pending-count-trends.component';
import { DistributionByUserComponent } from '../../widgets/distribution-by-user/distribution-by-user.component';
import { KpiReportTrendComponent } from '../../widgets/kpi-report-trend/kpi-report-trend.component';
import { NotificationTrendComponent } from '../../widgets/notification-trend/notification-trend.component';
import { KpiCountByOrganizationComponent } from '../../widgets/kpi-count-by-organization/kpi-count-by-organization.component';
import { ChartDataComponent } from './chartdata/chartdata.component';
import { KpiStatusSummaryComponent } from '../../widgets/kpi-status-summary/kpi-status-summary.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    CommonModule,
    TreeViewModule,
    PerfectScrollbarModule,
    GridsterModule,
    DataTablesModule,
    DynamicModule.withComponents([
      LineChartComponent,
      DoughnutChartComponent,
      BarchartComponent,
      KpiCountSummaryComponent,
      DistributionByUserComponent,
      CatalogPendingCountTrendsComponent,
      KpiReportTrendComponent,
      NotificationTrendComponent,
      KpiCountByOrganizationComponent,
      KpiStatusSummaryComponent
    ]),
    HighchartsChartModule,
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
  ],
  declarations: [ 
    DashboardComponent,
    DoughnutChartComponent,
    LineChartComponent,
    MenuComponent,
    BarchartComponent,
    PublicComponent,
    DashboardListsComponent,
    KpiCountSummaryComponent,
    DistributionByUserComponent,
    CatalogPendingCountTrendsComponent,
    KpiReportTrendComponent,
    NotificationTrendComponent,
    KpiCountByOrganizationComponent,
    ChartDataComponent,
    KpiStatusSummaryComponent
  ]
})
export class DashboardModule { }

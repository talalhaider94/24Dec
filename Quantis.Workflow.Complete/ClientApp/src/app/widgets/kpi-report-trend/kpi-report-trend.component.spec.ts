import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiReportTrendComponent } from './kpi-report-trend.component';

describe('KpiReportTrendComponent', () => {
  let component: KpiReportTrendComponent;
  let fixture: ComponentFixture<KpiReportTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiReportTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiReportTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

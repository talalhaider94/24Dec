import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiStatusSummaryComponent } from './kpi-status-summary.component';

describe('KpiStatusSummaryComponent', () => {
  let component: KpiStatusSummaryComponent;
  let fixture: ComponentFixture<KpiStatusSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiStatusSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiStatusSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

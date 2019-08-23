import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCountSummaryComponent } from './kpi-count-summary.component';

describe('KpiCountSummaryComponent', () => {
  let component: KpiCountSummaryComponent;
  let fixture: ComponentFixture<KpiCountSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiCountSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiCountSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

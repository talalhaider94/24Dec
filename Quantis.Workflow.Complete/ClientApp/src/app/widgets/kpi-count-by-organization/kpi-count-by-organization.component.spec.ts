import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCountByOrganizationComponent } from './kpi-count-by-organization.component';

describe('KpiCountByOrganizationComponent', () => {
  let component: KpiCountByOrganizationComponent;
  let fixture: ComponentFixture<KpiCountByOrganizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiCountByOrganizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiCountByOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

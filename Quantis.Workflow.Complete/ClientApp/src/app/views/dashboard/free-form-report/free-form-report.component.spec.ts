import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeFormReportComponent } from './free-form-report.component';

describe('FreeFormReportComponent', () => {
  let component: FreeFormReportComponent;
  let fixture: ComponentFixture<FreeFormReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FreeFormReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeFormReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

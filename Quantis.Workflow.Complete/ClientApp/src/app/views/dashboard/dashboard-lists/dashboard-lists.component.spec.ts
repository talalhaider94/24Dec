import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardListsComponent } from './dashboard-lists.component';

describe('DashboardListsComponent', () => {
  let component: DashboardListsComponent;
  let fixture: ComponentFixture<DashboardListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

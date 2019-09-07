import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTrendComponent } from './notification-trend.component';

describe('NotificationTrendComponent', () => {
  let component: NotificationTrendComponent;
  let fixture: ComponentFixture<NotificationTrendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationTrendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

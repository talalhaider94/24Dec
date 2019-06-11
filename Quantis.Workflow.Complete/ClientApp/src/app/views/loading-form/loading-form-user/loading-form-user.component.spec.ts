import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingFormUserComponent } from './loading-form-user.component';

describe('LoadingFormUserComponent', () => {
  let component: LoadingFormUserComponent;
  let fixture: ComponentFixture<LoadingFormUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingFormUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingFormUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoUtentiComponent } from './catalogo-utenti.component';

describe('CatalogoUtentiComponent', () => {
  let component: CatalogoUtentiComponent;
  let fixture: ComponentFixture<CatalogoUtentiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CatalogoUtentiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CatalogoUtentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPartidoComponent } from './formulario-partido.component';

describe('FormularioPartidoComponent', () => {
  let component: FormularioPartidoComponent;
  let fixture: ComponentFixture<FormularioPartidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPartidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioPartidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

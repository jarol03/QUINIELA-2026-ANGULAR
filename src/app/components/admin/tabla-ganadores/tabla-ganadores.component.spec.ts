import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaGanadoresComponent } from './tabla-ganadores.component';

describe('TablaGanadoresComponent', () => {
  let component: TablaGanadoresComponent;
  let fixture: ComponentFixture<TablaGanadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaGanadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaGanadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

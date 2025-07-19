import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaPronosticosComponent } from './tabla-pronosticos.component';

describe('TablaPronosticosComponent', () => {
  let component: TablaPronosticosComponent;
  let fixture: ComponentFixture<TablaPronosticosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaPronosticosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaPronosticosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

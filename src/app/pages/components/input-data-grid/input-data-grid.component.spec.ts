import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDataGridComponent } from './input-data-grid.component';

describe('InputDataGridComponent', () => {
  let component: InputDataGridComponent;
  let fixture: ComponentFixture<InputDataGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputDataGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputDataGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

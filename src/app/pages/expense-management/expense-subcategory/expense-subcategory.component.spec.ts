import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSubcategoryComponent } from './expense-subcategory.component';

describe('ExpenseSubcategoryComponent', () => {
  let component: ExpenseSubcategoryComponent;
  let fixture: ComponentFixture<ExpenseSubcategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseSubcategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSubcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

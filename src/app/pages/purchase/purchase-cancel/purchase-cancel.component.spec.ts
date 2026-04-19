import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseCancelComponent } from './purchase-cancel.component';

describe('PurchaseCancelComponent', () => {
  let component: PurchaseCancelComponent;
  let fixture: ComponentFixture<PurchaseCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

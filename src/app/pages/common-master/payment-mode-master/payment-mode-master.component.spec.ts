import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentModeMasterComponent } from './payment-mode-master.component';

describe('PaymentModeMasterComponent', () => {
  let component: PaymentModeMasterComponent;
  let fixture: ComponentFixture<PaymentModeMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentModeMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentModeMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

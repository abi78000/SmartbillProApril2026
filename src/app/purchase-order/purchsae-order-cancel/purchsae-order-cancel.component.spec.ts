import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchsaeOrderCancelComponent } from './purchsae-order-cancel.component';

describe('PurchsaeOrderCancelComponent', () => {
  let component: PurchsaeOrderCancelComponent;
  let fixture: ComponentFixture<PurchsaeOrderCancelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchsaeOrderCancelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchsaeOrderCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

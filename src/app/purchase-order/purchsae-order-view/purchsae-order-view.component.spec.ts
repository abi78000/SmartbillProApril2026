import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchsaeOrderViewComponent } from './purchsae-order-view.component';

describe('PurchsaeOrderViewComponent', () => {
  let component: PurchsaeOrderViewComponent;
  let fixture: ComponentFixture<PurchsaeOrderViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchsaeOrderViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchsaeOrderViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

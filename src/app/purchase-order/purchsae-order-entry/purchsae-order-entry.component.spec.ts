import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchsaeOrderEntryComponent } from './purchsae-order-entry.component';

describe('PurchsaeOrderEntryComponent', () => {
  let component: PurchsaeOrderEntryComponent;
  let fixture: ComponentFixture<PurchsaeOrderEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchsaeOrderEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchsaeOrderEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

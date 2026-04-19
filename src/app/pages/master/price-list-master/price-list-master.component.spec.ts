import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListMasterComponent } from './price-list-master.component';

describe('PriceListMasterComponent', () => {
  let component: PriceListMasterComponent;
  let fixture: ComponentFixture<PriceListMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceListMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

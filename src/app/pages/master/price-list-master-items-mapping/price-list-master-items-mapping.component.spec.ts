import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListMasterItemsMappingComponent } from './price-list-master-items-mapping.component';

describe('PriceListMasterItemsMappingComponent', () => {
  let component: PriceListMasterItemsMappingComponent;
  let fixture: ComponentFixture<PriceListMasterItemsMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListMasterItemsMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceListMasterItemsMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

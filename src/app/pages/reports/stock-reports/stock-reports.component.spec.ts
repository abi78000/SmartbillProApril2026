import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockReportsComponent } from './stock-reports.component';

describe('StockReportsComponent', () => {
  let component: StockReportsComponent;
  let fixture: ComponentFixture<StockReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitReportsComponent } from './profit-reports.component';

describe('ProfitReportsComponent', () => {
  let component: ProfitReportsComponent;
  let fixture: ComponentFixture<ProfitReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

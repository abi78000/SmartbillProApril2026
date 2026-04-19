import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingReportsComponent } from './outstanding-reports.component';

describe('OutstandingReportsComponent', () => {
  let component: OutstandingReportsComponent;
  let fixture: ComponentFixture<OutstandingReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutstandingReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutstandingReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

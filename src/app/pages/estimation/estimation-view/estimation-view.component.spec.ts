import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimationViewComponent } from './estimation-view.component';

describe('EstimationViewComponent', () => {
  let component: EstimationViewComponent;
  let fixture: ComponentFixture<EstimationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimationViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

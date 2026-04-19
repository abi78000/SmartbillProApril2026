import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimationEntryComponent } from './estimation-entry.component';

describe('EstimationEntryComponent', () => {
  let component: EstimationEntryComponent;
  let fixture: ComponentFixture<EstimationEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimationEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimationEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

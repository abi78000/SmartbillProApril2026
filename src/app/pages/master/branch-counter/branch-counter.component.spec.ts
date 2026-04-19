import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchCounterComponent } from './branch-counter.component';

describe('BranchCounterComponent', () => {
  let component: BranchCounterComponent;
  let fixture: ComponentFixture<BranchCounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchCounterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

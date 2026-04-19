import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallGridComponent } from './small-grid.component';

describe('SmallGridComponent', () => {
  let component: SmallGridComponent;
  let fixture: ComponentFixture<SmallGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

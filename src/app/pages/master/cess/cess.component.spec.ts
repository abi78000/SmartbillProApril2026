import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CessComponent } from './cess.component';

describe('CessComponent', () => {
  let component: CessComponent;
  let fixture: ComponentFixture<CessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

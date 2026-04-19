import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterTableViewComponent } from './master-table-view.component';

describe('MasterTableViewComponent', () => {
  let component: MasterTableViewComponent;
  let fixture: ComponentFixture<MasterTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterTableViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

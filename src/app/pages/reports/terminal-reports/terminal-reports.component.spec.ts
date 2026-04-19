import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalReportsComponent } from './terminal-reports.component';

describe('TerminalReportsComponent', () => {
  let component: TerminalReportsComponent;
  let fixture: ComponentFixture<TerminalReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminalReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

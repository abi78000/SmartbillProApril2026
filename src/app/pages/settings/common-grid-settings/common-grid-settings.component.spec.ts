import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonGridSettingsComponent } from './common-grid-settings.component';

describe('CommonGridSettingsComponent', () => {
  let component: CommonGridSettingsComponent;
  let fixture: ComponentFixture<CommonGridSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonGridSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonGridSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

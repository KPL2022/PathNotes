import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmControlsErrFlagComponent } from './mm-controls-err-flag.component';

describe('MmControlsErrFlagComponent', () => {
  let component: MmControlsErrFlagComponent;
  let fixture: ComponentFixture<MmControlsErrFlagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MmControlsErrFlagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MmControlsErrFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

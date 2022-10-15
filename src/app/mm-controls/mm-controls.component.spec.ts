import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmControlsComponent } from './mm-controls.component';

describe('MmControlsComponent', () => {
  let component: MmControlsComponent;
  let fixture: ComponentFixture<MmControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MmControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MmControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

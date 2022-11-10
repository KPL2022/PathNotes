import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmControlsSideComponent } from './mm-controls-side.component';

describe('MmControlsSideComponent', () => {
  let component: MmControlsSideComponent;
  let fixture: ComponentFixture<MmControlsSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MmControlsSideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MmControlsSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

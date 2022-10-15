import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MmCanvasComponent } from './mm-canvas.component';

describe('MmCanvasComponent', () => {
  let component: MmCanvasComponent;
  let fixture: ComponentFixture<MmCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MmCanvasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MmCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreDispComponent } from './core-disp.component';

describe('CoreDispComponent', () => {
  let component: CoreDispComponent;
  let fixture: ComponentFixture<CoreDispComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoreDispComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoreDispComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

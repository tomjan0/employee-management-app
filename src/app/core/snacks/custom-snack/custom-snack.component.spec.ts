import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSnackComponent } from './custom-snack.component';

describe('SuccessSnackComponent', () => {
  let component: CustomSnackComponent;
  let fixture: ComponentFixture<CustomSnackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomSnackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSnackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

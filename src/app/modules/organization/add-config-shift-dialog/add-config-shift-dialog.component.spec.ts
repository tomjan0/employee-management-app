import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConfigShiftDialogComponent } from './add-config-shift-dialog.component';

describe('AddConfigShiftDialogComponent', () => {
  let component: AddConfigShiftDialogComponent;
  let fixture: ComponentFixture<AddConfigShiftDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddConfigShiftDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConfigShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

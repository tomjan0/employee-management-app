import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomPeriodDialogComponent } from './add-custom-period-dialog.component';

describe('AddCustomPeriodDialogComponent', () => {
  let component: AddCustomPeriodDialogComponent;
  let fixture: ComponentFixture<AddCustomPeriodDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomPeriodDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomPeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

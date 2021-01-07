import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetMinMaxHoursDialogComponent } from './set-min-max-hours-dialog.component';

describe('SetMinMaxHoursDialogComponent', () => {
  let component: SetMinMaxHoursDialogComponent;
  let fixture: ComponentFixture<SetMinMaxHoursDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetMinMaxHoursDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetMinMaxHoursDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

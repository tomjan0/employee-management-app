import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateScheduleDialogComponent } from './generate-schedule-dialog.component';

describe('GenerateScheduleDialogComponent', () => {
  let component: GenerateScheduleDialogComponent;
  let fixture: ComponentFixture<GenerateScheduleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateScheduleDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateScheduleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

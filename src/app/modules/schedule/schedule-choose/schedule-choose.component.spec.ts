import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleChooseComponent } from './schedule-choose.component';

describe('ScheduleChooseComponent', () => {
  let component: ScheduleChooseComponent;
  let fixture: ComponentFixture<ScheduleChooseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScheduleChooseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleChooseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

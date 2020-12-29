import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabilityViewComponent } from './availability-view.component';

describe('AvailabilityViewComponent', () => {
  let component: AvailabilityViewComponent;
  let fixture: ComponentFixture<AvailabilityViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailabilityViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabilityViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

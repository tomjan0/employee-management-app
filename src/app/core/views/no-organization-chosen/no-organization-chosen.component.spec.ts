import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoOrganizationChosenComponent } from './no-organization-chosen.component';

describe('NoOrganizationChosenComponent', () => {
  let component: NoOrganizationChosenComponent;
  let fixture: ComponentFixture<NoOrganizationChosenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoOrganizationChosenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoOrganizationChosenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

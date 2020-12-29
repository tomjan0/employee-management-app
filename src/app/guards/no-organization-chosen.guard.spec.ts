import { TestBed } from '@angular/core/testing';

import { NoOrganizationChosenGuard } from './no-organization-chosen.guard';

describe('NoOrganizationChosenGuard', () => {
  let guard: NoOrganizationChosenGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NoOrganizationChosenGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

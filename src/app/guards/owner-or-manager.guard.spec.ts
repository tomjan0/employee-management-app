import { TestBed } from '@angular/core/testing';
import {OwnerOrManagerGuard} from './owner-or-manager.guard';



describe('AdminOrOwnerGuard', () => {
  let guard: OwnerOrManagerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(OwnerOrManagerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

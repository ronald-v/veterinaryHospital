import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { securityGuardGuard } from './security-guard.guard';

describe('securityGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => securityGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

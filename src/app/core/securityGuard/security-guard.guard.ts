import { CanActivateFn } from '@angular/router';

export const securityGuardGuard: CanActivateFn = (route, state) => {
  return true;
};

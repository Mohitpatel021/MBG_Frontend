import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';

export const loginAuthGuard: CanActivateFn = (route, state) => {
  const authguard = inject(LoginService);
  const router = inject(Router);
  if (authguard.isLoggedIn()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

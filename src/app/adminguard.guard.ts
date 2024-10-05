import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';

export const adminguardGuard: CanActivateFn = (route, state) => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    router.navigate(['/admin']);
    return false;
  }
  return true;
};

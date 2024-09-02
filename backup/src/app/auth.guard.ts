import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login.service';
import { ShareServiceService } from './share-service.service';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authGuard = inject(LoginService);
  const router = inject(Router);
  const sharedService = inject(ShareServiceService);
  const cookies = inject(CookieService);
  if (cookies.get('token')) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

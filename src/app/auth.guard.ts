import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ShareServiceService } from './share-service.service';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  authorities: Array<{ authority: string }>;
  username: string;
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sharedService = inject(ShareServiceService);
  const token = sharedService.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  let decodedToken: DecodedToken;
  try {
    decodedToken = jwtDecode<DecodedToken>(token);
  } catch (error) {
    router.navigate(['/login']);
    return false;
  }
  const currentTime = new Date(Math.floor(Date.now() / 1000) * 1000).toLocaleString();
  if (new Date(decodedToken.exp * 1000).toLocaleString() < currentTime) {
    sharedService.clear();
    router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
    return false;
  }
  const requiredRoles = route.data?.['roles'];
  const role = decodedToken.authorities?.[0]?.authority;
  if (requiredRoles && !requiredRoles.includes(role)) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ShareServiceService } from './share-service.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sharedService = inject(ShareServiceService);
  if (sharedService.getItem('token')) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

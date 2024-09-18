import { NgModule } from '@angular/core';

import { RateUsComponent } from './rate-us/rate-us.component';


import { RouterModule, Routes } from '@angular/router';
import { ScanQrComponent } from './scan-qr/scan-qr.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ResponseRecordedComponent } from './response-recorded/response-recorded.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadChildren: () => import('./qr-user-module/qr-user-module.module').then(m => m.QrUserModuleModule),
  },
  {
    path: 'guest',
    loadChildren: () => import('./home-module/home-module.module').then(m => m.HomeModuleModule)
  },
  {
    path: 'd',
    loadChildren: () => import('./main-dashboard/main-dashboard.module').then(m => m.MainDashboardModule)
  },
  {
    path: 'login',
    redirectTo: '/register/login',
    pathMatch: 'full',
  },
  {
    path: 'response-recorded/:uuid',
    component: ResponseRecordedComponent,
  },
  {
    path: 'scan/:id',
    component: ScanQrComponent,
  },
  {
    path: 'rate-us',
    component: RateUsComponent,
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

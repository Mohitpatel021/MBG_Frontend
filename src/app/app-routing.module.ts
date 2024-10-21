import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResponseRecordedComponent } from './Modules/response-recorded/response-recorded.component';
import { ScanQrComponent } from './Modules/scan-qr/scan-qr.component';
import { RateUsComponent } from './Modules/rate-us/rate-us.component';
import { NotfoundComponent } from './Modules/notfound/notfound.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full',
  },
  {
    path: 'register',
    loadChildren: () => import('./Modules/qr-user-module/qr-user-module.module').then(m => m.QrUserModuleModule),
  },
  {
    path: 'guest',
    loadChildren: () => import('./Modules/home-module/home-module.module').then(m => m.HomeModuleModule)
  },
  {
    path: 'd',
    loadChildren: () => import('./Modules/main-dashboard/main-dashboard.module').then(m => m.MainDashboardModule)
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

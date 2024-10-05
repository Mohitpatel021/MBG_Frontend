import { NgModule } from '@angular/core';

import { LoginComponent } from './login/login.component';
import { QrGeneratorComponent } from './qr-generator/qr-generator.component';
import { RateUsComponent } from './rate-us/rate-us.component';
import { DownloadComponent } from './download/download.component';
import { RegisterComponent } from './register/register.component';
import { ResponseRecordedComponent } from './response-recorded/response-recorded.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BadReviewComponent } from './bad-review/bad-review.component';
import { authGuard } from './auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AllClientComponent } from './all-client/all-client.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'qr',
    component: QrGeneratorComponent,
  },
  {
    path: 'rate-us',
    component: RateUsComponent,
  },
  {
    path: 'download',
    component: DownloadComponent,
  },
  {
    path: '',
    component: RegisterComponent,
    pathMatch: 'full',
  },
  {
    path: 'response-recorded',
    component: ResponseRecordedComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'bad-review',
    component: BadReviewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
  },

  // {
  //   path: 'unavailable',
  //   component: ErrorComponent,
  // },
  {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

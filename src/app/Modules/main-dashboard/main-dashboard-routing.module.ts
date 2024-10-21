import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';

import { BadReviewComponent } from './bad-review/bad-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AllClientComponent } from './all-client/all-client.component';
import { ProfileComponent } from './profile/profile.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { authGuard } from '../../Guards/auth.guard';
import { PlansComponent } from './plans/plans.component';

const routes: Routes = [
  {
    path: 'dashboard/:uuid',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', "USER"] }
  },
  {
    path: 'bad-review/:uuid',
    component: BadReviewComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', "USER"] }
  },
  {
    path: 'admin/:uuid',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'all-client/:uuid',
    component: AllClientComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'profile/:uuid',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'USER'] }
  },
  {
    path: 'oauth/connect',
    component: AuthLoginComponent
  }
  ,
  {
    path: 'upgrade/plan/:uuid',
    component: PlansComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainDashboardRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from '../auth.guard';
import { BadReviewComponent } from './bad-review/bad-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AllClientComponent } from './all-client/all-client.component';

const routes: Routes = [
  {
    path: 'dashboard/:uuid',
    component: DashboardComponent,
    //  canActivate: [authGuard],
  },
  {
    path: 'bad-review/:uuid',
    component: BadReviewComponent,
    //  canActivate: [authGuard],
  },
  {
    path: 'admin/:uuid',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'all-client/:uuid',
    component: AllClientComponent,
    canActivate: [authGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainDashboardRoutingModule { }

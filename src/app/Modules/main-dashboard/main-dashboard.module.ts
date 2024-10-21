import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainDashboardRoutingModule } from './main-dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AllClientComponent } from './all-client/all-client.component';
import { BadReviewComponent } from './bad-review/bad-review.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

import 'boxicons';
import { ProfileComponent } from './profile/profile.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthLoginComponent } from './auth-login/auth-login.component';
import { LoginService } from '../../Services/login.service';
import { AdminService } from '../../Services/admin.service';
import { ShareServiceService } from '../../Services/share-service.service';
import { NoCacheInterceptor } from '../../Modals/no-cache.interceptor';
import { PlansComponent } from './plans/plans.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AllClientComponent,
    BadReviewComponent,
    AdminDashboardComponent,
    ProfileComponent,
    SidebarComponent,
    AuthLoginComponent,
    PlansComponent

  ],
  imports: [
    CommonModule,
    MainDashboardRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule.forRoot({}),


  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    LoginService,
    AdminService,
    ShareServiceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheInterceptor,
      multi: true,
    },
  ],

})
export class MainDashboardModule { }

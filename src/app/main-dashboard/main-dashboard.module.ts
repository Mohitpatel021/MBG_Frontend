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
import { NoCacheInterceptor } from '../no-cache.interceptor';
import { LoginService } from '../login.service';
import { ShareServiceService } from '../share-service.service';
import { AdminService } from '../admin.service';
import 'boxicons';
import { ProfileComponent } from './profile/profile.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AllClientComponent,
    BadReviewComponent,
    AdminDashboardComponent,
    ProfileComponent,
    SidebarComponent

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

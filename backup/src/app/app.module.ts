import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { QrGeneratorComponent } from './qr-generator/qr-generator.component';
import { RateUsComponent } from './rate-us/rate-us.component';
import { ResponseRecordedComponent } from './response-recorded/response-recorded.component';
import { CookieService } from 'ngx-cookie-service';
import { RegisterComponent } from './register/register.component';
import { DownloadComponent } from './download/download.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BadReviewComponent } from './bad-review/bad-review.component';
import { ShareServiceService } from './share-service.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AllClientComponent } from './all-client/all-client.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { CommonModule } from '@angular/common';
import { AdminService } from './admin.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    QrGeneratorComponent,
    RateUsComponent,
    ResponseRecordedComponent,
    RegisterComponent,
    DownloadComponent,
    DashboardComponent,
    BadReviewComponent,
    AdminDashboardComponent,
    AllClientComponent,
    NotfoundComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule,
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true,
      exclude: ['/send/email'],
    }),
  ],

  providers: [LoginService, CookieService, ShareServiceService, AdminService],
  bootstrap: [AppComponent],
})
export class AppModule { }

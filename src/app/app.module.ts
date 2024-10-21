
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './Services/login.service';
import { ShareServiceService } from './Services/share-service.service';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { NoCacheInterceptor } from './Modals/no-cache.interceptor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthConfig, OAuthModule, OAuthService } from 'angular-oauth2-oidc';
import { MainDashboardModule } from './Modules/main-dashboard/main-dashboard.module';
import { NotFoundModalComponent } from './Modules/not-found-modal/not-found-modal.component';
import { NotfoundComponent } from './Modules/notfound/notfound.component';
import { RateUsComponent } from './Modules/rate-us/rate-us.component';
import { ScanQrComponent } from './Modules/scan-qr/scan-qr.component';

@NgModule({
  declarations: [
    AppComponent,
    RateUsComponent,
    NotfoundComponent,
    ScanQrComponent,
    NotFoundModalComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MainDashboardModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      progressAnimation: 'decreasing',
      progressBar: true,
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true
    }),
    OAuthModule.forRoot(),
    ReactiveFormsModule,
    NgxUiLoaderModule.forRoot({
      "bgsColor": "#4bb1c8",
      "bgsOpacity": 0.5,
      "bgsPosition": "bottom-right",
      "bgsSize": 70,
      "bgsType": "three-strings",
      "blur": 2,
      "delay": 0,
      "fastFadeOut": true,
      "fgsColor": "#4bb1c8",
      "fgsPosition": "center-center",
      "fgsSize": 70,
      "fgsType": "three-strings",
      "gap": 24,
      "logoPosition": "center-center",
      "logoSize": 120,
      "logoUrl": "",
      "masterLoaderId": "master",
      "overlayBorderRadius": "0",
      "overlayColor": "rgba(40, 40, 40, 0.8)",
      "pbColor": "red",
      "pbDirection": "ltr",
      "pbThickness": 3,
      "hasProgressBar": false,
      "text": "",
      "textColor": "#FFFFFF",
      "textPosition": "center-center",
      "maxTime": -1,
      "minTime": 300
    }),
    NgxUiLoaderHttpModule.forRoot({
      showForeground: true
    }),
    FontAwesomeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    LoginService,
    ShareServiceService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  // constructor(private oauthService: OAuthService) {
  //   this.oauthService.configure(authConfig);
  //   this.oauthService.loadDiscoveryDocumentAndTryLogin();
  // }
}

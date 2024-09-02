
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from './login.service';
import { RateUsComponent } from './rate-us/rate-us.component';
import { ShareServiceService } from './share-service.service';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { NoCacheInterceptor } from './no-cache.interceptor';
import { ScanQrComponent } from './scan-qr/scan-qr.component';
import { NotFoundModalComponent } from './not-found-modal/not-found-modal.component';
import { MainDashboardModule } from './main-dashboard/main-dashboard.module';
import { NotfoundComponent } from './notfound/notfound.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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
export class AppModule { }

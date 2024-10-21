import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QrUserModuleRoutingModule } from './qr-user-module-routing.module';
import { DownloadComponent } from './download/download.component';
import { QrGeneratorComponent } from './qr-generator/qr-generator.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PaymentComponent } from './payment/payment.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule } from 'ngx-toastr';
import { LoginService } from '../../Services/login.service';
import { AdminService } from '../../Services/admin.service';
import { ShareServiceService } from '../../Services/share-service.service';
import { NoCacheInterceptor } from '../../Modals/no-cache.interceptor';


@NgModule({
  declarations: [
    DownloadComponent,
    QrGeneratorComponent,
    PaymentFailedComponent,
    PaymentComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    QrUserModuleRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ToastrModule,
    ReactiveFormsModule,
    NgxUiLoaderModule.forRoot({}),
    FontAwesomeModule
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
export class QrUserModuleModule { }

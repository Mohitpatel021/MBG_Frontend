import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeModuleRoutingModule } from './home-module-routing.module';
import { HomeComponent } from './home/home.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxUiLoaderHttpModule, NgxUiLoaderModule } from 'ngx-ui-loader';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RouterModule } from '@angular/router';
import { NoCacheInterceptor } from '../../Modals/no-cache.interceptor';



@NgModule({
  declarations: [
    PrivacyPolicyComponent,
    HomeComponent,
  ],
  imports: [
    CommonModule,
    HomeModuleRoutingModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxUiLoaderModule.forRoot({}),

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheInterceptor,
      multi: true,
    },
  ],
})
export class HomeModuleModule { }

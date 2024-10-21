
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DownloadComponent } from './download/download.component';
import { QrGeneratorComponent } from './qr-generator/qr-generator.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { PaymentFailedComponent } from './payment-failed/payment-failed.component';
import { PaymentComponent } from './payment/payment.component';
import { authGuard } from '../../Guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    pathMatch: 'full'
  },
  {
    path: 'checkout/:uuid',
    component: PaymentComponent,
  },
  {
    path: 'failed/:uuid',
    component: PaymentFailedComponent,
  },
  {
    path: 'qr/:uuid',
    component: QrGeneratorComponent,
    canActivate: [authGuard],
    data: { roles: ['USER', 'ADMIN'] }
  },
  {
    path: 'download/:uuid',
    component: DownloadComponent,
    canActivate: [authGuard],
    data: { roles: ['USER', 'ADMIN'] }
  },
  {
    path: 'login',
    component: LoginComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QrUserModuleRoutingModule {


}

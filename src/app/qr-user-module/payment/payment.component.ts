import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../login.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import Swal from 'sweetalert2';

import { WindowRefService } from '../../window-ref.service';
import { ShareServiceService } from '../../share-service.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  providers: [WindowRefService]
})
export class PaymentComponent implements OnInit {
  token: string = '';
  business_link: string = '';
  businessName: string = '';
  username: string = '';
  email: string = '';
  uuid: string = '';
  serialId: string = '';
  errorMessage: string = '';
  identity: string = '';
  paymentId: string = '';
  orderId: string = '';
  amount: string = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private sharedService: ShareServiceService,
    private winRef: WindowRefService,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.initializeProperty();
  }
  initializeProperty() {
    this.token = this.sharedService.getItem('token');
    const navigation = this.router.getCurrentNavigation();
    this.uuid = this.loginService.generateRandomUUID();
    this.business_link = navigation?.extras?.state?.['business_link'] || this.sharedService.getItem('business_link');
    this.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('businessName');
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    this.email = navigation?.extras?.state?.['email'] || this.sharedService.getItem('email');
    this.serialId = navigation?.extras?.state?.['serialId'] || this.sharedService.getItem('serialId');
    this.identity = navigation?.extras?.state?.['id'] || this.sharedService.getItem('clientId');
    this.paymentId = navigation?.extras?.state?.['paymentId'];
    this.orderId = navigation?.extras?.state?.['orderId'];
    this.amount = navigation?.extras?.state?.['amount'];
  }

  ngOnInit(): void {
    if (this.orderId && this.paymentId && this.amount) {
      this.openRazorpay({ payment: { amount: this.amount, orderId: this.orderId } });
    } else {
      this.createOrders();
    }
  }

  createOrders(): void {
    const amount: string = this.amount;
    this.loginService.createOrder(this.username, amount).subscribe(response => {
      this.openRazorpay(response);
    }, error => {
      console.error('Error creating order:', error);
    });
  }

  openRazorpay(orderInfo: any): void {
    const options = {
      key: 'rzp_live_hdy3f3dnwm3GDi',
      amount: orderInfo.payment.amount,
      currency: 'INR',
      description: 'Magical QR Transaction',
      order_id: orderInfo.payment.orderId,
      handler: (response: any) => {
        this.verifyPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: {
        name: this.businessName,
        email: this.email,
        contact: this.username
      },
      theme: {
        color: '#4e8eae'
      },
      modal: {
        ondismiss: () => {
          const uuid = this.loginService.generateRandomUUID();
          this.router.navigate(['/register/failed', uuid]);
        },
        escape: false,
      }
    };
    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      const uuid = this.loginService.generateRandomUUID();
      console.error('Payment failed:', response.error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: 'An error occurred during payment. Please try again.',
      });
      this.router.navigate(['/register/failed', uuid]);
    });
    rzp.open();

  }

  verifyPayment(paymentId: string, orderId: string, signature: string): void {
    this.ngxLodder.start();
    this.loginService.verifyPayment(paymentId, orderId, signature).subscribe(response => {
      if (response && HttpStatusCode.Ok) {
        this.ngxLodder.stop();
        this.router.navigate(['/register/qr', this.uuid], {
          state: {
            business_link: this.business_link,
            businessName: this.businessName,
            username: this.username,
            email: this.email,
            serialId: this.serialId,
            id: this.identity
          },
        });
      }
    }, error => {
      this.ngxLodder.stop();
      this.handleHttpError(error);
    });
  }

  private handleHttpError(error: any): void {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case HttpStatusCode.BadRequest:
          this.errorMessage = 'Bad Request. Please check the entered data.';
          break;
        case HttpStatusCode.Unauthorized:
          this.errorMessage = 'Unauthorized access. Please log in again.';
          break;
        case HttpStatusCode.Forbidden:
          this.errorMessage = 'Forbidden. You do not have permission to perform this action.';
          break;
        case HttpStatusCode.NotFound:
          this.errorMessage = 'Not Found. The requested resource could not be found.';
          break;
        case HttpStatusCode.InternalServerError:
          this.errorMessage = error.error.message || 'Internal Server Error. Please try again later.';
          break;
        default:
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
          break;
      }
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again later.';
    }
    this.router.navigate(['/register']);
    this.sharedService.clear();
  }
}

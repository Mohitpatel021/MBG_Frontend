import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../login.service';

import { HttpStatusCode } from '@angular/common/http';
import { QrCodeCreationDataRequest } from '../../qr-code-creation-data-request';
import { ShareServiceService } from '../../share-service.service';
@Component({
  selector: 'app-qr-generator',
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.css'],
})
export class QrGeneratorComponent implements OnInit {
  qrCodeImage: string = '';
  errorMessage: string = '';
  selectedTemplate: any;
  businessName: string = '';
  business_link: string = '';
  textToBeEncode: string = '';
  username: string = '';
  email: string = '';
  token: string = '';
  uuid: string = '';
  serialId: string = '';
  clientId: string = '';
  templates = [
    { id: 1, imgSrc: 'assets/Template 1.png' },
    { id: 2, imgSrc: 'assets/Template 2.png' },
    { id: 3, imgSrc: 'assets/Template 3.png' },
    // { id: 4, imgSrc: 'assets/Template 4.jpg' },
  ];
  constructor(
    private loginService: LoginService,
    private router: Router,
    private sharedService: ShareServiceService,
    private ngxLoader: NgxUiLoaderService
  ) {
    this.initiliseProperty();
  }

  initiliseProperty() {
    this.uuid = this.loginService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();
    this.business_link = navigation?.extras?.state?.['business_link'] || this.sharedService.getItem('business_link');
    this.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('businessName');
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    this.email = navigation?.extras?.state?.['email'] || this.sharedService.getItem('email');
    this.serialId = navigation?.extras?.state?.['serialId'] || this.sharedService.getItem('serialId');
    this.clientId = navigation?.extras?.state?.['id'] || this.sharedService.getItem('clientId');
    const encodedBusinessName = encodeURIComponent(this.businessName);
    const encodedBusinessLink = encodeURIComponent(this.business_link);
    const encodedId = encodeURIComponent(this.clientId);
    console.log("Data for checking ", this.business_link, this.businessName, this.username, this.email, this.serialId, this.clientId);
    // this.textToBeEncode = `http://localhost:4200/rate-us?business_name=${encodedBusinessName}&business_link=${encodedBusinessLink}&businessId=${encodedId}`;
    this.textToBeEncode = `https://app.reviewus.in/rate-us?business_name=${encodedBusinessName}&business_link=${encodedBusinessLink}&businessId=${encodedId}`;
  }

  ngOnInit(): void {
    this.token = this.sharedService.getItem('token');
    if (this.businessName && this.business_link) {
      // console.log("business name ", this.businessName);
      this.loadQrCode(() => { });
    } else {
      this.errorMessage = 'No Qr Generated Yet !!';
    }
  }
  selectTemplate(): void {
    if (this.selectedTemplate) {
      this.loadQrCode(() => {
        this.router.navigate(['/register/download', this.uuid], {
          state: {
            qrCodeImage: this.qrCodeImage,
            template: this.selectedTemplate,
            businessName: this.businessName,
            username: this.username,
            email: this.email,
          },
        });
      });
    }
  }
  private async loadQrCode(callback: () => void): Promise<void> {
    const data: QrCodeCreationDataRequest = {
      urlToBeEncoded: this.textToBeEncode,
      businessName: this.businessName,
      username: this.username,
      serialId: this.serialId
    };
    this.ngxLoader.start();
    try {
      const response = await this.loginService.getQrCode(data, this.token).toPromise();

      if (response.successfull && response.image) {
        this.qrCodeImage = response.image;
        this.sharedService.setItem('image', response.image);
        callback();
      } else {
        this.handleError(response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.ngxLoader.stop();
    }
  }

  private handleError(error: unknown): void {
    if (typeof error === 'string') {
      this.errorMessage = error;
    } else if (error instanceof Error) {
      this.errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      this.errorMessage = (error as { message: string }).message;
    } else {
      this.errorMessage = 'An unexpected error occurred';
    }
    console.error(this.errorMessage);
  }

}

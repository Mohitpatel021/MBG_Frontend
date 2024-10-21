import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../../Services/login.service';
import { ShareServiceService } from '../../../Services/share-service.service';
import { QrCodeCreationDataRequest } from '../../../Modals/qr-code-creation-data-request';


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
  ];

  constructor(
    private loginService: LoginService,
    private router: Router,
    private sharedService: ShareServiceService,
    private ngxLoader: NgxUiLoaderService
  ) {
    this.initiliseProperty();
  }

  async initiliseProperty() {
    this.uuid = this.loginService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();

    this.business_link = navigation?.extras?.state?.['business_link'] || (await this.sharedService.getItem('business_link'));
    this.businessName = navigation?.extras?.state?.['businessName'] || (await this.sharedService.getItem('businessName'));
    this.username = navigation?.extras?.state?.['username'] || (await this.sharedService.getItem('username'));
    this.email = navigation?.extras?.state?.['email'] || (await this.sharedService.getItem('email'));
    this.serialId = navigation?.extras?.state?.['serialId'] || (await this.sharedService.getItem('serialId'));
    this.clientId = navigation?.extras?.state?.['id'] || (await this.sharedService.getItem('clientId'));

    const encodedBusinessName = encodeURIComponent(this.businessName);
    const encodedBusinessLink = encodeURIComponent(this.business_link);
    const encodedId = encodeURIComponent(this.clientId);
    this.textToBeEncode = `https://app.reviewus.in/rate-us?business_name=${encodedBusinessName}&business_link=${encodedBusinessLink}&businessId=${encodedId}`;
  }

  async ngOnInit(): Promise<void> {
    this.token = await this.sharedService.getItem('token');
    if (this.businessName && this.business_link) {
      await this.loadQrCode(() => { });
    } else {
      this.errorMessage = 'No Qr Generated Yet !!';
    }
  }

  async selectTemplate(): Promise<void> {
    if (this.selectedTemplate) {
      await this.loadQrCode(() => {
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
      serialId: this.serialId,
      clientId: this.clientId,
    };
    this.ngxLoader.start();
    try {
      const response = await this.loginService.getQrCode(data, this.token).toPromise();

      if (response.successfull && response.image) {
        this.qrCodeImage = response.image;
        await this.sharedService.setItem('image', response.image);
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

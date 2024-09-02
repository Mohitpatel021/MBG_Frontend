import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoginService } from '../../login.service';

import { HttpStatusCode } from '@angular/common/http';
import { QrCodeCreationDataRequest } from '../../qr-code-creation-data-request';
import { ShareServiceService } from '../../share-service.service';
import { filter } from 'rxjs';
declare var Razorpay: any;
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
    // this.token = this.sharedService.getItem('token');
    this.uuid = this.loginService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.business_link = navigation?.extras.state['business_link'];
      this.businessName = navigation.extras.state['businessName'];
      this.username = navigation.extras.state['username'];
      this.email = navigation.extras.state['email'];
      this.serialId = navigation.extras.state['serialId'];
      this.clientId = navigation.extras.state['id']
    } else {
      this.business_link = this.sharedService.getItem('business_link');
      this.businessName = this.sharedService.getItem('businessName');
      this.username = this.sharedService.getItem('username');
      this.email = this.sharedService.getItem('email');
    }
    console.log(this.serialId);

    const encodedBusinessName = encodeURIComponent(this.businessName);
    const encodedBusinessLink = encodeURIComponent(this.business_link);
    const encodedId = encodeURIComponent(this.clientId);

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


  loadQrCode(callback: () => void): void {
    const data: QrCodeCreationDataRequest = {
      urlToBeEncoded: this.textToBeEncode,
      businessName: this.businessName,
      username: this.username,
      serialId: this.serialId
    }
    this.ngxLoader.start();
    // console.log("qr code creating");
    const token = this.sharedService.getItem('token');
    this.loginService.getQrCode(data, token).subscribe(
      (response) => {
        // console.log("qr code creating with this response is getting");
        if (response.successfull && response.image && HttpStatusCode.Ok) {
          this.ngxLoader.stop();
          this.qrCodeImage = response.image;

          callback();
        } else if (HttpStatusCode.NotFound) {
          this.errorMessage = response.message;
        } else {
          this.errorMessage = "Failed to generate QR code"
        }
      },
      (err) => {
        this.ngxLoader.stop();
        // console.log("error getting ", err.error.message);
        this.errorMessage = err.error.message || 'Error loading QR code';
      },
    );
  }
}

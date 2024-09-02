import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { CookieService } from 'ngx-cookie-service';
import { ShareServiceService } from '../share-service.service';
import { HttpStatusCode } from '@angular/common/http';
import { NgxUiLoaderService } from 'ngx-ui-loader';

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

  templates = [
    { id: 1, imgSrc: 'assets/Template 1.jpg' },
    { id: 2, imgSrc: 'assets/Template 2.jpg' },
    { id: 3, imgSrc: 'assets/Template 3.jpg' },
    // { id: 4, imgSrc: 'assets/Template 4.jpg' },
  ];
  constructor(
    private loginService: LoginService,
    private router: Router,
    private cookies: CookieService,
    private sharedService: ShareServiceService,

  ) {
    this.token = this.cookies.get('token');
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.business_link = navigation?.extras.state['business_link'];
      this.businessName = navigation.extras.state['businessName'];
      this.username = navigation.extras.state['username'];
      this.email = navigation.extras.state['email'];
    } else {
      this.business_link = this.cookies.get('business_link');
      this.businessName = this.cookies.get('businessName');
      this.username = this.cookies.get('username');
      this.email = this.cookies.get('email');
    }

    const encodedBusinessName = encodeURIComponent(this.businessName);
    const encodedBusinessLink = encodeURIComponent(this.business_link);
    this.textToBeEncode = `https://app.reviewus.in/rate-us?business_name=${encodedBusinessName}&business_link=${encodedBusinessLink}`;
  }

  ngOnInit(): void {
    this.token = this.cookies.get('token');
    if (this.businessName && this.business_link) {
      this.loadQrCode(() => { });
    } else {
      this.errorMessage = 'No Qr Generated Yet !!';
    }
  }

  selectTemplate(): void {
    if (this.selectedTemplate) {
      this.loadQrCode(() => {
        this.router.navigate(['/download'], {
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

    this.loginService.getQrCode(this.textToBeEncode, this.token).subscribe({
      next: (response) => {
        if (response.successfull && response.image && HttpStatusCode.Ok) {
          this.qrCodeImage = response.image;
          callback();
        } else {
          this.errorMessage = 'Failed to generate QR code';
        }
      },
      error: (err) => {
        this.errorMessage = 'Error loading QR code';
      },
    });
  }

  private setLoginSession(response: any): void {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const options = {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    };
    this.cookies.set('qr', response.image, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
  }
}

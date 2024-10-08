import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShareServiceService {
  private username: string = '';
  private businessName: string = '';
  private contact: string = '';
  private googleReviewLink: string = '';
  private qrImage: string = '';
  private token: string = '';
  private isAuth: boolean = false;

  getUsername(): string {
    return this.username;
  }
  setUsername(username: string): void {
    this.username = username;
  }

  getBusinessName(): string {
    return this.businessName;
  }

  setBusinessName(businessName: string): void {
    this.businessName = businessName;
  }

  getContact(): string {
    return this.contact;
  }
  setContact(contact: string): void {
    this.contact = contact;
  }

  setGoogleReviewLink(googleReviewLink: string) {
    this.googleReviewLink = googleReviewLink;
  }
  getGoogleReviewLink(): string {
    return this.googleReviewLink;
  }
  setQrImage(qrImage: string) {
    this.qrImage = qrImage;
  }
  getQrImage(): string {
    return this.qrImage;
  }

  getToken(): string {
    return this.token;
  }
  setToken(token: string) {
    this.token = token;
  }
  getIsAuth(): boolean {
    return this.isAuth;
  }
  setIsAuth(isAuth: boolean): void {
    this.isAuth = isAuth;
  }
}

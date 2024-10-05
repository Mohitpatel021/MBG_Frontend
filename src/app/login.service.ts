import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from './login-response';
import { RegisterResponse } from './register-response';
import { Feedback } from './feedback';
import { JwtHelperService } from '@auth0/angular-jwt';
import { QrCodeCreationDataRequest } from './qr-code-creation-data-request';
import { environment } from '../environments/environment.dev';
import { User } from './qr-user-module/login/login.component';

import { ShareServiceService } from './share-service.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private token;
  private username;
  private apiServerUrl = environment.apiUrl;
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private shareService: ShareServiceService,
  ) {
    this.token = this.shareService.getItem('token');
    this.username = this.shareService.getItem('username');
  }

  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }
  generateRandomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  isLoggedIn(): boolean {
    return !!this.shareService.getItem('token');
  }

  getRoleFromToken(token: string): string | null {
    const decodeToken = this.jwtHelper.decodeToken(token);
    this.shareService.setItem('role', decodeToken.role);
    return decodeToken ? decodeToken.role : null;
  }

  getTokenExpirationDate(token: string): Date | null {
    return this.jwtHelper.getTokenExpirationDate(token);
  }

  public loginUser(user: User): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiServerUrl}/login/jwt`,
      user
    );
  }

  //this method for generating qr
  getQrCode(request: QrCodeCreationDataRequest, token: string): Observable<any> {
    let headers = new HttpHeaders();
    if (token !== null && token !== undefined) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      headers = headers.set('Authorization', `Bearer ${this.token}`);
    }
    // console.log("calling api", request);
    return this.http.post<any>(`${this.apiServerUrl}/user/qr/url`, request, { headers });
  }

  //register a user
  registerUser(register: RegisterResponse): Observable<any> {
    if (!register) {
      throw new Error('RegisterResponse object is null or undefined');
    }
    const apiUrl = `${this.apiServerUrl}/login/register`;
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    return this.http.post<any>(apiUrl, register, httpOptions);
  }

  public getQrDataUsingserialId(serialId: string): Observable<any> {
    const params = new HttpParams().set("serialId", serialId);
    return this.http.get<any>(`${this.apiServerUrl}/user/fetch/qrdata`, { params });
  }

  createOrder(username: string, amount: string): Observable<any> {
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set("username", username).set("amount", amount);
    console.log("creating order for payment");
    return this.http.post<any>(
      `${this.apiServerUrl}/login/api/payment/create`, null, { params }
    );
  }

  verifyPayment(paymentId: string, orderId: string, signature: string): Observable<any> {
    console.log("verifying order for payment");
    // const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set("paymentId", paymentId).set("orderId", orderId).set("signature", signature);
    return this.http.post<any>(
      `${this.apiServerUrl}/login/api/payment/update`, null, { params }
    );
  }

  //saving a review
  saveReview(feedback: Feedback): Observable<any> {
    return this.http.post<any>(
      `${this.apiServerUrl}/user/save/review`,
      feedback
    );
  }

  //Getting all bad review
  getAllBadReview(username: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(`${this.apiServerUrl}/dashboard/user/review`, {
      headers,
      params,
    });
  }
  //get all bad reviewer
  getAllBadReviewer(
    username: string,
    page: number,
    elementSize: number,
    token: string,
    searchParam: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('username', username)
      .set('pageNumber', page.toString())
      .set('pageSize', elementSize.toString());
    if (searchParam && searchParam.trim() !== '') {
      params.set('searchParam', searchParam)
    }
    return this.http.get<any>(
      `${this.apiServerUrl}/dashboard/user/all/reviewer`,
      {
        headers,
        params,
      }
    );
  }
  //this is for sending an email
  sendEmail(formData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log(token, "email token");
    return this.http.post<any>(`${this.apiServerUrl}/user/send`, formData, {
      headers,
    });
  }

  updateProfile(
    username: string,
    updateData: RegisterResponse,
    token: string
  ): Observable<RegisterResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    const params = new HttpParams().set('username', username);
    return this.http.put<RegisterResponse>(
      `${this.apiServerUrl}/dashboard/update/profile`,
      updateData,
      { headers, params }
    );
  }
  // function for trim the serialId from the URL
  trimUrl(url: string): string {
    return url.substring(url.indexOf("MBG"));
  }

}

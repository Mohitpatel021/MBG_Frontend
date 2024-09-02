import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './login/login.component';
import { Observable } from 'rxjs';
import { LoginResponse } from './login-response';
import { CookieService } from 'ngx-cookie-service';
import { RegisterResponse } from './register-response';
import { Feedback } from './feedback';
import { ShareServiceService } from './share-service.service';
import { JwtHelperService } from '@auth0/angular-jwt';

interface EmailPayload {
  username: string;
  sendemailto: string;
  businessname: string;
  attachment: string;
}
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private token;
  private username;
  private errorMessage: string = '';
  private apiServerUrl = 'https://reviewus.in';

  // private apiServerUrl = 'http://localhost:9090';

  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private cookiesService: CookieService,
    private sharedService: ShareServiceService
  ) {
    this.token = this.cookiesService.get('token');
    this.username = this.cookiesService.get('username');
  }
  isTokenExpired(token: string): boolean {
    return this.jwtHelper.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    return !!this.cookiesService.get('token');
  }

  getRoleFromToken(token: string): string | null {
    const decodeToken = this.jwtHelper.decodeToken(token);
    this.cookiesService.set('role', decodeToken.role);
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
  getQrCode(textToEncode: string, token: string): Observable<any> {
    if (token === null || token === undefined) {
      const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${this.token}`
      );
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiServerUrl}/user/qr/url`, {
      headers,
      params: { textToBeEncoded: textToEncode },
      responseType: 'json',
    });
  }
  //register a user
  registerUser(register: RegisterResponse): Observable<any> {
    return this.http.post<any>(`${this.apiServerUrl}/login/register`, register);
  }

  //saving a review
  saveReview(feedback: Feedback): Observable<any> {
    return this.http.post<any>(
      `${this.apiServerUrl}/user/save/review`,
      feedback
    );
  }

  //Getting all bad review
  getAllBadReview(username: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );

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
    elementSize: number
  ): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.token}`
    );
    const params = new HttpParams()
      .set('username', username)
      .set('pageNumber', page.toString())
      .set('pageSize', elementSize.toString());
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
    // console.log(token);
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
}

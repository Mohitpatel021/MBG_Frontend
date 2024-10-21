import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';
import { Constant } from '../Constant/Constants';
import { ShareServiceService } from './share-service.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GoogleOAuthService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private oauthWindow: Window | null = null;

  constructor(
    private sharedService: ShareServiceService,
    private router: Router,
    private http: HttpClient
  ) { }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  /**
   * Open Google OAuth login modal and handle authentication
   */
  public openGoogleLoginModal(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const oauthUrl = `${environment.apiUrl}${Constant.GOOGLE_AUTH_LOGIN_URI}`;
      const windowFeatures = 'width=600,height=700,top=100,left=100';
      this.oauthWindow = window.open(oauthUrl, 'Google Login', windowFeatures);

      if (this.oauthWindow) {
        const interval = setInterval(() => {
          if (this.oauthWindow && this.oauthWindow.closed) {
            clearInterval(interval);
            resolve(); // OAuth window closed, return to main window
          }
        }, 1000);

        // Listen for messages from the OAuth window
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) {
            return; // Ignore messages from unknown origins
          }

          const token = event.data?.token;
          if (token) {
            this.sharedService.setItem('access_token', token); // Save token in shared service
            this.loggedIn.next(true); // Update login status

            if (this.oauthWindow) {
              this.oauthWindow.close(); // Close the OAuth window
              this.oauthWindow = null;
            }
            resolve();
          }
        });
      } else {
        reject('Please allow popups for this website.');
      }
    });
  }

  /**
   * Extract the access token from the URL
   */
  public extractTokenFromUrl(): string | null {
    console.log("Extracting token from URL...");
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');

    if (token) {
      this.sharedService.setItem('access_token', token);
      this.loggedIn.next(true);
      return token;
    } else {
      console.warn("No access token found in URL.");
      return null;
    }
  }

  /**
   * Fetch user profile using OAuth token
   */
  public getUserProfile(access_token: string, token: string): Observable<any> {
    if (!token) {
      return throwError('Token not found');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(`${environment.apiUrl}/api/gmb/accounts?access_token=${access_token}`, { headers }).pipe(
      map((response) => response),
      catchError((error) => {
        console.error("Error fetching user profile:", error);
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error("Error:", errorMessage);
    return throwError(errorMessage);
  }

  logout(): void {
    console.log("Logging out user...");
    this.sharedService.clear();
    this.router.navigate(['/register/login'], {
      queryParams: { loggedOut: 'true' },
      replaceUrl: true,
    });
  }
}

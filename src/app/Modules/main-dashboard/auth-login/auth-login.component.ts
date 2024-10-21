import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ShareServiceService } from '../../../Services/share-service.service';
import { GoogleOAuthService } from '../../../Services/google-oauth.service';

@Component({
  selector: 'app-auth-login',
  templateUrl: './auth-login.component.html',
  styleUrls: ['./auth-login.component.css'],
})
export class AuthLoginComponent implements OnInit {
  uuid: string = '';
  isLoggedIn = false;
  jwtToken: string | null = null;
  userProfile: any = null;
  businessName: string = '';
  username: string = '';
  businessId: string = '';

  constructor(
    private router: Router,
    private ngxLoader: NgxUiLoaderService,
    private sharedService: ShareServiceService,
    private authService: GoogleOAuthService,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.initializeProperties();
    this.checkForTokenInUrl();
  }

  /**
   * Initialize component properties based on navigation state or local storage
   */
  async initializeProperties() {
    try {
      const navigation = this.router.getCurrentNavigation();
      this.businessName = navigation?.extras?.state?.['businessName'] || await this.sharedService.getItem('business_name');
      this.username = navigation?.extras?.state?.['username'] || await this.sharedService.getItem('username');
      this.businessId = navigation?.extras?.state?.['businessId'] || await this.sharedService.getItem('businessId');
    } catch (error) {
      console.error('Error initializing properties:', error);
    }
  }

  /**
   * Open Google OAuth login modal
   */
  openGoogleLoginModal() {
    this.authService.openGoogleLoginModal().then(() => {
      this.checkForTokenInUrl(); // After login modal closes, check for token in URL
    }).catch((error) => {
      console.error('Error during OAuth process:', error);
    });
  }

  /**
   * Check if the token is available in the URL and process it
   */
  checkForTokenInUrl() {
    const token = this.authService.extractTokenFromUrl();
    if (token) {
      this.jwtToken = token;
      this.handlePostLogin();
    }
  }

  /**
   * Handle the post-login process: fetch user profile and manage state
   */
  async handlePostLogin() {
    this.ngxLoader.start();
    const access_token = await this.sharedService.getItem('access_token');
    const token = await this.sharedService.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      this.jwtToken = token;
      this.authService.getUserProfile(access_token, token).pipe(
        catchError(error => {
          console.error('Error fetching user profile', error);
          this.ngxLoader.stop();
          return of(null);
        })
      ).subscribe({
        next: (profile) => {
          if (profile) {
            this.userProfile = profile;
            this.router.navigate(['/main']);
          } else {
            this.handleFailedLogin();
          }
          this.ngxLoader.stop();
        },
        error: (err) => {
          console.error('Error during post-login profile fetching', err);
          this.handleFailedLogin();
          this.ngxLoader.stop();
        }
      });
    } else {
      this.handleFailedLogin();
    }
  }

  /**
   * Handle failed login scenarios
   */
  private handleFailedLogin() {
    this.isLoggedIn = false;
    this.jwtToken = null;
    this.sharedService.clear();
    this.toast.error("Login failed", "Something went wrong!");
  }

  /**
   * Logout and clear session data
   */
  logout(): void {
    this.authService.logout();
  }
}

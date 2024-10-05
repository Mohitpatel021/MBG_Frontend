import { Component } from '@angular/core';
import { LoginService } from '../login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpStatusCode } from '@angular/common/http';
import { ShareServiceService } from '../share-service.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private jwtHelper = new JwtHelperService();

  user: User = {
    username: '',
    password: '',
  };
  loginForm: FormGroup = this.fb.group({
    username: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
    ],
    password: ['', [Validators.required]],
  });

  errorMessage: string = '';
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private router: Router,
    private sharedService: ShareServiceService
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.user.username = this.loginForm.value.username;
      this.user.password = this.loginForm.value.password;
      this.loginService.loginUser(this.user).subscribe(
        (response) => {
          this.user.username = response.username;
          const token = response.token;

          if (HttpStatusCode.Ok) {
            this.setLoginSession(response);
            this.loginForm.reset();
            this.sharedService.setUsername(this.user.username);
            this.sharedService.setBusinessName(response.businessName);
            this.sharedService.setToken(response.token);
            this.sharedService.setIsAuth(response.isAuth);
            if (response.role === 'ADMIN') {
              this.router.navigate(['/admin'], {
                state: { username: this.user.username },
              });
            } else if (response.role === 'USER') {
              this.router.navigate(['/dashboard'], {
                state: {
                  username: this.user.username,
                  businessName: response.businessName,
                },
              });
            }
          }
        },
        (error) => {
          this.errorMessage = error.error.message;
          this.loginForm.reset();
        }
      );
    } else {
      this.errorMessage = 'Please fill all the required field correctly !';
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private setLoginSession(response: any): void {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const options = {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    };
    this.cookieService.set('token', response.token, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('role', response.role, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('username', response.username, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('business_name', response.businessName, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('business_link', response.businessLink, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('isAuth', response.isAuth, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookieService.set('expirationDate', response.expirationDate, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

export class User {
  username: string;
  password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

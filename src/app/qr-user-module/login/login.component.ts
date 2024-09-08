import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { LoginService } from '../../login.service';
import { ShareServiceService } from '../../share-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  uuid: string = '';
  user: User = {
    username: '',
    password: '',
  };
  loginForm: FormGroup = this.fb.group({
    username: [
      '',
      [Validators.required],
    ],
    password: ['', [Validators.required]],
  });

  errorMessage: string = '';
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private sharedService: ShareServiceService,
    private ngxLoder: NgxUiLoaderService,
    private routes: ActivatedRoute
  ) {
    this.uuid = loginService.generateRandomUUID();
  }
  ngOnInit(): void {
    this.routes.queryParams.subscribe((param) => {
      if (param['loggedOut'] === 'true') {
        this.toastr.success("Logged Out Successfull !! ", 'Logout')
        this.router.navigate([], {
          queryParams: { loggedOut: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        })
      }
    })
  }
  onSubmit() {
    if (this.loginForm.valid) {
      this.user.username = this.loginForm.value.username;
      this.user.password = this.loginForm.value.password;
      this.ngxLoder.start();
      this.loginService.loginUser(this.user).subscribe(
        (response) => {
          this.user.username = response.username;
          if (HttpStatusCode.Ok) {
            this.ngxLoder.stop();
            this.setLoginSession(response);
            this.loginForm.reset();
            // console.log("login response ", response);
            if (response.role === 'ADMIN') {
              this.router.navigate(['/d/admin', this.uuid], {
                state: { username: this.user.username },
              });
            } else if (response.role === 'USER') {
              // console.log("navigating user");
              this.router.navigate(['/d/dashboard', this.uuid], {
                state: {
                  username: this.user.username,
                  businessName: response.businessName,
                },
              });
            }
          }
        },
        (error: HttpErrorResponse) => {
          this.ngxLoder.stop();
          this.handleHttpError(error);
          this.loginForm.reset();
        }
      );
    } else {
      this.ngxLoder.stop();
      this.errorMessage = 'Please fill all the required field correctly !';
      this.markFormGroupTouched(this.loginForm);
    }
  }

  private setLoginSession(response: any): void {
    this.sharedService.setItem('token', response.token);
    this.sharedService.setItem('role', response.role);
    this.sharedService.setItem('username', response.username);
    this.sharedService.setItem('email', response.email);
    this.sharedService.setItem('business_name', response.businessName);
    this.sharedService.setItem('business_link', response.businessLink);
    this.sharedService.setItem('isAuth', response.isAuth);
    this.sharedService.setItem('expirationDate', response.expirationDate);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  private handleHttpError(error: HttpErrorResponse): void {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error occurred
      this.errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case HttpStatusCode.BadRequest:
          this.errorMessage = error.error.message || 'Invalid request. Please check your input and try again.';
          this.router.navigate(['/login']);
          break;
        case HttpStatusCode.Unauthorized:
          this.errorMessage = error.error.message || 'Unauthorized. Please check your credentials.';
          break;
        case HttpStatusCode.Forbidden:
          this.errorMessage = error.error.message || 'Access forbidden. You do not have the necessary permissions.';
          break;
        case HttpStatusCode.NotFound:
          this.errorMessage = error.error.message || 'Resource not found. Please try again.';
          break;
        case HttpStatusCode.Conflict:
          this.errorMessage = error.error.message || 'Conflict. The request could not be completed due to a conflict.';
          break;
        case HttpStatusCode.InternalServerError:
          this.errorMessage = error.error.message || 'Server error. Please try again later.';
          break;
        case HttpStatusCode.ServiceUnavailable:
          this.errorMessage = error.error.message || 'Service Unavailable. Please try again after sometime. ';
          this.router.navigate(['/login']);
          break;

        case 0:
          // This usually indicates a network issue
          this.errorMessage = 'No connection. Please check your internet connection and try again.';
          break;
        default:
          this.errorMessage = error.error.message || `Unexpected error: ${error.statusText}`;
          break;
      }
    }

    // Optionally log the error to the console or an external service
    console.error('HTTP Error:', error);
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

import { Component } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';
import { RegisterResponse } from '../register-response';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ShareServiceService } from '../share-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  errorMessage: string = '';
  name: string = '';
  userRole: string = '';

  registerForm: FormGroup;
  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private cookies: CookieService,
    private sharedService: ShareServiceService
  ) {
    this.registerForm = this.fb.group({
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      owner_email: ['', [Validators.required, Validators.email]],
      business_name: ['', Validators.required],
      business_link: [
        '',
        [Validators.required, Validators.pattern('^https://.*')],
      ],
    });
  }
  onSubmit() {
    if (this.registerForm.valid) {
      const formValues = this.registerForm.value;
      const registerData: RegisterResponse = {
        contact: formValues.contact,
        owner_email: formValues.owner_email,
        business_name: formValues.business_name,
        business_link: formValues.business_link,
      };

      this.loginService.registerUser(registerData).subscribe(
        (response) => {
          if (HttpStatusCode.Ok) {
            this.sharedService.setBusinessName(response.business_name);
            this.sharedService.setGoogleReviewLink(response.business_link);
            this.setSessionForm(response);
            this.router.navigate(['/qr'], {
              state: {
                business_link: formValues.business_link,
                businessName: formValues.business_name,
                username: formValues.contact,
                email: formValues.owner_email,
              },
            });
          }
        },
        (error) => {
          this.errorMessage = error.error.message;
          this.registerForm.reset();
        }
      );
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.markFormGroupTouched(this.registerForm);
    }
  }
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  //this will save the data into cookies
  setSessionForm(response: any) {
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const options = {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    };

    this.cookies.set('username', response.contact, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('email', response.owner_email, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('business_name', response.business_name, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('business_link', response.business_link, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('token', response.jwt, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('isAuth', response.isAuth, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('role', response.role, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
    this.cookies.set('expirationDate', response.expirationDate, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
  }
}

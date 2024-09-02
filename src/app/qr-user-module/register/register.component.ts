import { Component } from '@angular/core';
import { LoginService } from '../../login.service';
import { Router } from '@angular/router';
import { RegisterResponse } from '../../register-response';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ShareServiceService } from '../../share-service.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  errorMessage: string = '';
  name: string = '';
  userRole: string = '';
  uuid: string = '';
  serialId: string = '';
  showAdditionalInput: boolean = false;
  planValue: string = ''
  isMBGDSelected: boolean = false

  registerForm: FormGroup;
  constructor(
    private loginService: LoginService,
    private router: Router,
    private fb: FormBuilder,
    private sharedService: ShareServiceService,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.uuid = loginService.generateRandomUUID();
    this.registerForm = this.fb.group({
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      owner_email: ['', [Validators.required, Validators.email]],
      business_name: ['', Validators.required],
      business_link: ['', [Validators.required, Validators.pattern('^https://.*')]],
      dropdownvalue: ['', [Validators.required]],
      serialId: ['', [Validators.required]],
      additional_input: [''],
      planValue: ['']
    }, {
      validator: this.serialIdValidator,
      validators: this.planOrCouponValidator
    });
    this.registerForm.get('dropdownvalue')?.valueChanges.subscribe((value) => {
      this.toggleAdditonalInput(value);
    })
  }


  toggleAdditonalInput(value: string) {
    const additionalInputControl = this.registerForm.get('additional_input');
    if (value === "MBGD") {
      this.isMBGDSelected = true;
      this.showAdditionalInput = true
      additionalInputControl?.setValidators([Validators.required, Validators.pattern('^THEMAGICALQRCODE$')])
      additionalInputControl?.updateValueAndValidity();
    } else {
      this.showAdditionalInput = false
      additionalInputControl?.clearValidators();
    }
    additionalInputControl?.updateValueAndValidity();
  }
  planOrCouponValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const additionalInput = formGroup.get('additional_input')?.value;
      const planValue = formGroup.get('planValue')?.value;
      if (this.isMBGDSelected && !additionalInput) {
        return { additionalInputRequired: true };
      } else if (!this.isMBGDSelected && !planValue) {
        return { planValueRequired: true };
      }
      return null;
    };
  }
  serialIdValidator(formGroup: AbstractControl): { [key: string]: boolean } | null {
    const dropdownValue = formGroup.get('dropdownvalue')?.value;
    const serialId = formGroup.get('serialId')?.value;
    const concatedSerialId = dropdownValue + serialId;
    if (concatedSerialId && !concatedSerialId.startsWith('MBG')) {
      return { invalidSerialId: true }
    }
    return null;
  }
  onCheckboxChange(event: any) {
    this.showAdditionalInput = event.target.checked;
    this.registerForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValues = this.registerForm.value;
      const registerData: RegisterResponse = {
        contact: formValues.contact,
        owner_email: formValues.owner_email,
        businessname: formValues.business_name,
        business_link: formValues.business_link,
        serialId: formValues.dropdownvalue + formValues.serialId
      };
      this.ngxLodder.start()
      this.loginService.registerUser(registerData).subscribe(
        (response) => {
          if (HttpStatusCode.Ok) {
            this.ngxLodder.stop();
            if (response.payment) {
              this.initiatePayment(response);
            } else {
              this.ngxLodder.stop();
              this.processRegistrationResponse(response, formValues);
            }
          }
        },
        (error: HttpErrorResponse) => {
          this.ngxLodder.stop();
          this.handleHttpError(error);
          this.registerForm.reset();
        }
      );

    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
      this.markFormGroupTouched(this.registerForm);
    }

  }
  private processRegistrationResponse(response: any, formValues: any) {
    this.setSessionForm(response);
    const navigateTo = this.showAdditionalInput && (formValues.additional_input === 'THEMAGICALQRCODE') ? '/register/qr' : '/register/checkout';
    this.router.navigate([navigateTo, this.uuid], {
      state: {
        business_link: formValues.business_link,
        businessName: formValues.business_name,
        username: formValues.contact,
        email: formValues.owner_email,
        serialId: formValues.dropdownvalue + formValues.serialId,
        id: response.client.id,
        amount: formValues.planValue
      },
    });
  }

  private initiatePayment(response: any) {
    console.log(response);
    console.log(response.qrSerialId);

    this.router.navigate(['/register/checkout', this.uuid], {
      state: {
        business_link: response.business_link,
        businessName: response.business_name,
        username: response.contact,
        email: response.owner_email,
        serialId: response.qrSerialId,
        id: response.client.id,
        paymentId: response.payment.paymentId,
        orderId: response.payment.orderId,
        amount: response.payment.amount
      },
    });
  }

  private handleHttpError(error: HttpErrorResponse): void {
    if (error.error instanceof ErrorEvent) {

      this.errorMessage = `An error occurred: ${error.error.message}`;
    } else {

      switch (error.status) {
        case HttpStatusCode.BadRequest:

          this.errorMessage = error.error.message || 'Bad Request. Please check the entered data.';
          break;
        case HttpStatusCode.Unauthorized:
          this.errorMessage = error.error.message || 'Unauthorized access. Please log in again.';
          this.router.navigate(['/register/login']);
          break;
        case HttpStatusCode.Forbidden:
          this.errorMessage = error.error.message || 'Forbidden. You do not have permission to perform this action.';
          break;
        case HttpStatusCode.NotFound:
          this.errorMessage = error.error.message || 'Not Found. The requested resource could not be found.';
          break;
        case HttpStatusCode.Conflict:

          this.errorMessage = error.error.message || 'Conflict. This resource already exists.';
          break;
        case HttpStatusCode.InternalServerError:

          this.errorMessage = error.error.message || 'Internal Server Error. Please try again later.';
          break;
        case 0:

          this.errorMessage = error.error.message || 'No connection. Please check your internet connection and try again.';
          break;
        default:
          this.errorMessage = error.error.message || `Unexpected error occurred: ${error.statusText}`;
          break;
      }
    }
    // console.error('HTTP Error:', error);
    this.registerForm.reset();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  //this will save the data into cookies
  setSessionForm(response: any) {
    this.sharedService.setItem('username', response.contact);
    this.sharedService.setItem('email', response.owner_email);
    this.sharedService.setItem('business_name', response.business_name);
    this.sharedService.setItem('business_link', response.business_link);
    this.sharedService.setItem('token', response.jwt);
    this.sharedService.setItem('isAuth', response.isAuth);
    this.sharedService.setItem('role', response.role);
    this.sharedService.setItem('expirationDate', response.expirationDate);
  }
}

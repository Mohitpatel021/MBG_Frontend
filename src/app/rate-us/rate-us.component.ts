import { Component, OnInit } from '@angular/core';
import { Router, Event as NavigationEvent, NavigationEnd, NavigationStart } from '@angular/router';
import { LoginService } from '../login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpParams, HttpStatusCode } from '@angular/common/http';
import { filter } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-rate-us',
  templateUrl: './rate-us.component.html',
  styleUrls: ['./rate-us.component.css'],
})
export class RateUsComponent implements OnInit {
  businessName: string | any = '';
  googleReviewLink: string = '';
  errorMessage: string = '';
  feedbackData!: FormGroup;
  business_link: string | any = '';
  rating = 0;
  stars = [1, 2, 3, 4, 5];
  uuid: string = '';
  clientId: string | any = ''

  constructor(
    private router: Router,
    private loginService: LoginService,
    private fb: FormBuilder,
    private ngxLodder: NgxUiLoaderService
  ) {

    this.uuid = loginService.generateRandomUUID();
    this.router.events.pipe(
      filter((event: NavigationEvent) => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.router.url === '/rate-us') {
        this.resetForm();  // Reset form data and state when navigating to this component
      }
    });

    // Listen for navigation start events to clear form data when navigating away
    this.router.events.pipe(
      filter((event: NavigationEvent) => event instanceof NavigationStart)
    ).subscribe((event: NavigationEvent) => {
      if ((event as NavigationStart).url !== '/rate-us') {
        this.resetForm();  // Clear form data when navigating away from this component
      }
    });
  }
  ngOnInit(): void {
    this.resetForm();
    this.rating = 0;
    this.businessName = this.extractParam('business_name');
    this.business_link = this.extractAndDecodeBusinessLink('business_link');
    this.clientId = this.extractIdValue('businessId');
    this.googleReviewLink = this.business_link;
    this.setupFeedbackForm();

  }
  resetForm() {
    sessionStorage.removeItem('rating');
    this.rating = 0;
    this.setupFeedbackForm();
    if (this.feedbackData) {
      this.feedbackData.reset();
    }
  }
  setupFeedbackForm() {
    this.feedbackData = this.fb.group({
      reviewerName: [''],
      number: ['', [Validators.pattern('^[0-9]{10}$')]],
      reviewContent: [''],
      rating: [this.rating, Validators.required],
      businessName: [this.businessName],
    });
  }

  extractIdValue(paramName: string): string | null {
    const url = window.location.href;
    const params = new URLSearchParams(url.split('?')[1]);
    if (params.has(paramName)) {
      return params.get(paramName);
    }
    return null;
  }

  extractAndDecodeBusinessLink(paramName: string): string | null {
    const url = window.location.href;
    let paramValue = '';
    let result = '';
    if (url.includes(paramName)) {
      const queryString = url.split(paramName)[1];
      paramValue = decodeURIComponent(decodeURIComponent(queryString));
      if (paramValue.startsWith('=')) {
        paramValue = paramValue.slice(1);
        const clientIdIndex = paramValue.indexOf('&businessId');
        console.log("clientIdIndex ", clientIdIndex);
        if (clientIdIndex !== -1) {
          result = paramValue.substring(0, clientIdIndex);
        } else {
          result = paramValue;
        }
      }
    }
    return result || null;
  }
  extractParam(paramName: string): string | null {
    const url = window.location.href;
    let paramValue = null;
    if (url.includes('?')) {
      const httpParams = new HttpParams({ fromString: url.split('?')[1] });
      paramValue = httpParams.get(paramName);
      if (paramValue) {
        paramValue = decodeURIComponent(paramValue);
        if (paramValue.includes('&')) {
          paramValue = paramValue.split('&')[0];
        }
        paramValue = paramValue.trim();
      }
    }
    return paramValue;
  }

  setRating(index: number): void {
    this.rating = index + 1;
    this.errorMessage = ''
    this.feedbackData.patchValue({ rating: this.rating });
    if (this.rating >= 4) {
      window.location.href = this.googleReviewLink;
    }
  }

  submitFeedback(): void {
    // Check if a rating has been selected
    if (this.rating === 0) {
      this.errorMessage = 'Please select a star rating!';
      return;
    }

    // Check if the feedback form is valid
    if (this.feedbackData.valid) {
      const feedback = {
        ...this.feedbackData.value,
        businessName: this.businessName,
        rating: this.rating,
        clientId: this.clientId,
      };

      // Start the loader before making the HTTP request
      this.ngxLodder.start();

      // Make the HTTP request to save the review
      this.loginService.saveReview(feedback).subscribe(
        (response) => {
          // Stop the loader after receiving the response
          this.ngxLodder.stop();

          // Handle the response based on the HTTP status code
          if (response && HttpStatusCode.Ok) {
            console.log('Feedback submitted successfully:', response);
            this.router.navigate(['/response-recorded', this.uuid]);
          } else {
            this.errorMessage = 'Failed to submit feedback. Please try again.';
          }
        },
        (error) => {
          // Stop the loader if an error occurs
          this.ngxLodder.stop();
          this.errorMessage = error.error.message;
          if (error.status === 0) {
            console.error('Network error:', error);
            this.errorMessage = error.error.message || 'Network error: Please check your internet connection.';
          } else if (error.status === 401) {
            // Unauthorized
            console.error('Unauthorized access:', error);
            this.errorMessage = error.error.message || 'Unauthorized access: Please login again.';
            this.router.navigate(['/register/login']);  // Redirect to login
          } else if (error.status === 403) {
            // Forbidden
            console.error('Forbidden:', error);
            this.errorMessage = error.error.message || 'You do not have permission to perform this action.';
          } else if (error.status === 404) {
            // Not Found
            console.error('Resource not found:', error);
            this.errorMessage = error.error.message || 'The resource you are trying to access was not found.';
          } else if (error.status === 500) {
            // Internal Server Error
            console.error('Internal server error:', error);
            this.errorMessage = error.error.message || 'An unexpected error occurred on the server. Please try again later.';
          } else {
            // General error handling for other status codes
            console.error('An unexpected error occurred:', error);
            this.errorMessage = error.error.message || 'An unexpected error occurred. Please try again later.';
          }
        }
      );
    } else {
      // Display an error message if the form is invalid
      this.errorMessage = 'Please fill out all required fields.';
    }
  }



}

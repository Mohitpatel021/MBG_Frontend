import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, Event as NavigationEvent, NavigationEnd, NavigationStart } from '@angular/router';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpParams, HttpStatusCode } from '@angular/common/http';
import { filter } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LoginService } from '../../Services/login.service';

@Component({
  selector: 'app-rate-us',
  templateUrl: './rate-us.component.html',
  styleUrls: ['./rate-us.component.css'],
})
export class RateUsComponent implements OnInit, OnDestroy {
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
  ngOnDestroy(): void {
    this.rating = 0;
    this.feedbackData.reset();
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
      this.feedbackData.reset();
    }
  }

  submitFeedback(): void {
    if (this.rating === 0) {
      this.errorMessage = 'Please select a star rating!';
      return;
    }
    if (this.rating >= 4) {
      this.errorMessage = 'Please select a lower rating for critical feedback. Thank you!';
      return;
    }

    const feedback = {
      ...this.feedbackData.value,
      businessName: this.businessName,
      rating: this.rating,
      clientId: this.clientId,
    };

    // Ensure valid feedback data before proceeding (security checks)
    if (!this.isFeedbackValid(feedback)) {
      this.errorMessage = 'Invalid feedback data. Please review your input.';
      return;
    }

    // Start the loading indicator
    this.ngxLodder.start();
    // Call the API to save the review (server-side)
    this.loginService.saveReview(feedback).subscribe({
      next: (response) => {
        // Stop the loader
        this.ngxLodder.stop();

        // Handle successful response
        if (HttpStatusCode.Ok) {
          // Notify the user and redirect
          this.router.navigate(['/response-recorded', this.uuid]);
        } else {
          // Handle failed submission case
          this.errorMessage = 'Feedback submission failed. Please try again later.';
          // console.error('Unexpected response:', response);
        }
      },
      error: (error) => {
        // Stop the loader on error
        this.ngxLodder.stop();

        // Handle error scenarios
        switch (error.status) {
          case 0:
            this.errorMessage = 'Network error: Please check your internet connection.';
            break;
          case 401:
            this.errorMessage = 'Unauthorized: Please log in again.';
            this.router.navigate(['/register/login']);  // Redirect to login page
            break;
          case 403:
            this.errorMessage = 'Forbidden: You do not have permission to submit this feedback.';
            break;
          case 404:
            this.errorMessage = 'Resource not found: The server could not find the requested resource.';
            break;
          case 500:
            this.errorMessage = 'Server error: An error occurred on the server. Please try again later.';
            break;
          default:
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
            break;
        }

        // Log error for troubleshooting (without exposing sensitive data)
        console.error('API error:', error);
      },
      complete: () => {
        // Perform any cleanup if necessary
        // console.log('Feedback submission completed.');
      },
    });
  }

  /**
   * Validates feedback data to ensure it meets basic security and integrity checks.
   * @param feedback The feedback data object.
   * @returns True if the feedback data is valid, false otherwise.
   */
  private isFeedbackValid(feedback: any): boolean {
    // Perform additional validation such as sanitization or length checks.
    if (!feedback.businessName || feedback.businessName.trim().length === 0) {
      return false;
    }

    if (!feedback.rating || feedback.rating < 1 || feedback.rating > 5) {
      return false;
    }

    // Example: You can add more checks, such as checking for XSS, SQL injections, etc.
    return true;
  }




}
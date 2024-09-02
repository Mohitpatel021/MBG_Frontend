import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from '../login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShareServiceService } from '../share-service.service';
import { HttpParams } from '@angular/common/http';

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
  rating = -1;
  stars = [0, 1, 2, 3, 4];

  constructor(
    private router: Router,
    private cookies: CookieService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private fb: FormBuilder,
    private sharedServices: ShareServiceService
  ) {}

  ngOnInit(): void {
    this.businessName = this.extractParam('business_name');
    this.business_link = this.extractAndDecodeBusinessLink('business_link');

    this.googleReviewLink = this.business_link;
    this.feedbackData = this.fb.group({
      reviewerName: ['', Validators.required],
      number: ['', Validators.required],
      reviewContent: ['', Validators.required],
      rating: [this.rating, Validators.required],
      businessName: [this.businessName],
    });
  }
  extractAndDecodeBusinessLink(paramName: string): string | null {
    const url = window.location.href;
    let paramValue = '';
    let result = '';

    if (url.includes(paramName)) {
      const queryString = url.split(paramName)[1];
      paramValue = decodeURIComponent(decodeURIComponent(queryString));
      if (paramValue.startsWith('=')) {
        const params = paramValue.slice(1);
        result = params;
      }
    }
    return result;
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
    this.feedbackData.patchValue({ rating: this.rating });
    if (this.rating >= 4) {
      // console.log(this.googleReviewLink);
      window.location.href = this.googleReviewLink;
    }
  }

  submitFeedback(): void {
    if (this.feedbackData.valid) {
      const feedback = {
        ...this.feedbackData.value,
        businessName: this.businessName,
        rating: this.rating,
      };

      this.loginService.saveReview(feedback).subscribe(
        (response) => {
          this.router.navigateByUrl('/response-recorded');
        },
        (error) => {
          this.errorMessage =
            'There was an error submitting your feedback. Please try again later.';
        }
      );
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }
}

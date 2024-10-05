import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AfterViewInit, Component, HostListener, OnInit, SimpleChanges } from '@angular/core';
import { ReviewResponse } from '../../review-response';
import { Router } from '@angular/router';
import { LoginService } from '../../login.service';
import { HttpStatusCode } from '@angular/common/http';
import { ShareServiceService } from '../../share-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
  uuid: string = '';
  businessId: string = '';
  recentReview: any[] = [];
  recentReviewTotalElement: string = '';
  lastMonthReview: string = '';
  form: ReviewResponse = {
    totalBadReviews: '',
    businessName: '',
    message: '',
  };
  errorMessage: any;
  isDropdownOpen: boolean = false;
  isProfileSidebarVisible: boolean = false;
  updateProfileForm: FormGroup;


  constructor(
    private sharedService: ShareServiceService,
    private router: Router,
    private loginService: LoginService,
    private fb: FormBuilder,
    private ngxLodder: NgxUiLoaderService,
    private adminService: AdminService
  ) {
    // console.log("inside the dashbaoard component");
    this.updateProfileForm = this.fb.group({
      owner_email: ['', [Validators.required, Validators.email]],
      businessName: ['', Validators.required],
      businessLink: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.initialisationProperty();
  }

  initialisationProperty() {
    const navigation = this.router.getCurrentNavigation();
    this.form.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('business_name');
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    if (!this.form.businessName && !this.username) {
      this.router.navigate(['/register/login']);
      this.logout();
      this.sharedService.clear();
    }

  }


  ngOnInit(): void {
    this.uuid = this.loginService.generateRandomUUID();
    this.getAllBadReviewsAndRecentReviewers();
    this.populateUserDetails();
  }
  getAllBadReviewsAndRecentReviewers() {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();
    this.loginService.getAllBadReview(this.username, token)
      .pipe(
        switchMap((data) => {
          if (data && HttpStatusCode.Ok) {
            this.businessId = data.clientId;
            this.form.totalBadReviews = data.totalBadReviews;
            this.form.businessName = data.businessName;
            this.form.message = data.message;
            return this.adminService.recentReviews(this.username, this.businessId, token);
          } else {
            this.ngxLodder.stop();
            this.router.navigate(['/register/login']);
            return of(null);
          }
        }),
        switchMap((response) => {
          if (response && HttpStatusCode.Ok) {
            this.recentReview = response.reviews;
            this.recentReviewTotalElement = response.totalElements;
            return this.adminService.lastMonthReview(this.username, this.businessId, token);
          } else {
            this.ngxLodder.stop();
            return of(null); // If no recent reviews, skip last month review call
          }
        })
      )
      .subscribe(
        (lastMonthData) => {
          this.ngxLodder.stop();
          if (lastMonthData && HttpStatusCode.Ok) {
            // console.log("Last month review count response ----> : ", lastMonthData);
            this.lastMonthReview = lastMonthData.totalBadReviews;
            this.form.message = lastMonthData.message
          } else {
            console.log('No last month reviews fetched.');
          }
        },
        (error) => {
          this.ngxLodder.stop();
          this.errorMessage = error.error.message;

          if (error.status === HttpStatusCode.Unauthorized) {

            this.errorMessage = error.error.message || 'Unauthorized access - please login again.';
            this.router.navigate(['/register/login']);
          } else if (error.status === HttpStatusCode.Forbidden) {
            ;
            this.errorMessage = error.error.message || 'You do not have permission to perform this action.';
          } else if (error.status === HttpStatusCode.NotFound) {

            this.errorMessage = error.error.message || 'The user you are trying to manage does not exist.';
          } else if (error.status === HttpStatusCode.InternalServerError) {

            this.errorMessage = error.error.message || 'An unexpected error occurred. Please try again later.';
          } else {
            console.error('An unexpected error occurred.');
            this.errorMessage = error.error.message || 'An unexpected error occurred. Please try again later.';
          }
        }
      );
  }
  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleProfileSidebar(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileSidebarVisible = !this.isProfileSidebarVisible;
    this.isDropdownOpen = false;
  }
  populateUserDetails() {
    const owner_email = this.sharedService.getItem('email');
    const businessName = this.sharedService.getItem('business_name');
    const businessLink = this.sharedService.getItem('business_link');
    const contact = this.sharedService.getItem('username');

    this.updateProfileForm.setValue({
      owner_email: owner_email,
      businessName: businessName,
      businessLink: businessLink,
      contact: contact,
    });
    this.updateProfileForm.disable();
  }
  setSessionForm(response: any) {
    const expirationDate = new Date().getTime() + 12 * 60 * 60 * 1000;
    this.sharedService.setItem('username', response.contact);
    this.sharedService.setItem('business_name', response.business_name);
    this.sharedService.setItem('business_link', response.business_link);
    this.sharedService.setItem('email', response.owner_email);
    this.sharedService.setItem('expirationDate', expirationDate);
  }

  logout(): void {
    this.ngxLodder.start()
    this.router.navigate(['/register/login'], {
      queryParams: { loggedOut: 'true' },
      replaceUrl: true
    });
    this.sharedService.clear()
    this.ngxLodder.stop()
  }
}

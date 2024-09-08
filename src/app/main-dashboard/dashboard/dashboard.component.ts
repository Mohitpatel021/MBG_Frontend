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
  isButtonDisabled: boolean = true;

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
    const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');
    sideLinks.forEach(item => {
      const li = item.parentElement;
      item.addEventListener('click', () => {
        sideLinks.forEach(i => {
          i.parentElement?.classList.remove('active');
        });
        li?.classList.add('active');
      });
    });

    const menuBar = document.querySelector('.content nav .bx.bx-menu');
    const sideBar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    const sideBarToggle = document.querySelector('.sidebar-toggle');
    if (window.innerWidth > 896) {
      sideBarToggle?.classList.add('hidden');
    }
    sideBarToggle?.addEventListener('click', () => {
      if (window.innerWidth <= 896) {
        sideBar?.classList.toggle('open');
        content?.classList.toggle('blur');
      }
    });
    menuBar?.addEventListener('click', () => {
      if (window.innerWidth <= 896) {
        sideBar?.classList.toggle('open');
        content?.classList.toggle('blur');
      }
    });
    const searchBtn = document.querySelector('.content nav form .form-input button');
    const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
    const searchForm = document.querySelector('.content nav form');
    searchBtn?.addEventListener('click', function (e) {
      if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm?.classList.toggle('show');
        if (searchForm?.classList.contains('show')) {
          searchBtnIcon?.classList.replace('bx-search', 'bx-x');
        } else {
          searchBtnIcon?.classList.replace('bx-x', 'bx-search');
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 896) {
        sideBar?.classList.remove('open');
        content?.classList.remove('blur');
      }
    });
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
            // console.log("all bad reviews Count review Response--> ", data);
            return this.adminService.recentReviews(this.username, this.businessId, token);
          } else {
            this.ngxLodder.stop();
            this.router.navigate(['/register/login']);
            return of(null);
          }
        }),
        switchMap((response) => {
          if (response && HttpStatusCode.Ok) {
            // console.log("recent three reviews response----->", response);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    const isClickInsideDropdown = targetElement.closest('.dropdown') != null;
    const isClickInsideProfileSidebar =
      targetElement.closest('.profile-sidebar') != null;
    if (!isClickInsideDropdown) {
      this.isDropdownOpen = false;
    }
    if (!isClickInsideProfileSidebar) {
      this.isProfileSidebarVisible = false;
    }
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

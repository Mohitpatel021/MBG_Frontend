import { Component, HostListener, OnInit } from '@angular/core';
import { ShareServiceService } from '../share-service.service';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { CookieService } from 'ngx-cookie-service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterResponse } from '../register-response';

@Component({
  selector: 'app-bad-review',
  templateUrl: './bad-review.component.html',
  styleUrls: ['./bad-review.component.css'],
})
export class BadReviewComponent implements OnInit {
  username: string = '';
  businessName: string = '';
  reviews: any[] = [];
  pageNumber: number = 0;
  elementSize: number = 5;
  totalElements: number = 0;
  totalPages: number = 0;
  errorMessage: string = '';
  isDropdownOpen: any;
  isProfileSidebarVisible: boolean = false;
  updateProfileForm: FormGroup;

  constructor(
    private sharedService: ShareServiceService,
    private router: Router,
    private loginService: LoginService,
    private cookies: CookieService,
    private fb: FormBuilder
  ) {
    this.updateProfileForm = this.fb.group({
      owner_email: ['', [Validators.required, Validators.email]],
      businessName: ['', Validators.required],
      businessLink: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = navigation?.extras.state['username'];
      this.businessName = navigation?.extras.state['businessName'];
    }
  }

  ngOnInit(): void {
    this.fetchBadReviews();
  }
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (sidebar.classList.contains('sidebar-collapsed')) {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.classList.add('sidebar-expanded');
      } else {
        sidebar.classList.remove('sidebar-expanded');
        sidebar.classList.add('sidebar-collapsed');
      }
    }
  }
  //Fetch all the bad reviewers
  fetchBadReviews() {
    this.loginService
      .getAllBadReviewer(this.username, this.pageNumber, this.elementSize)
      .subscribe(
        (response) => {
          if (HttpStatusCode.Ok) {
            this.reviews = response.reviews;
            this.elementSize = response.elementSize;
            this.pageNumber = response.pageNumber;
            this.totalElements = response.totalElements;
            this.totalPages = response.totalPages;
          }
        },
        (error: HttpErrorResponse) => {
          if (HttpStatusCode.BadGateway || HttpStatusCode.NotFound) {
            this.errorMessage = error.error.message;
          }
          this.errorMessage = error.error.message;
        }
      );
  }

  nextPage() {
    if (this.pageNumber < this.totalPages - 1) {
      this.pageNumber++;
      this.fetchBadReviews();
    }
  }

  previousPage() {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.fetchBadReviews();
    }
  }

  logout(): void {
    this.cookies.deleteAll();
    console.log('Cookies is getting cleard', this.cookies.deleteAll());

    localStorage.clear();
    this.router.navigate(['/login']);
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
  updateProfile() {
    if (this.updateProfileForm.valid) {
      const token = this.cookies.get('token');
      const formValues = this.updateProfileForm.value;
      const updateProfileData: RegisterResponse = {
        contact: formValues.contact,
        owner_email: formValues.owner_email,
        business_name: formValues.businessName,
        business_link: formValues.businessLink,
      };

      this.loginService
        .updateProfile(this.username, updateProfileData, token)
        .subscribe(
          (response) => {
            if (HttpStatusCode.Ok) {
              this.cookies.delete('username');
              this.cookies.delete('business_name');
              this.cookies.delete('business_link');
              this.setSessionForm(response);
              this.router.navigate(['/qr'], {
                state: {
                  business_link: formValues.businessLink,
                  businessName: formValues.businessName,
                  username: formValues.contact,
                  email: formValues.owner_email,
                },
              });
            } else if (HttpStatusCode.ServiceUnavailable) {
              this.errorMessage = 'Service Unavailable';
            }
          },
          (error) => {
            this.errorMessage = error.error.errorMessage;
            this.updateProfileForm.reset();
          }
        );
    }

    this.toggleProfileSidebar();
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
    this.cookies.set('email', response.email, {
      expires: expirationDate,
      secure: true,
      sameSite: 'Strict',
    });
  }
}

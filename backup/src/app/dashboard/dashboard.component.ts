import { Component, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ReviewResponse } from '../review-response';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';
import { HttpStatusCode } from '@angular/common/http';
import { ShareServiceService } from '../share-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterResponse } from '../register-response';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
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
    private cookies: CookieService,
    private router: Router,
    private loginService: LoginService,
    private shareService: ShareServiceService,
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
      this.form.businessName = navigation?.extras.state['businessName'];
      this.username = navigation?.extras.state['username'];
    }
  }

  ngOnInit(): void {
    this.getAllBadReviews();
  }

  getAllBadReviews() {
    this.loginService.getAllBadReview(this.username).subscribe(
      (data) => {
        if (HttpStatusCode.Ok && this.cookies.get('isAuth')) {
          this.form.totalBadReviews = data.totalBadReviews;
          this.form.businessName = this.cookies.get('business_name');
        }
      },
      (error) => {
        if (HttpStatusCode.NotFound) {
          this.errorMessage = error.error.message;
          this.router.navigate(['/login']);
        }
      }
    );
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

  logout(): void {
    this.cookies.deleteAll();
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

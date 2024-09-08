import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AfterViewInit, Component, HostListener, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ShareServiceService } from '../../share-service.service';
import { Router } from '@angular/router';
import { LoginService } from '../../login.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bad-review',
  templateUrl: './bad-review.component.html',
  styleUrls: ['./bad-review.component.css'],
})
export class BadReviewComponent implements OnInit, AfterViewInit {
  username: string = '';
  businessName: string = '';
  reviews: any[] = [];
  pageNumber: number = 0;
  elementSize: number = 7;
  totalElements: number = 0;
  totalPages: number = 0;
  errorMessage: string = '';
  isDropdownOpen: any;
  isProfileSidebarVisible: boolean = false;
  updateProfileForm: FormGroup;
  uuid: string = '';
  searchParam: string = ''

  constructor(
    private router: Router,
    private loginService: LoginService,
    private sharedService: ShareServiceService,
    private fb: FormBuilder,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.updateProfileForm = this.fb.group({
      owner_email: ['', [Validators.required, Validators.email]],
      businessName: ['', Validators.required],
      businessLink: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
    this.uuid = loginService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    this.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('business_name');
    if (!this.businessName && !this.username) {
      this.router.navigate(['/register/login']);
      this.logout();
      this.sharedService.clear();
    }
  }
  ngOnInit(): void {
    this.fetchBadReviews();
  }
  ngAfterViewInit(): void {
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
    const token = this.sharedService.getItem('token');
    // console.log("token sending from bad revieew component ", token);

    this.ngxLodder.start();
    this.loginService
      .getAllBadReviewer(
        this.username,
        this.pageNumber,
        this.elementSize,
        token,
        this.searchParam
      )
      .subscribe(
        (response) => {
          if (HttpStatusCode.Ok) {
            this.ngxLodder.stop();
            this.reviews = response.reviews;
            console.log(response.reviews);
            this.elementSize = response.elementSize;
            this.pageNumber = response.pageNumber;
            this.totalElements = response.totalElements;
            this.totalPages = response.totalPages;
            console.log("Total element got in the response ", response.totalElements);
          }
        },
        (error: HttpErrorResponse) => {
          this.ngxLodder.stop();
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
    this.ngxLodder.start();
    this.sharedService.clear();
    localStorage.clear();
    this.ngxLodder.stop();
    this.router.navigate(['/register/login']);
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
    this.sharedService.setItem('email', response.email);

  }
}

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AfterViewInit, Component, OnChanges, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  totalpageNumber = 0;
  elementSizeInPage = 5;
  totalElements = 0;
  totalPages = 0;
  errorMessage = '';
  isDropdownOpen: boolean = false;
  username: any;
  totalClientCount: number = 0;
  message: string = '';
  totalBadReviews: number = 0;
  isUserdashbaord: boolean = false;
  pageNumber = 0;
  uuid: string = ''

  constructor(
    private adminService: AdminService,
    private sharedService: ShareServiceService,
    private router: Router,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.uuid = adminService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();
    this.username = navigation?.extras?.state?.['username'] || sharedService.getItem('username');
    if (!this.username) {
      this.router.navigate(['/register/login']);
      this.logout();
      this.sharedService.clear();
    }
  }

  ngOnInit(): void {

    this.fetchTotalClientCount();
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
  ngAfterViewInit(): void {

  }
  async fetchTotalClientCount(): Promise<void> {
    try {
      // Start the loader before making the API call
      this.ngxLodder.start();

      // Wait for the API call to finish and get the response
      const response = await firstValueFrom(this.adminService.getAllUserCount(this.username));

      // Process the response data
      this.totalClientCount = response.totalClient;
      this.totalBadReviews = response.totalBadReviewCount;
      this.message = response.message;

      console.log('Total bad reviews:', this.totalBadReviews);

    } catch (error: any) {
      // Stop the loader in case of error
      this.ngxLodder.stop();

      // Handle specific error cases if needed
      if (error.status === 404) {
        this.message = 'Client data not found.';
      } else if (error.status === 500) {
        this.message = 'Server error occurred. Please try again later.';
      } else {
        this.message = 'Failed to load total client count. Please check your connection or try again later.';
      }

      // Optionally log the error to the console for debugging
      console.error('Error fetching client count:', error);

    } finally {
      // Ensure the loader is stopped in any case (whether success or error)
      this.ngxLodder.stop();
    }
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
    this.ngxLodder.start()
    this.router.navigate(['/register/login'], {
      queryParams: { loggedOut: 'true' },
      replaceUrl: true
    });
    this.sharedService.clear()
    this.ngxLodder.stop()
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  userDashboard() {
    this.isUserdashbaord = !this.isUserdashbaord;
  }
}

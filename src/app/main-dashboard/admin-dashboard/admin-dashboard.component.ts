import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Component, OnChanges, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, OnChanges {
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
    if (navigation?.extras.state) {
      this.username = navigation.extras.state['username'];
    } else {
      this.username = sharedService.getItem('username');
    }
  }

  ngOnInit(): void {
    this.fetchTotalClientCount();
  }
  ngOnChanges(): void {
    this.fetchTotalClientCount();
  }

  fetchTotalClientCount(): void {
    this.ngxLodder.start();
    this.adminService.getAllUserCount(this.username).subscribe(
      (response) => {
        this.ngxLodder.stop();
        this.totalClientCount = response.totalClient;
        this.message = response.message;
        this.totalBadReviews = response.totalBadReviewCount
        console.log(response.totalBadReviewCount);
      },
      (error) => {
        // console.error('Error fetching total client count:', error);
        this.ngxLodder.stop();
        console.log(error);
        this.message = 'Failed to load total client count.';
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

  logout() {
    this.sharedService.clear();
    localStorage.clear();
    this.router.navigate(['/register/login']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  userDashboard() {
    this.isUserdashbaord = !this.isUserdashbaord;
  }
}

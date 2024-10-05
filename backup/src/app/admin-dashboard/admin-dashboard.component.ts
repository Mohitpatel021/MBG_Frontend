import { Component, OnChanges, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { AdminService } from '../admin.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private adminService: AdminService,
    private cookies: CookieService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.username = navigation.extras.state['username'];
    } else {
      this.username = cookies.get('username');
    }
  }

  ngOnInit(): void {
    this.fetchTotalClientCount();
  }
  ngOnChanges(): void {
    this.fetchTotalClientCount();
  }

  fetchTotalClientCount(): void {
    this.adminService.getAllUserCount(this.username).subscribe(
      (response) => {
        this.totalClientCount = response.totalClient;
        this.message = response.message;
      },
      (error) => {
        // console.error('Error fetching total client count:', error);
        console.log(error.error.message);
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
    this.cookies.deleteAll();
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  userDashboard() {
    this.isUserdashbaord = !this.isUserdashbaord;
  }
}

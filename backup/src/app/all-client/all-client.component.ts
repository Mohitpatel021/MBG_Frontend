import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-client',
  templateUrl: './all-client.component.html',
  styleUrl: './all-client.component.css',
})
export class AllClientComponent {
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
    this.fetchUsers();
  }
  ngOnChanges(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.adminService
      .getAllUsersForAdmin(this.pageNumber, this.elementSizeInPage)
      .subscribe({
        next: (response) => {
          this.users = response.allUser;
          this.totalpageNumber = response.totalPageNumber;
          this.elementSizeInPage = response.totalElementInPage;
          this.pageNumber = response.pageNumber;
          console.log(response);
          console.log(this.elementSizeInPage);
          console.log(this.pageNumber);
          console.log(this.totalElements);
        },
        error: (err) => {
          this.errorMessage = 'Error fetching users';
          console.error('Error fetching users:');
        },
      });
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages - 1) {
      this.pageNumber++;
      this.fetchUsers();
    }
  }

  previousPage(): void {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.fetchUsers();
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

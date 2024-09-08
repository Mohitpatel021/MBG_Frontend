import { HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-all-client',
  templateUrl: './all-client.component.html',
  styleUrls: ['./all-client.component.css'],
})
export class AllClientComponent implements OnInit {
  users: any[] = [];
  totalPages = 0;
  elementSizeInPage = 10;
  totalElements = 0;
  errorMessage = '';
  isDropdownOpen: boolean = false;
  username: any;
  totalClientCount: number = 0;
  message: string = '';
  totalBadReviews: number = 0;
  isUserdashbaord: boolean = false;
  pageNumber = 0;
  isButtonDisabled: boolean = true;
  uuid: string = '';
  isFirstPage: boolean = false
  isLastPage: boolean = true
  searchParam: string = ''

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
    this.fetchUsers();
    this.setupSideBar();
  }

  setupSideBar() {
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
    if (window.innerWidth > 1015) {
      sideBarToggle?.classList.add('hidden');
    }
    sideBarToggle?.addEventListener('click', () => {
      if (window.innerWidth <= 1015) {
        sideBar?.classList.toggle('open');
        content?.classList.toggle('blur');
      }
    });
    menuBar?.addEventListener('click', () => {
      if (window.innerWidth <= 1015) {
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
      if (window.innerWidth > 1015) {
        sideBar?.classList.remove('open');
        content?.classList.remove('blur');
      }
    });
  }

  fetchUsers(): void {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();
    console.log("search Parameter dekh lwde ", this.searchParam);

    this.adminService
      .getAllUsersForAdmin(
        this.pageNumber,
        this.elementSizeInPage,
        token,
        this.username,
        this.searchParam
      )
      .subscribe({
        next: (response) => {
          this.ngxLodder.stop();
          console.log('Response:', response);
          this.users = response.allUser;
          this.isFirstPage = response.isFirstPage;
          this.isLastPage = response.isLastPage;
          this.totalElements = response.totalElement;
          this.elementSizeInPage = response.totalElementInPage;
          this.totalPages = response.totalPageNumber;
          this.isButtonDisabled = response.isLastPage;
          // console.log('Total pages:', this.totalPages);
        },
        error: (err) => {
          this.ngxLodder.stop();
          this.errorMessage = 'Error fetching users';
          console.error('Error fetching users:', err);
        },
      });
  }

  nextPage(): void {
    if (!this.isLastPage) {
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

  downloadExcel(username: string): void {
    this.ngxLodder.start();
    const token = this.sharedService.getItem('token');
    this.adminService.downloadExcel(username, token).subscribe((response) => {
      const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clients.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.ngxLodder.stop();
    }, error => {
      this.ngxLodder.stop();
      console.error('Error downloading the file', error);
    });
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
  accountEnableOrDisable(username: string, adminUsername: string) {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();
    this.adminService.accountEnableAndDisableOperation(username, adminUsername, token).subscribe({
      next: (response) => {
        if (HttpStatusCode.Ok) {
          console.log(response);
          this.fetchUsers();
        }
      },
      error: (error) => {
        this.ngxLodder.stop()
        console.error('Error occurred while enabling/disabling account:', error);
        if (error.status === HttpStatusCode.Unauthorized) {

          console.error('Unauthorized access - maybe the token has expired.');
          this.errorMessage = 'Unauthorized access - please login again.';
          this.router.navigate(['/register/login']);  // Redirect to login if unauthorized
        } else if (error.status === HttpStatusCode.Forbidden) {

          console.error('Forbidden - you do not have permission to perform this action.');
          this.errorMessage = 'You do not have permission to perform this action.';
        } else if (error.status === HttpStatusCode.NotFound) {

          console.error('User not found.');
          this.errorMessage = 'The user you are trying to manage does not exist.';
        } else if (error.status === HttpStatusCode.InternalServerError) {

          console.error('Internal server error.');
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        } else {
          console.error('An unexpected error occurred.');
          this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      },
      complete: () => {
        this.ngxLodder.stop();
        console.log('Enable/Disable operation completed.');
      }
    });
  }


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  userDashboard() {
    this.isUserdashbaord = !this.isUserdashbaord;
  }
}
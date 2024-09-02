import { HttpStatusCode } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  // isEnable: boolean = true;

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
    this.fetchUsers();
  }

  fetchUsers(): void {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();
    // console.log("data that i'm sending ", this.pageNumber, this.elementSizeInPage, this.username);
    this.adminService
      .getAllUsersForAdmin(
        this.pageNumber,
        this.elementSizeInPage,
        token,
        this.username
      )
      .subscribe({
        next: (response) => {
          this.ngxLodder.stop();
          console.log('Response:', response);
          this.users = response.allUser;
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
    if (!this.isButtonDisabled) {
      this.pageNumber++;
      // console.log('Next page:', this.pageNumber);
      this.fetchUsers();
    }
  }

  previousPage(): void {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      // console.log('Previous page:', this.pageNumber);
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

  logout() {
    this.sharedService.clear();
    localStorage.clear();
    this.router.navigate(['/register/login']);
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
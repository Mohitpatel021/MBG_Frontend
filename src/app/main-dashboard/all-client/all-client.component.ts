import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { initModals } from 'flowbite';
import { ToastrService } from 'ngx-toastr';

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
  isModalOpen: boolean = false
  clientId: string = ''

  constructor(
    private adminService: AdminService,
    private sharedService: ShareServiceService,
    private router: Router,
    private ngxLodder: NgxUiLoaderService,
    private toastr: ToastrService,
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
 
  }


  fetchUsers(): void {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();
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
          this.users = response.allUser;
          this.isFirstPage = response.isFirstPage;
          this.isLastPage = response.isLastPage;
          this.totalElements = response.totalElement;
          this.elementSizeInPage = response.totalElementInPage;
          this.totalPages = response.totalPageNumber;
          this.isButtonDisabled = response.isLastPage;
        },
        error: (err) => {
          this.ngxLodder.stop();
          this.errorMessage = 'Error fetching users';
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
  deleteCliendId(id: string) {
    this.clientId = id;
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
          this.fetchUsers();
          console.log(response);
          const action = response.Enable ? 'enabled' : 'disabled';
          const message = `Account ${action} successfully!`;
          this.toastr.success(message);
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
      }
    });
  }

  deleteUser() {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();

    this.adminService.deleteAllTheUserInformation(this.username, token, this.clientId).subscribe({
      next: (response) => {
        if (HttpStatusCode.Ok) {
          this.fetchUsers();
          this.errorMessage = '';
          this.toastr.success("Client Deleted SuccesFully !!", "Deleted ")
        }
      },
      error: (error: HttpErrorResponse) => {

        this.ngxLodder.stop();
        this.toastr.error("Unable to Delete Client", "Error !!");
        console.error('Error occurred while deleting user:', error);
        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            console.error('Unauthorized access - maybe the token has expired.');
            this.errorMessage = 'Unauthorized access - please login again.';
            this.router.navigate(['/register/login']);
            break;
          case HttpStatusCode.Forbidden:
            console.error('Forbidden - you do not have permission to perform this action.');
            this.errorMessage = 'You do not have permission to perform this action.';
            break;
          case HttpStatusCode.NotFound:
            console.error('User or client not found.');
            this.errorMessage = 'The user or client you are trying to delete does not exist.';
            break;
          case HttpStatusCode.InternalServerError:
            console.error('Internal server error.');
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
            break;
          default:
            console.error('An unexpected error occurred.');
            this.errorMessage = 'An unexpected error occurred. Please try again later.';
        }
      },
      complete: () => {
        this.ngxLodder.stop();  // Ensure loader is stopped after completion
      }
    });
  }


  openModal() {
    this.isModalOpen = true;
    const modal = document.getElementById('authentication-modal');
    if (modal) {
      modal.classList.remove('hidden')

    }
  }

  // Function to close the modal
  closeModal() {
    this.isModalOpen = false;
    const modal = document.getElementById('authentication-modal');
    if (modal) {
      modal.classList.add('hidden');

    }
  }
}
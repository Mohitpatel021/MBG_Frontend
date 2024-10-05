import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AfterViewInit, Component, OnChanges, OnInit } from '@angular/core';
import { AdminService } from '../../admin.service';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

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
    this.fetchRecentThreeClient();
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
  fetchRecentThreeClient() {
    const token = this.sharedService.getItem('token');
    this.ngxLodder.start();  // Start the loader

    this.adminService.recentClientsForAdmin(this.username, token).pipe(
      catchError((error: HttpErrorResponse) => {
        this.ngxLodder.stop();  // Stop the loader on error
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client-side error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Server error: ${error.status}\nMessage: ${error.message}`;
        }

        // Display the error (you could also display a user-friendly message)
        console.error('HTTP Error: ', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    ).subscribe({
      next: (response) => {
        // Handle successful response
        if (response) {
          this.ngxLodder.stop();  // Stop the loader on success
          this.users = response;
        }
      },
      error: (error) => {

        this.ngxLodder.stop();  // Ensure loader is stopped
      }
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



}

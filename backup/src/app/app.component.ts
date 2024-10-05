import { Component, HostListener, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { ShareServiceService } from './share-service.service';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Review_Us_Dashbaord';
  private logoutTimer: any;
  constructor(
    private cookieService: CookieService,
    private sharedService: ShareServiceService,
    private router: Router,
    private loginService: LoginService
  ) {
    sessionStorage.removeItem('isReloading');
  }

  private jwtHelper = new JwtHelperService();
  ngOnInit() {}

  @HostListener("window:unload', ['$event']")
  private handleBeforeUnload(event: Event): any {
    this.cookieService.deleteAll();
    localStorage.clear();
  }

  private autoOut() {
    this.clearLogoutTimer();
    this.logoutTimer = setTimeout(() => {
      this.cookieService.deleteAll();
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }, 3 * 60 * 60 * 1000);
  }
  private clearLogoutTimer() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }
  // private autoLogin() {
  //   const token = this.cookieService.get('token');
  //   this.loginService.getTokenExpirationDate(token);
  //   const username = this.cookieService.get('username');
  //   const role = this.cookieService.get('role');
  //   const businessName = this.cookieService.get('business_name');
  //   const isAuth = this.cookieService.get('isAuth');
  //   console.log(token, username, role, businessName, isAuth);
  //   const expirationDate = this.cookieService.get('expirationDate');

  //   const presentDate = new Date().getDate();
  //   const presentTime = new Date().getTime();
  //   const presentDateTime = presentDate + presentTime;

  //   if (token && username && role && businessName && isAuth) {
  //     if (presentDateTime.toString() != expirationDate.toString()) {
  //       console.log(
  //         'printing the presend date and expirationdate ',
  //         presentDateTime,
  //         expirationDate
  //       );
  //       this.sharedService.setUsername(username);
  //       this.sharedService.setBusinessName(businessName);
  //       this.sharedService.setToken(token);
  //       this.sharedService.setIsAuth(isAuth === 'true');

  //       if (role === 'ADMIN') {
  //         this.router.navigate(['/admin'], {
  //           state: { username: username },
  //         });
  //       } else if (role === 'USER') {
  //         this.router.navigate(['/dashboard'], {
  //           state: {
  //             username: username,
  //             businessName: businessName,
  //           },
  //         });
  //       }
  //     }
  //   }
  // }
}

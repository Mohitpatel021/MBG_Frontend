import { Component, HostListener, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

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
    private router: Router,
  ) {
    sessionStorage.removeItem('isReloading');
  }
  ngOnInit() { }

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

}

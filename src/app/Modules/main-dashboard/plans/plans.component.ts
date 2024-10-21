import { Component } from '@angular/core';
import { ShareServiceService } from '../../../Services/share-service.service';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrl: './plans.component.css'
})
export class PlansComponent {
  username: string = '';
  uuid: string = '';
  businessId: string = '';
  businessName: any;
  constructor(private sharedService: ShareServiceService, private router: Router, private ngxLodder: NgxUiLoaderService,) { }

  initialisationProperty() {
    const navigation = this.router.getCurrentNavigation();
    this.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('business_name');
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    this.businessId = navigation?.extras?.state?.['businessId'] || this.sharedService.getItem('businessId');
    if (!this.businessName && !this.username) {
      this.router.navigate(['/register/login']);
      this.logout();
      this.sharedService.clear();
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
}

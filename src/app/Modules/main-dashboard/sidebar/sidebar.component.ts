import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ShareServiceService } from '../../../Services/share-service.service';
import { AdminService } from '../../../Services/admin.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'] // Fixed typo: "styleUrl" -> "styleUrls"
})
export class SidebarComponent implements OnInit {
  uuid: string = '';
  username: string = '';
  businessName: string = '';
  ownerEmail: string = '';
  role: string = '';
  isUserdashbaord: boolean = true;
  businessId: string = '';

  constructor(
    private sharedService: ShareServiceService,
    private router: Router,
    private adminService: AdminService,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.uuid = this.adminService.generateRandomUUID();
  }

  // Use ngOnInit lifecycle hook to initialize properties asynchronously
  async ngOnInit(): Promise<void> {
    this.ngxLodder.start();
    this.username = await this.sharedService.getItem('username');
    this.ownerEmail = await this.sharedService.getItem('email');
    this.businessName = await this.sharedService.getItem('business_name');
    this.role = await this.sharedService.getItem('role');
    this.businessId = await this.sharedService.getItem('businessId');
    this.ngxLodder.stop();
  }

  logout(): void {
    this.ngxLodder.start();
    this.router.navigate(['/register/login'], {
      queryParams: { loggedOut: 'true' },
      replaceUrl: true
    });
    this.sharedService.clear();
    this.ngxLodder.stop();
  }
}

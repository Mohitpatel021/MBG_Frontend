import { Component } from '@angular/core';
import { ShareServiceService } from '../../share-service.service';
import { Router } from '@angular/router';
import { AdminService } from '../../admin.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  uuid: string = ''
  username: string = ''
  businessName: string = ''
  ownerEmail: string = ''
  role: string = ''
  isUserdashbaord: boolean = true;
  constructor(private sharedService: ShareServiceService, private router: Router, private adminService: AdminService, private ngxLodder: NgxUiLoaderService) {
    this.uuid = adminService.generateRandomUUID();
    this.username = this.sharedService.getItem('username')
    this.ownerEmail = this.sharedService.getItem('email')
    this.businessName = this.sharedService.getItem('business_name')
    this.role = this.sharedService.getItem('role')
  }
  ngOnInit(): void {
    if (this.role.startsWith("ADMIN")) {
      this.isUserdashbaord = true;
    } else {
      this.isUserdashbaord = false;
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

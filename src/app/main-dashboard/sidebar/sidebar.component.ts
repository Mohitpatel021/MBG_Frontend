import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ShareServiceService } from '../../share-service.service';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  uuid: string = ''
  username: string = ''
  businessName: string = ''
  ownerEmail: string = ''
  role: string = ''
  isUserdashbaord: boolean = true;
  constructor(private sharedService: ShareServiceService, private router: Router, private adminService: AdminService) {
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
  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/register/login']);
  }
}


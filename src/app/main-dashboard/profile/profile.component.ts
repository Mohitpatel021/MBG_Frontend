import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../login.service';
import { ShareServiceService } from '../../share-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, AfterViewInit {
  detailsForm: FormGroup;
  username: string = '';
  uuid: string = '';
  businessId: string = '';
  businessName: string = '';
  constructor(
    private router: Router,
    loginService: LoginService,
    private sharedService: ShareServiceService,
    private fb: FormBuilder,
    private ngxLodder: NgxUiLoaderService
  ) {
    this.detailsForm = this.fb.group({
      owner_email: ['',],
      businessName: [''],
      businessLink: [''],
      contact: [''],
    });
    this.uuid = loginService.generateRandomUUID();
    const navigation = this.router.getCurrentNavigation();
    this.username = navigation?.extras?.state?.['username'] || this.sharedService.getItem('username');
    this.businessName = navigation?.extras?.state?.['businessName'] || this.sharedService.getItem('business_name');
    if (!this.businessName && !this.username) {
      this.router.navigate(['/register/login']);
      this.logout();
      this.sharedService.clear();
    }
  }
  ngOnInit(): void {
    this.populateUserDetails();
  }
  ngAfterViewInit(): void {
    initFlowbite();
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
  populateUserDetails() {

    this.detailsForm.setValue({
      businessName: this.sharedService.getItem('business_name'),
      owner_email: this.sharedService.getItem('email'),
      businessLink: this.sharedService.getItem('business_link'),
      contact: this.sharedService.getItem('username'),
    });
    this.detailsForm.disable();
  }
  navigateToForm() {
    window.location.href = 'https://forms.gle/K2UGTXiZLTGj8zK79';
  }
}

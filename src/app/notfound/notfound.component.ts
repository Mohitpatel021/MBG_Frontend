
import { Component } from '@angular/core';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css',
})
export class NotfoundComponent {
  uuid: string = '';

  constructor(private loginService: LoginService) {
    this.uuid = loginService.generateRandomUUID();
  }
}

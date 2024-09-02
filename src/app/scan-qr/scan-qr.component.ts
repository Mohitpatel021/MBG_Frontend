import { HttpStatusCode } from '@angular/common/http';
import { LoginService } from '../login.service';
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-scan-qr',
  templateUrl: './scan-qr.component.html',
  styleUrls: ['./scan-qr.component.css']
})
export class ScanQrComponent implements OnInit {

  constructor(private loginService: LoginService, private router: Router, private renderer: Renderer2, private ngxLoader: NgxUiLoaderService) { }

  @ViewChild('popupModal', { static: false }) popupModal!: ElementRef<HTMLDivElement>;
  data: string = '';
  errorMessage: string = '';
  redirectUrl: string = '';
  anyError: boolean = false;
  ngOnInit(): void {
    this.findQrDataUsingSerialId();
  }

  private findQrDataUsingSerialId(): void {
    const text = window.location.href;
    const serialId = this.loginService.trimUrl(text);
    this.getDataUsingSerialId(serialId);
  }

  private getDataUsingSerialId(serialId: string): void {
    console.log("method called for calling service method", serialId);
    this.ngxLoader.start();
    this.loginService.getQrDataUsingserialId(serialId).subscribe(
      (response) => {
        if (HttpStatusCode.Ok) {
          this.ngxLoader.stop();
          this.anyError = false;
          console.log('Response from getQrDataUsingserialId:', response);
          this.redirectUrl = response.textTobeEncoded;
          window.location.href = this.redirectUrl;
        }
      },
      (error) => {
        this.ngxLoader.stop();
        this.errorMessage = error.error.message;
        if (error.status === HttpStatusCode.NotFound) {
          console.log("QR data with this serial id is not found");
          this.anyError = true;
          this.openModal();
        } else if (error.status === HttpStatusCode.BadRequest) {
          console.log("Bad Request");
          this.anyError = true;
          this.openModal();
        } else if (error.status === HttpStatusCode.Unauthorized) {
          console.log("Unauthorized access");
          this.anyError = true;
          this.openModal();
        } else if (error.status === HttpStatusCode.Forbidden) {
          console.log("Forbidden access");
          this.anyError = true;
          this.openModal();
        } else if (error.status === HttpStatusCode.InternalServerError) {
          console.log("Internal Server Error");
          this.anyError = true;
          this.openModal();
        } else {
          console.log("An unexpected error occurred: ", error.error.message);
          this.anyError = true;
          this.openModal();
        }
      }
    );
  }

  private openModal(): void {
    this.renderer.removeClass(this.popupModal.nativeElement, 'hidden');
    this.renderer.addClass(this.popupModal.nativeElement, 'flex');
    this.renderer.addClass(document.body, 'modal-open');
    this.redirectToHome();
  }

  closeModal(): void {
    this.renderer.removeClass(this.popupModal.nativeElement, 'flex');
    this.renderer.addClass(this.popupModal.nativeElement, 'hidden');
    this.renderer.removeClass(document.body, 'modal-open');
  }

  private redirectToHome(): void {
    setTimeout(() => {
      this.closeModal();
      this.router.navigate(['/guest/home']);
    }, 10000)
  }
}

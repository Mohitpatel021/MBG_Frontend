import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { initFlowbite } from 'flowbite';

import { fabric } from 'fabric';
import { HttpStatusCode } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../../Services/login.service';
import { ShareServiceService } from '../../../Services/share-service.service';
import { QrCodeCreationDataRequest } from '../../../Modals/qr-code-creation-data-request';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {
  detailsForm: FormGroup;
  username: string = '';
  uuid: string = '';
  businessId: string = '';
  businessName: string = '';
  business_link: string = '';
  email: string = '';
  textToBeEncode: string = '';
  errorMessage: string = '';
  qrCodeImage: string = '';
  private canvas!: fabric.Canvas;

  template = { id: 1, imgSrc: 'assets/Template 1.png' }

  positions = [
    { x: 88, y: 260, boxWidth: 180, boxHeight: 180, textPlacedAt: 85 }
  ];

  @ViewChild('htmlCanvas', { static: false })
  htmlCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private sharedService: ShareServiceService,
    private fb: FormBuilder,
    private ngxLoader: NgxUiLoaderService,
    private toaster: ToastrService
  ) {
    this.detailsForm = this.fb.group({
      owner_email: [''],
      businessName: [''],
      businessLink: [''],
      contact: ['']
    });

    this.uuid = loginService.generateRandomUUID();

  }


  async initialiseProperty() {
    const navigation = this.router.getCurrentNavigation();
    this.username = navigation?.extras?.state?.['username'] || await this.sharedService.getItem('username');
    this.business_link = navigation?.extras?.state?.['business_link'] || await this.sharedService.getItem('business_link');
    this.businessName = navigation?.extras?.state?.['businessName'] || await this.sharedService.getItem('businessName');
    this.email = navigation?.extras?.state?.['email'] || await this.sharedService.getItem('email');
    this.businessId = navigation?.extras?.state?.['businessId'] || await this.sharedService.getItem('businessId');

    const encodedBusinessName = encodeURIComponent(this.businessName);
    const encodedBusinessLink = encodeURIComponent(this.business_link);
    const encodedId = encodeURIComponent(this.businessId);

    this.textToBeEncode = `https://app.reviewus.in/rate-us?business_name=${encodedBusinessName}&business_link=${encodedBusinessLink}&businessId=${encodedId}`;

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
    if (this.htmlCanvas) {
      this.initializeCanvas();
      if (this.businessName && this.business_link) {
        this.loadQrCode(() => { this.addQRCode(); });

      } else {
        this.errorMessage = 'No QR Generated Yet !!';
        this.toaster.error("Please try again later !!", "Error")
      }
    }
  }

  async populateUserDetails() {
    try {
      const businessName = await this.sharedService.getItem('business_name');
      const ownerEmail = await this.sharedService.getItem('email');
      const businessLink = await this.sharedService.getItem('business_link');
      const contact = await this.sharedService.getItem('username');

      this.detailsForm.setValue({
        businessName: businessName || '',
        owner_email: ownerEmail || '',
        businessLink: businessLink || '',
        contact: contact || ''
      });

      this.detailsForm.disable();
    } catch (error) {
      console.error('Error populating form details', error);
      this.toaster.error('Error loading profile details. Please try again.', 'Error');
    }
  }


  private async loadQrCode(callback: () => void): Promise<void> {
    const token = await this.sharedService.getItem('token');
    const data: QrCodeCreationDataRequest = {
      urlToBeEncoded: this.textToBeEncode,
      businessName: this.businessName,
      username: this.username,
      serialId: "MBGTEST",
      clientId: this.businessId
    };

    this.ngxLoader.start();

    try {
      const response = await this.loginService.getQrCode(data, await token).toPromise();
      if (response.successfull && response.image) {
        this.qrCodeImage = response.image;
        this.sharedService.setItem('image', response.image);
        callback();
      } else {
        this.handleError(response.message || 'Failed to generate QR code');
      }
    } catch (error) {
      this.handleError(error);
    } finally {
      this.ngxLoader.stop();
    }
  }

  private initializeCanvas(): void {
    fabric.Image.fromURL(
      this.template.imgSrc,
      (img) => {
        if (!img) return;

        const canvasWidth = this.htmlCanvas.nativeElement.clientWidth;
        const canvasHeight = this.htmlCanvas.nativeElement.clientHeight;
        this.htmlCanvas.nativeElement.width = canvasWidth;
        this.htmlCanvas.nativeElement.height = canvasHeight;

        this.canvas = new fabric.Canvas(this.htmlCanvas.nativeElement, {
          hoverCursor: 'pointer',
          selection: false,
          selectionBorderColor: 'blue',
          width: canvasWidth,
          height: canvasHeight,
          fill: 'white'
        });

        const scale = Math.min(canvasWidth / img.width!, canvasHeight / img.height!);

        img.set({
          scaleX: scale,
          scaleY: scale,
          left: this.canvas.width! / 2,
          top: this.canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          selectable: false
        });

        this.canvas.clear();
        this.canvas.add(img);
        this.canvas.centerObject(img);
        this.canvas.backgroundColor = 'white';

        this.addQRCode();
        this.addBusinessName();

        this.htmlCanvas.nativeElement.addEventListener(
          'touchstart',
          this.preventCanvasTouch,
          { passive: true }
        );
        this.htmlCanvas.nativeElement.addEventListener(
          'touchmove',
          this.preventCanvasTouch,
          { passive: true }
        );
      },
      { crossOrigin: 'anonymous' }
    );
  }

  private addQRCode(): void {
    const { x, y, boxWidth, boxHeight } = this.positions[this.template.id - 1];

    fabric.Image.fromURL(
      this.qrCodeImage,
      (qr) => {
        if (!qr) return;

        const qrScale = Math.min(boxWidth / qr.width!, boxHeight / qr.height!);

        qr.set({
          left: x + boxWidth / 2,
          top: y + boxHeight / 2,
          scaleX: qrScale,
          scaleY: qrScale,
          originX: 'center',
          originY: 'center',
          lockRotation: true,
          hasBorders: false,
          hasControls: false,
          selectable: false
        });

        this.canvas.add(qr);
        this.canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  private addBusinessName(): void {
    const template = this.positions[this.template.id - 1];
    if (!template) return;

    const maxWidth = this.canvas.width! - 80;
    let fontSize = 20;

    const textBox = new fabric.Textbox(this.businessName.toUpperCase(), {
      width: maxWidth,
      fontSize: fontSize,
      left: this.canvas.width! / 2,
      fontWeight: 'bold',
      originX: 'center',
      originY: 'top',
      fontFamily: 'sans-serif',
      fill: 'black',
      textAlign: 'center',
      selectable: false
    });

    this.canvas.add(textBox);

    while (textBox.getScaledHeight() > template.boxHeight && fontSize > 10) {
      fontSize -= 2;
      textBox.set({ fontSize });
      textBox.setCoords();
    }

    const textBoxHeight = textBox.getScaledHeight();
    textBox.set({
      top: template.textPlacedAt - textBoxHeight / 2
    });

    this.canvas.renderAll();
  }

  private preventCanvasTouch(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private handleError(error: unknown): void {
    if (typeof error === 'string') {
      this.errorMessage = error;
    } else if (error instanceof Error) {
      this.errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      this.errorMessage = (error as { message: string }).message;
    } else {
      this.errorMessage = 'An unexpected error occurred';
    }
    console.error(this.errorMessage);
  }

  public async downloadTemplate(): Promise<void> {
    this.ngxLoader.start();
    const token = this.sharedService.getItem('token');
    const link = document.createElement('a');
    link.download = this.businessName + '.png';
    link.href = this.canvas.toDataURL({ format: 'image/png', multiplier: 5 });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    const imageData = this.canvas.toDataURL({ format: 'image/png', multiplier: 4 });
    const response = await fetch(imageData);
    const blob = await response.blob();
    this.sendEmail(blob, await token);
  }

  private sendEmail(blob: Blob, token: string): void {
    this.ngxLoader.start();
    const formData = new FormData();
    formData.append('username', this.username);
    formData.append('to', this.email);
    formData.append('businessName', this.businessName);
    formData.append('file', blob, `${this.businessName}.png`);
    this.loginService.sendEmail(formData, token).subscribe((response) => {
      if (HttpStatusCode.Ok) {
        this.ngxLoader.stop();
        this.toaster.success('Email sent successfully', 'Email Send !!');
        return;
      }
    },
      (error) => {
        this.ngxLoader.stop();
        this.errorMessage = error.error.errorMessage;
        this.toaster.error("Please Try Again later !!", "Email Error")
      }
    )
  }

  navigateToForm() {
    window.location.href = 'https://forms.gle/K2UGTXiZLTGj8zK79';
  }

  logout(): void {
    this.ngxLoader.start();
    this.router.navigate(['/register/login'], {
      queryParams: { loggedOut: 'true' },
      replaceUrl: true
    });
    this.sharedService.clear();
    this.ngxLoader.stop();
  }
}

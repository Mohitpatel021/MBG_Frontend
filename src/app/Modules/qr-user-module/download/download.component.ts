
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { fabric } from 'fabric';
import { User } from '../login/login.component';

import { NgxUiLoaderService } from 'ngx-ui-loader';

import { HttpStatusCode } from '@angular/common/http';
import { ShareServiceService } from '../../../Services/share-service.service';
import { LoginService } from '../../../Services/login.service';



interface QrData {
  qrCodeImage: string;
  template: any;
  businessName: string;
  username: string;
  email: string;
}
@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css'],
})
export class DownloadComponent implements OnInit, AfterViewInit {
  qrCodeImage: any = '';
  template: any;
  private canvas!: fabric.Canvas;
  businessName: string = '';
  username: string = '';
  email: string = '';
  business_link: string = '';
  emailSendSucessfully: boolean = false;
  errorMessage: string = '';

  user: User = {
    username: '',
    password: '',
  };

  positions = [
    { x: 72, y: 255, boxWidth: 200, boxHeight: 200, textPlacedAt: 85 },
    { x: 70, y: 170, boxWidth: 200, boxHeight: 200, textPlacedAt: 104 },
    { x: 78, y: 319, boxWidth: 175, boxHeight: 175, textPlacedAt: 65 },
    // { x: 99, y: 228, boxWidth: 150, boxHeight: 150, textPlacedAt: 82 },
  ];

  @ViewChild('htmlCanvas', { static: false })
  htmlCanvas!: ElementRef<HTMLCanvasElement>;
  constructor(
    private router: Router,
    private sharedService: ShareServiceService,
    private loginService: LoginService,
    private ngxLoader: NgxUiLoaderService
  ) {
    this.initialiseProperty();
  }

  async initialiseProperty(): Promise<void> {
    const routerState = this.router.getCurrentNavigation()?.extras.state as QrData;
    this.template = routerState?.template;
    this.businessName = routerState?.businessName || await this.sharedService.getItem('business_name');
    this.username = routerState?.username || await this.sharedService.getItem('username');
    this.email = routerState?.email || await this.sharedService.getItem('email');
    this.qrCodeImage = routerState?.qrCodeImage || await this.sharedService.getItem('image');
  }


  ngOnInit(): void {
    if (!this.template || !this.qrCodeImage) {
      return;
    }
  }
  ngAfterViewInit(): void {
    if (this.htmlCanvas) {
      this.initializeCanvas();
    } else {
      return;
    }
  }

  private initializeCanvas(): void {
    fabric.Image.fromURL(
      this.template.imgSrc,
      (img) => {
        if (!img) {
          return;
        }
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
          fill: 'white',
        });

        const scale = Math.min(
          canvasWidth / img.width!,
          canvasHeight / img.height!
        );
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: this.canvas.width! / 2,
          top: this.canvas.height! / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
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
  private preventCanvasTouch(event: TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }
  private addQRCode(): void {
    const boxX = this.positions[this.template.id - 1].x;
    const boxY = this.positions[this.template.id - 1].y;
    const boxWidth = this.positions[this.template.id - 1].boxWidth;
    const boxHeight = this.positions[this.template.id - 1].boxHeight;

    fabric.Image.fromURL(
      this.qrCodeImage,
      (qr) => {
        if (!qr) {
          // console.log('not set');
          return;
        }
        const qrScale = Math.min(boxWidth / qr.width!, boxHeight / qr.height!);

        qr.set({
          left: boxX + boxWidth / 2,
          top: boxY + boxHeight / 2,
          scaleX: qrScale,
          scaleY: qrScale,
          originX: 'center',
          originY: 'center',
          lockRotation: true,
          hasBorders: false,
          hasControls: false,
          selectable: false,
        });
        this.canvas.add(qr);
        this.canvas.renderAll();
      },
      { crossOrigin: 'anonymous' }
    );
  }

  private addBusinessName(): void {
    const template = this.positions[this.template.id - 1];
    if (!template) {
      return;
    }

    const maxWidth = this.canvas.width! - 80; // Set the maximum width for the text box with some padding
    let fontSize = 20; // Start with a base font size

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
      selectable: false,
    });

    this.canvas.add(textBox);
    // Adjust font size if text overflows the maximum height
    while (textBox.getScaledHeight() > template.boxHeight && fontSize > 10) {
      fontSize -= 2;
      textBox.set({ fontSize });
      textBox.setCoords();
    }
    // Adjust the top position based on the height of the text box
    const textBoxHeight = textBox.getScaledHeight();
    textBox.set({
      top: template.textPlacedAt - textBoxHeight / 2, //for high resolution
    });

    this.canvas.renderAll();
  }

  public async downloadImage(): Promise<void> {
    this.ngxLoader.start();
    const token = this.sharedService.getItem('token');
    const link = document.createElement('a');
    link.download = this.businessName + '.png';
    link.href = this.canvas.toDataURL({ format: 'image/png', multiplier: 3 });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    const imageData = this.canvas.toDataURL({ format: 'image/png', multiplier: 3 });
    const response = await fetch(imageData);
    const blob = await response.blob();
    this.sendEmail(blob, await token);
    // this.ngxLoader.stop();
  }

  private sendEmail(Blob: Blob, token: string): void {
    this.ngxLoader.start();
    // console.log("Email method called");
    const username = this.username;
    const email = this.email;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('to', email);
    formData.append('businessName', this.businessName);
    formData.append('file', Blob, `${this.businessName}.png`);

    this.loginService.sendEmail(formData, token).subscribe(
      (response) => {
        // console.log("response from the email method ", response);
        if (HttpStatusCode.Ok) {
          this.emailSendSucessfully = true;
          this.ngxLoader.stop();
          return;
        }
      },
      (error) => {
        this.ngxLoader.stop();
        this.errorMessage = error.error.errorMessage;
        this.emailSendSucessfully = false;
      }
    );
  }

  changeEmailPopupVisibility() {
    this.emailSendSucessfully = false;
    // this.sharedService.clear();
    this.router.navigate(['/register/login']);
  }
}

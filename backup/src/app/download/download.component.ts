import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { fabric } from 'fabric';
import { CookieService } from 'ngx-cookie-service';
import { LoginService } from '../login.service';
import jsPDF from 'jspdf';
import { HttpStatusCode } from '@angular/common/http';

import { User } from '../login/login.component';

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
    { x: 75, y: 217, boxWidth: 190, boxHeight: 190, textPlacedAt: 20 },
    { x: 85, y: 285, boxWidth: 170, boxHeight: 170, textPlacedAt: 30 },
    { x: 74, y: 196, boxWidth: 190, boxHeight: 190, textPlacedAt: 70 },
    // { x: 99, y: 228, boxWidth: 150, boxHeight: 150, textPlacedAt: 82 },
  ];

  @ViewChild('htmlCanvas', { static: false })
  htmlCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private router: Router,
    private cookies: CookieService,
    private loginService: LoginService
  ) {
    const routerState = this.router.getCurrentNavigation()?.extras
      .state as QrData;
    if (routerState) {
      this.qrCodeImage = routerState.qrCodeImage;
      this.template = routerState.template;
      this.businessName = routerState.businessName;
      this.username = routerState.username;
      this.email = routerState.email;
    } else {
      this.username = this.cookies.get('username');
      this.businessName = this.cookies.get('business_name');
      this.business_link = this.cookies.get('business_link');
      this.email = this.cookies.get('email');
    }
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
          console.log('not set');
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

    const text = new fabric.Text(this.businessName.toUpperCase(), {
      fontSize: 30,
      left: this.canvas.width! / 2,
      top: template.textPlacedAt,
      fontWeight: 'bold',
      originX: 'center',
      originY: 'top',
      fontFamily: 'sans-serif',
      fill: 'black',
      selectable: false,
    });
    this.canvas.add(text);
    this.canvas.bringToFront(text);
  }

  public downloadImage(): void {
    const token = this.cookies.get('token');
    const link = document.createElement('a');
    link.download = this.businessName + '.jpg';
    link.href = this.canvas.toDataURL({ format: 'image/jpeg' });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.generatePdf(token);
  }
  private generatePdf(token: string): void {
    const canvasElement = this.htmlCanvas.nativeElement;
    this.canvas.setBackgroundColor('white', () => {
      const imageData = canvasElement.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF('portrait', 'px', [
        canvasElement.width,
        canvasElement.height,
      ]);
      pdf.addImage(
        imageData,
        'JPEG',
        100, // X coordinate
        100, // Y coordinate
        canvasElement.width / 2, // Image width
        canvasElement.height / 2 // Image height
      );
      // Send the PDF data as an email
      this.sendEmail(pdf.output('dataurlstring'), token);
    });
  }

  private sendEmail(pdfDataUrl: string, token: string): void {
    const username = this.username;
    const email = this.email;
    const byteString = atob(pdfDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('username', username);
    formData.append('to', email);
    formData.append('businessName', this.businessName);
    formData.append('file', blob, `${this.businessName}.pdf`);

    this.loginService.sendEmail(formData, token).subscribe(
      (response) => {
        if (HttpStatusCode.Ok) {
          this.emailSendSucessfully = true;
          return;
        }
      },
      (error) => {
        this.errorMessage = error.error.errorMessage;
        this.emailSendSucessfully = false;
      }
    );
  }

  changeEmailPopupVisibility() {
    this.emailSendSucessfully = false;
    this.cookies.deleteAll();
    this.router.navigate(['/login']);
  }
}

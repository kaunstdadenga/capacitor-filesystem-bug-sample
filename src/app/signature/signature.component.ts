import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  SimpleChanges,
} from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';
import { FileManagerService } from '../file-manager/file-manager.service';

/**
 * Component to be used to provide a canvas on which the user can sign
 * with his signature.
 */
@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss'],
})
export class SignatureComponent implements OnInit, OnChanges {
  // Inputs

  // Public Member
  // Canvas stuff
  @ViewChild('imageCanvas', { static: true }) public canvas: any;
  public canvasElement: any;

  // Private Member
  private saveX: number;
  private saveY: number;
  private drawColor = '#000000';
  private fileGroup = 'signatures';

  // Lifecycle
  constructor(
    private plt: Platform,
    private modalController: ModalController,
    private fileManager: FileManagerService
  ) {}

  ngOnInit() {
    // Set the Canvas Element
    console.log('ngOnInit');
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width();
    this.canvasElement.height = this.plt.height();

    this.plt.resize.subscribe(() => {
      this.changeCanvasOrientation();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnngOnChangesInit', changes);
  }

  // Public Functions
  public startDrawing(ev): void {
    var canvasPosition = this.canvasElement.getBoundingClientRect();
    this.saveX = ev.touches[0].pageX - canvasPosition.x;
    this.saveY = ev.touches[0].pageY - canvasPosition.y;
  }

  public moved(ev): void {
    var canvasPosition = this.canvasElement.getBoundingClientRect();

    let ctx = this.canvasElement.getContext('2d');
    let currentX = ev.touches[0].pageX - canvasPosition.x;
    let currentY = ev.touches[0].pageY - canvasPosition.y;

    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.drawColor;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();

    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }

  public cancel() {
    this.modalController.dismiss({
      canceled: true,
    });
  }

  public delete() {
    this.clearCanvas();
  }

  public async save() {
    var dataUrl = this.cropImageFromCanvas(this.canvasElement);

    this.clearCanvas();

    var data = dataUrl.split(',')[1];

    try {
      let filepath = await this.fileManager.saveFile(
        this.fileGroup,
        new Date().getTime() + '.png',
        data
      );

      this.modalController.dismiss({
        filepath: filepath,
      });
    } catch (e) {
      console.log(
        this.constructor.name,
        '- Could not save Signature:',
        e.message
      );
    }
  }

  // Private Functions

  private changeCanvasOrientation() {
    this.canvasElement = this.canvas.nativeElement;
    let width = this.canvasElement.width;
    let height = this.canvasElement.height;

    this.canvasElement.width = height;
    this.canvasElement.height = width;
  }

  private clearCanvas() {
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  private cropImageFromCanvas(canvas: any) {
    let ctx = this.canvasElement.getContext('2d');

    var w = canvas.width;
    var h = canvas.height;
    var pix = { x: [], y: [] };
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var x, y, index;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        index = (y * w + x) * 4;
        if (imageData.data[index + 3] > 0) {
          pix.x.push(x);
          pix.y.push(y);
        }
      }
    }
    pix.x.sort(function (a, b) {
      return a - b;
    });
    pix.y.sort(function (a, b) {
      return a - b;
    });
    var n = pix.x.length - 1;

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = ctx.getImageData(pix.x[0], pix.y[0], w + 1, h + 1);

    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);

    return canvas.toDataURL();
  }
}

import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FileManagerService } from '../file-manager/file-manager.service';
import { SignatureComponent } from '../signature/signature.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  imageData: any;

  private fileName: string;

  constructor(
    private modalController: ModalController,
    private fileManager: FileManagerService) {}

  async signatureRequested() {
    console.log(this.constructor.name, '- Requesting Signature');
    try {
      let filename = await this.requestSignature();
      if (filename) {
        let value = '#file:' + filename;
        this.fileName = value;

        this.loadImage(this.fileName);
      }
    } catch (e) {
      console.error(this.constructor.name, '-', e.message);
    }
  }

  private async requestSignature(): Promise<string> {
    const modal = await this.modalController.create({
      component: SignatureComponent,
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data['canceled']) {
      return undefined;
    } else {
      return data['filepath'];
    }
  }

  private async loadImage(filename: string) {
    try {
      let imageData = await this.fileManager.getFile(filename);
      this.imageData = imageData;
    } catch (error) {
      
      console.error(
        this.constructor.name,
        ':',
        error.message
      );
    }
  }

  private async deleteImage() {
    if (this.fileName) {
      if (this.fileName.startsWith('#file:')) {
        const filename = this.fileName.split(':')[1];
        this.fileManager.deleteFile(filename);
      }
      this.fileName = undefined;
      this.imageData = undefined;
    }
  }

}

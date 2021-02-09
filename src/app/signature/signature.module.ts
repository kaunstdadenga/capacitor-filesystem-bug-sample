import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignatureComponent } from './signature.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [SignatureComponent],
  entryComponents: [SignatureComponent],
  exports: [SignatureComponent]
})
export class SignatureModule {}

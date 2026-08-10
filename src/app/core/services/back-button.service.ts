import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BackButtonService {

  private backButtonSub?: Subscription;
  private alertOpen = false;

  constructor(
    private platform: Platform,
    private alertController: AlertController
  ) {}

  enable(): void {
    this.disable();

    this.backButtonSub = this.platform.backButton.subscribeWithPriority(
      9999,
      () => {
        this.handleBackButton();
      }
    );
  }

  disable(): void {
    this.backButtonSub?.unsubscribe();
    this.backButtonSub = undefined;
  }

  private handleBackButton(): void {
    if (this.alertOpen) {
      return;
    }

    this.showExitAlert();
  }

  private async showExitAlert(): Promise<void> {

    this.alertOpen = true;

    const alert = await this.alertController.create({
      header: 'Salir del juego',
      message: 'Si sales ahora, la partida actual se reiniciará.',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          handler: () => {
            App.exitApp();
          }
        }
      ]
    });

    alert.onDidDismiss().then(() => {
      this.alertOpen = false;
    });

    await alert.present();
  }

}

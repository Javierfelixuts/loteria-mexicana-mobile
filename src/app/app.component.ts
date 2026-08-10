import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {
  AlertController,
  IonApp,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private router: Router,
    private alertController: AlertController
  ) {}
}

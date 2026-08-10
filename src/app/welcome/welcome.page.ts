import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

import { NavController } from '@ionic/angular';



@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, CommonModule, FormsModule]
})
export class WelcomePage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goToGame() {
  this.navCtrl.navigateRoot('/home');
}

}

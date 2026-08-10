import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  AdMob,
  BannerAdOptions,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
} from '@capacitor-community/admob';

@Injectable({
  providedIn: 'root',
})
export class AdmobService {

  private initialized = false;
  private bannerVisible = false;
  private interstitialLoaded = false;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    await AdMob.initialize();

    await AdMob.addListener(
      InterstitialAdPluginEvents.Loaded,
      () => {
        this.interstitialLoaded = true;
        console.log('Interstitial cargado');
      }
    );

    await AdMob.addListener(
      InterstitialAdPluginEvents.FailedToLoad,
      (error) => {
        this.interstitialLoaded = false;
        console.log('Error cargando interstitial', error);
      }
    );

    await AdMob.addListener(
      InterstitialAdPluginEvents.Dismissed,
      async () => {
        console.log('Interstitial cerrado');

        this.interstitialLoaded = false;

        await this.loadInterstitial();
      }
    );

    this.initialized = true;

    await this.loadInterstitial();
  }

  /* ===========================
          BANNER
     =========================== */

  async showBanner(): Promise<void> {
    if (this.bannerVisible) {
      return;
    }

    const options: BannerAdOptions = {
      adId: 'ca-app-pub-7548147095773188/1911655493',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.TOP_CENTER,
      margin: 0,
      isTesting: false,
    };

    await AdMob.showBanner(options);

    this.bannerVisible = true;
  }

  async hideBanner(): Promise<void> {
    if (!this.bannerVisible) {
      return;
    }

    await AdMob.hideBanner();

    this.bannerVisible = false;
  }

  /* ===========================
        INTERSTITIAL
     =========================== */

  async loadInterstitial(): Promise<void> {
    if (this.interstitialLoaded) {
      return;
    }

    console.log('Preparando interstitial');

    await AdMob.prepareInterstitial({
      adId: 'ca-app-pub-7548147095773188/5684093550',
      isTesting: false,
    });
  }

  async showInterstitial(): Promise<void> {
    if (!this.interstitialLoaded) {
      console.log('Interstitial no listo, esperando carga...');

      await this.loadInterstitial();

      let attempts = 0;

      while (!this.interstitialLoaded && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }

    if (this.interstitialLoaded) {
      console.log('Mostrando interstitial');

      await AdMob.showInterstitial();
    } else {
      console.log('Interstitial no disponible');
    }
  }
}

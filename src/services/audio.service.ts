import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private currentSrc: string | null = null;
  isPlaying$ = new BehaviorSubject(false);
  initAudioEnded$ = new BehaviorSubject(false);
  volume$ = new BehaviorSubject(1);
  private isStarting = false;

  init(src: string) {
    if (!this.audio) {
      this.audio = new Audio(src);
      this.audio.preload = 'auto';

      this.audio.onended = () => {
        //this.isPlaying$.next(false);
        this.initAudioEnded$.next(true);
        this.audio = null;
      };

      this.audio.volume = this.volume$.value;
    }
  }
  isCurrent(src: string) {
    return this.currentSrc === src;
  }
  play(src: string) {
    this.init(src);
    if (this.audio)
      try {
        this.audio.play();
      } catch (e) {
        console.log(e);
      } finally {
        this.isStarting = false;
      }
    return this.audio;
  }

  pause() {
    if (!this.audio) return;
    this.audio?.pause();
  }

  resume() {
    if (!this.audio) return;

    // si ya terminó no reanudar
    if (this.audio.ended) return;

    this.audio.play().catch(() => {});
  }

  stop() {
    if (!this.audio) return;

    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying$.next(false);
  }

  setVolume(val: number) {
    console.log('val volume:', val);
    if (this.audio) this.audio.volume = val;
    this.volume$.next(val);
  }

  setRate(val: number) {
    if (this.audio) this.audio.playbackRate = val;
  }

  resetAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying$.next(false);
    }
  }

  waitForEnd(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio) return resolve();
      this.audio.onended = () => resolve();
      this.audio = null;
    });
  }

  removeListeners() {
    if (this.audio) {
      this.audio.removeEventListener('ended', () => {});
      this.audio = null;
    }
  }

}

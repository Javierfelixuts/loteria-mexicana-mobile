import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TTimeBetweenCards } from 'src/models/timeBetweenCards.model';
import { TVelocityReadCard } from 'src/models/velocityReadCard.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  isPlaying$ = new BehaviorSubject(false);
  endGame$ = new BehaviorSubject(false);

  private volumeSubject = new BehaviorSubject<number>(1);
  volume$ = this.volumeSubject.asObservable();


  private velocityBetweenCardsSubject = new BehaviorSubject<TTimeBetweenCards>(1);
  velocityBetweenCards$ = this.velocityBetweenCardsSubject.asObservable();


  private velocityReadCardSubject = new BehaviorSubject<TVelocityReadCard>(1);
  velocityReadCard$ = this.velocityReadCardSubject.asObservable();

  togglePlay() {
    this.isPlayingSubject.next(!this.isPlayingSubject.value);
  }

  setVolume(value: number) {
    this.volumeSubject.next(value);
  }

  getVolume(): number {
    return this.volumeSubject.value;
  }

  setVelocityBetweenCards(value: TTimeBetweenCards) {
    this.velocityBetweenCardsSubject.next(value);
  }
  getVelocityBetweenCards(): number {
    return this.velocityBetweenCardsSubject.value;
  }


  setVelocityReadCard(value: TVelocityReadCard) {
    this.velocityReadCardSubject.next(value);
  }
  getVelocityReadCard(): number {
    return this.velocityReadCardSubject.value;
  }


  changeIsPlaying(value: boolean){
    this.isPlayingSubject.next(value);
    this.isPlaying$.next(value);
  }

  getIsPlaying(){
    return this.isPlayingSubject.value;
  }

  setEndGame(value: boolean){
    this.endGame$.next(value);
  }




}

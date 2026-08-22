import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // Cartas sacadas en la partida actual
  private cardsDrawn = 0;
  // Partidas que llegaron a 30 cartas o más
  private validGames = 0;
  // Evento para avisar al componente que muestre anuncio
  private showInterstitialSubject = new Subject<void>();
  showInterstitial$ = this.showInterstitialSubject.asObservable();
  constructor() {}

  /**
   * Llamar cada vez que sale una carta
   */
  addCardDrawn(): void {
    this.cardsDrawn++;
    console.log(
      'Cartas sacadas:',
      this.cardsDrawn
    );

  }

  /**
   * Llamar cuando el usuario reinicia
   * o termina una partida
   */
  finishGame(): void {

  console.log('FIN DE PARTIDA');
  console.log('Cartas:', this.cardsDrawn);

  if (this.cardsDrawn >= 20) {

    this.validGames++;

    console.log(
      'Partidas válidas:',
      this.validGames
    );

    if (this.validGames >= 3) {

      console.log('LANZAR ANUNCIO');

      this.showInterstitialSubject.next();

      this.validGames = 0;
    }
  }

  this.cardsDrawn = 0;
}

  /**
   * Por si quieres ver el contador
   */
  getValidGames(): number {

    return this.validGames;

  }

  /**
   * Por si quieres reiniciar manualmente
   */
  resetGameStats(): void {
    this.cardsDrawn = 0;
    this.validGames = 0;
  }


}

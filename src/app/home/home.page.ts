import {
  IonAlert,
  IonContent,
  IonFabButton,
  IonFooter,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import {
  Component,
  ElementRef,
  NgZone,
  QueryList,
  ViewChild,
  ViewChildren,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeepAwake } from '@capacitor-community/keep-awake';
import cardsStorage from '../../data/cards';
import { ICard } from '../../models/card.model';
import gsap from 'gsap';
import { addIcons } from 'ionicons';
import {
  repeatOutline,
  reloadOutline,
  shuffleOutline,
  volumeMuteOutline,
  volumeHighOutline,
  play,
  pause,
} from 'ionicons/icons';
import Flip from 'gsap/Flip';
import { BackButtonService } from '../core/services/back-button.service';
import { AdmobService } from '../core/services/admob.service';
import { GameService } from '../core/services/game.service';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    CommonModule,
    IonAlert,
    IonFabButton,
    IonFooter,
    IonIcon,
    IonContent,
  ],
})
export class HomePage {
  @ViewChildren('cardRefs', { read: ElementRef })
  cardRefs!: QueryList<ElementRef>;
  @ViewChild('placedContainer', { static: true })
  placedContainer!: ElementRef<HTMLElement>;
  @ViewChild('playPauseRef', { static: true })
  playPauseRef!: ElementRef<HTMLElement>;

  deck: ICard[] = cardsStorage;
  allCards: ICard[] = cardsStorage;
  initVoice: HTMLAudioElement | null = new Audio('assets/audio/init_voice.wav');
  private pauseAudio = new Audio('assets/audio/pause.mp3');
  refInitVoice = this.initVoice;
  private audioShuffle: HTMLAudioElement | null = new Audio(
    'assets/audio/audio-barajeo.mp3'
  );
  placedOrder: number[] = []; // ids en el orden que fueron colocadas
  isIntro = true;
  hasStarted = signal(false);
  isPlaying = signal(false);
  isShuffling = signal(false);
  isAnimating = false;
  placedTop = 0; // top final
  centerX = 0;
  currentCardId = 0;
  hasInteracted = false;
  currentTimeline: gsap.core.Timeline | null = null;
  currentAudio: HTMLAudioElement | null = null;
  currentCard: ICard | null = null;
  //configurable
  volumeSize = 1;
  totalCards = this.allCards.length;
  amount = 9;

  public alertButtons = [
    {
      text: 'CANCELAR',
      role: 'cancel',
      handler: () => {
        if (this.isPlaying()) {
          this.resumeAnim();
        }
      },
    },
    {
      text: 'SI',
      role: 'confirm',
      handler: () => {
        this.zone.run(() => {
          this.reloadGame();
        });
      },
    },
  ];

  constructor(
    private zone: NgZone,
    private backButtonService: BackButtonService,
    private admobService: AdmobService,
    private gameService: GameService
  ) {
    addIcons({
      repeatOutline,
      volumeMuteOutline,
      volumeHighOutline,
      reloadOutline,
      shuffleOutline,
      play,
      pause,
    });
    // Check initial orientation
  }

  async ionViewDidEnter(): Promise<void> {
    this.backButtonService.enable();
    await this.admobService.initialize();
    await this.admobService.showBanner();
    await  KeepAwake.keepAwake();
  }

  async ionViewWillLeave(): Promise<void> {
    this.backButtonService.disable();
    await this.admobService.hideBanner();
    await KeepAwake.allowSleep();
  }
  ngOnInit() {
    this.currentTimeline = null;
    this.currentAudio = null;
    this.allCards = this.shuffleCard(cardsStorage);
    this.deck = this.allCards.slice(
      this.totalCards - this.amount,
      this.totalCards
    );

    gsap.registerPlugin(Flip);

    this.gameService.showInterstitial$.subscribe(async () => {
      await this.admobService.showInterstitial();
    });

    const width = window.innerWidth;
    const height = window.innerHeight;

    console.log(width, height);
  }

  ngOndestroy() {
    this.currentTimeline?.kill();
    this.currentTimeline = null;
    this.currentAudio = null;
  }
  async shuffleDeck() {
    if (this.audioShuffle) {
      this.audioShuffle.currentTime = 0;

      this.audioShuffle.play();
    }
    // Evitar doble click
    if (this.isShuffling()) return;

    this.isShuffling.set(true);

    const cards = this.getTopTenCardElements();

    if (!cards.length) {
      this.isShuffling.set(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        this.isShuffling.set(false);
      },
    });

    // Primera carta visible primero
    tl.to(cards[0], {
      y: 80,

      x: -40,

      rotation: -25,

      scale: 0.65,

      duration: 0.18,

      ease: 'power2.out',

      zIndex: 3000,
    });

    // Levantar las demás
    tl.to(
      cards.slice(1),
      {
        y: 70,

        scale: 0.65,

        duration: 0.16,

        stagger: 0.02,

        ease: 'power2.out',
      },
      '-=.08'
    );

    // Separación inicial
    cards.forEach((card, index) => {
      const left = index % 2 === 0;

      tl.to(
        card,
        {
          x: left ? -100 : 100,

          y: 120 + index * 5,

          rotation: left ? -35 : 35,

          duration: 0.18,

          ease: 'power3.out',

          zIndex: index,
        },
        '-=.12'
      );
    });

    // Cruce entre cartas
    cards.forEach((card, index) => {
      tl.to(
        card,
        {
          x: index % 2 === 0 ? 120 : -120,

          y: -40 + index * 15,

          rotation: index % 2 === 0 ? 45 : -45,

          scale: 0.55,

          zIndex: 3000 + index,

          duration: 0.25,

          ease: 'power2.inOut',
        },
        '-=.18'
      );
    });

    // Caída final
    cards.forEach((card) => {
      tl.to(
        card,
        {
          x: gsap.utils.random(-20, 20),

          y: gsap.utils.random(0, 10),

          rotation: gsap.utils.random(-5, 5),

          duration: 0.12,

          ease: 'power2.out',
        },
        '-=.08'
      );
    });

    // Regresar al mazo
    tl.to(cards, {
      x: 0,

      y: 0,

      rotation: 0,

      scale: 1,

      duration: 0.35,

      ease: 'back.out(1.5)',

      stagger: 0.02,
    });

    // Limpiar estilos
    tl.add(() => {
      cards.forEach((card) => {
        gsap.set(card, {
          clearProps: 'x,y,rotation,scale,zIndex',
        });
      });
    });
  }
  getTopTenCardsForShuffle() {
    return this.deck.filter((c) => !c.placed).slice(-10);
  }
  getTopTenCardElements() {
    const cards = this.getTopTenCardsForShuffle();

    return cards
      .map((card) => this.getCardElement(card.id))
      .filter((el) => el !== null);
  }
  getTenByTenCards() {
    if (this.deck.length == this.allCards.length) return;

    if (this.currentCardId == this.amount - 2) {
      this.amount += 9;
      if (this.amount >= this.totalCards) this.amount = this.totalCards;
      this.deck = this.allCards.slice(
        this.allCards.length - this.amount,
        this.totalCards
      );
    }
  }
  shuffleCard(cards: ICard[]) {
    return cards.sort(() => Math.random() - 0.5);
  }

  getCardElement(id: number) {
    const ref = this.cardRefs?.find((r) => r.nativeElement.id === `card-${id}`);
    return ref ? (ref.nativeElement as HTMLElement) : null;
  }

  getPlacedIndex(id: number) {
    return this.placedOrder.indexOf(id);
  }

  pauseAnim() {
    this.runPauseSound();
    this.isPlaying.set(false);

    this.currentTimeline?.pause();
    this.currentAudio?.pause();
    this.initVoice?.pause();

    if (this.refInitVoice) {
      this.refInitVoice?.pause();
    }
  }

  resumeAnim() {
    this.isPlaying.set(true);

    this.currentAudio?.play();
    this.initVoice?.play();
    if (this.refInitVoice) {
      if (this.isIntro) {
        this.refInitVoice?.play();
      }
    }

    if (!this.isIntro) {
      this.currentTimeline?.resume();
    }
  }

  reloadGame() {
    this.gameService.finishGame();
    this.currentTimeline?.kill();
    this.currentTimeline = null;
    this.deck = [];
    this.placedOrder = [];
    this.amount = 9;
    this.isIntro = true;
    this.hasStarted = signal(false);
    this.initVoice = new Audio('assets/audio/init_voice.wav');
    this.refInitVoice = this.initVoice;
    setTimeout(() => {
      this.allCards = this.shuffleCard(cardsStorage);
      this.allCards.map((card) => (card.placed = false));
      this.deck = this.allCards.slice(
        this.totalCards - this.amount,
        this.totalCards
      );
    }, 50);

    this.currentCardId = 0;
    if (this.placedContainer) {
      this.placedContainer.nativeElement.innerHTML = '';
    }
    gsap.set(this.cardRefs, { clearProps: true });
    this.isAnimating = false;
    this.isPlaying.set(false);
    this.currentAudio = null;
    if (this.currentCard) {
      const el = this.getCardElement(this.currentCard.id);
      const inner = el?.querySelector('.card-inner') as HTMLElement;
      if (inner) {
        inner.style.transform = 'rotateY(0deg)';
      }
    }
  }
  playIntro(): Promise<void> {
    console.log('playIntro', this.initVoice);
    return new Promise((resolve) => {
      if (this.isIntro) {
        if (this.initVoice) {
          this.initVoice.currentTime = 0;
          this.initVoice.volume = this.volumeSize;
          this.initVoice.onended = () => {
            this.isIntro = false;
            resolve();
          };
          this.initVoice.play();
          this.initVoice = null;
        }
      }
    });
  }
  async playGame() {
    this.hasStarted.set(true);
    this.isPlaying.set(true);
    this.getTenByTenCards();
    if (this.isAnimating) return;

    const cards = this.deck;
    if (!cards.length) return;

    const card = cards[cards.length - 1 - this.currentCardId]; // carta "top"
    this.currentCard = card;
    this.currentCardId++;

    if (this.currentCardId > this.totalCards) {
      this.currentCardId = this.totalCards;
      return;
    }
    const el = this.getCardElement(card.id);
    if (!el) {
      console.warn('No se encontró la carta en DOM', card.id);
      return;
    }

    const inner = el.querySelector('.card-inner') as HTMLElement;
    this.isAnimating = true;

    const div = el.getBoundingClientRect();
    const finalLeft =
      ((this.placedContainer.nativeElement.clientWidth - 10) / 2 -
        div.width / 4) *
      -1; // 587 es el left del contenedor de cartas colocadas

    this.currentTimeline?.kill();
    // Timeline pausable
    this.currentTimeline = gsap.timeline({
      paused: false,
      onComplete: () => {
        this.isAnimating = false;

        if (this.currentCardId < this.totalCards) {
          this.playGame();
        }
      },
    });

    if (this.isIntro) {
      this.currentTimeline.add(async () => {
        this.currentTimeline?.pause();
        await this.playIntro();

        this.currentTimeline?.resume();
      });
    }
    // 1. FLIP
    this.currentAudio = null;
    this.currentTimeline.to(inner, {
      rotateY: 180,
      duration: 1,
      ease: 'power2.inOut',
      onComplete: async () => {
        this.currentAudio = await this.playAudio(card.voice);
        if (this.currentAudio) this.currentAudio.play();
        this.currentAudio.volume = this.volumeSize;

        this.gameService.addCardDrawn();
      },
    });

    // 2. WAIT
    this.currentTimeline.to({}, { duration: 0.5 });

    // 3. ÚLTIMA CARTA → no mover
    if (this.currentCardId === this.totalCards) {
      this.currentTimeline.add(() => {
        el.classList.add('last-card');
      });
      return;
    }

    //
    // PRIMERO mover todas las cartas anteriores

    this.currentTimeline.to(this.placedContainer.nativeElement.children, {
      x: `+=${div.width / 2.5}`,
      duration: 0.4,
      ease: 'circ.inOut',
    });

    // 👉 DESPUÉS mover la nueva carta (sin empalme)
    /* this.currentTimeline.to(el, {
      x: `+=${-50}`,
      scale: 0.7,
      duration: 0.2,
    }) */
    this.currentTimeline.to(el, {
      x: `+=${finalLeft}`,
      y: '+=260',
      scale: 0.4,
      transformPerspective: 500,
      duration: 0.5,
      ease: 'power1.out',
      onComplete: () => {
        const state = Flip.getState(el);

        // 2. Cambia el DOM
        card.placed = true;
        gsap.set(el, {
          y: 220,
        });

        this.placedContainer.nativeElement.append(el);
        Flip.from(state, {
          duration: 0.4,
          ease: 'power2.out',
          absolute: true,
        });
      },
    });
  }

  runPauseSound() {
    this.pauseAudio.play();
  }

  handleVolume(size: number) {
    console.log('handleVolume', size);
    this.volumeSize = size ? 0 : 1;
    if (this.currentAudio) {
      this.currentAudio.volume = this.volumeSize;
    }
    if (this.refInitVoice) {
      this.refInitVoice.volume = this.volumeSize;
    }
    if (this.audioShuffle) {
      this.audioShuffle.volume = this.volumeSize;
    }
  }

  togglePlayPause(): void {
    if (!this.isShuffling() && !this.hasStarted()) {
      this.playGame();
      return;
    }
    console.log('togglePlayPause', this.isPlaying(), this.hasStarted());
    if (!this.hasStarted()) {
      return;
    }

    if (this.isPlaying()) {
      this.pauseAnim();
    } else {
      this.resumeAnim();
    }
  }

  async playAudio(audioPath: string): Promise<HTMLAudioElement> {
    const audio = new Audio(audioPath);
    return audio;
  }
}

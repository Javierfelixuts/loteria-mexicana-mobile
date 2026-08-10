export interface ICard {
    id: number;
    name: string;
    description: string;
    color: string;
    voice: string;
    src_small: string;
    src_optimized: string;
    isMovingDown?: string;
    isActive?: boolean;
    placed?: boolean;
    voiceEnded: boolean;
}

/* { id: 1, 
    src_small: new URL("assets/cartas/small/1 el gallo.jpg", import.meta.url).href, 
    src_hight: new URL("assets/cartas/1 el gallo.jpg", import.meta.url).href, 
    
    name: "1 el gallo.jpg", description: "el gallo", color: '', 
    voice: new URL("assets/audio/el gallo.wav", import.meta.url).href
  } */
export type Evolution = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export type PetStatus = 'normal' | 'hungry' | 'sleepy' | 'unhappy';

export interface TamagotchiState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  health: number;
  age: number;
  isAlive: boolean;
  lastFed: Date;
  lastPlayed: Date;
  lastSlept: Date;
  evolution: Evolution;
  experience: number;
}

export type TamagotchiAction = 
  | { type: 'FEED' }
  | { type: 'PLAY' }
  | { type: 'SLEEP' }
  | { type: 'UPDATE_STATUS' }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'GAIN_EXPERIENCE'; payload: number }; 
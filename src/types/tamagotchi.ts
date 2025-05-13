export type Evolution = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export type PetStatus = 'normal' | 'hungry' | 'sleepy' | 'unhappy';

export type GameType = 'rockPaperScissors' | 'memoryMatch' | 'quickReflex';

export interface GameResult {
  success: boolean;
  experienceGained: number;
  statBoosts: {
    hunger?: number;
    happiness?: number;
    energy?: number;
    health?: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isUnlocked: boolean;
  reward: number; // experience points
}

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
  achievements: Achievement[];
  gamesPlayed: number;
  highScores: Record<GameType, number>;
  specialAbilities: string[];
}

export type TamagotchiAction = 
  | { type: 'FEED' }
  | { type: 'PLAY' }
  | { type: 'SLEEP' }
  | { type: 'UPDATE_STATUS' }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'GAIN_EXPERIENCE'; payload: number }
  | { type: 'COMPLETE_GAME'; payload: GameResult }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }; 
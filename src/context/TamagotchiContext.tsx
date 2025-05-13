'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TamagotchiState, TamagotchiAction, Evolution, GameType } from '@/types/tamagotchi';

const INITIAL_ACHIEVEMENTS = [
  {
    id: 'first_evolution',
    name: 'First Evolution',
    description: 'Evolve your pet for the first time',
    isUnlocked: false,
    reward: 100,
  },
  {
    id: 'game_master',
    name: 'Game Master',
    description: 'Win 10 mini-games',
    isUnlocked: false,
    reward: 200,
  },
  {
    id: 'healthy_pet',
    name: 'Healthy Pet',
    description: 'Keep all stats above 80 for 5 minutes',
    isUnlocked: false,
    reward: 150,
  },
];

const initialState: TamagotchiState = {
  name: 'Tama',
  hunger: 100,
  happiness: 100,
  energy: 100,
  health: 100,
  age: 0,
  isAlive: true,
  lastFed: new Date(),
  lastPlayed: new Date(),
  lastSlept: new Date(),
  evolution: 'egg',
  experience: 0,
  achievements: INITIAL_ACHIEVEMENTS,
  gamesPlayed: 0,
  highScores: {
    rockPaperScissors: 0,
    memoryMatch: 0,
    quickReflex: 0,
  },
  specialAbilities: [],
};

const TamagotchiContext = createContext<{
  state: TamagotchiState;
  dispatch: React.Dispatch<TamagotchiAction>;
} | null>(null);

const getEvolutionStage = (exp: number): Evolution => {
  if (exp < 100) return 'egg';
  if (exp < 300) return 'baby';
  if (exp < 600) return 'child';
  if (exp < 1000) return 'teen';
  return 'adult';
};

function tamagotchiReducer(state: TamagotchiState, action: TamagotchiAction): TamagotchiState {
  switch (action.type) {
    case 'FEED':
      const feedExp = 10;
      const newFeedExp = state.experience + feedExp;
      const newEvolution = getEvolutionStage(newFeedExp);
      
      // Check for first evolution achievement
      let updatedAchievements = state.achievements;
      if (newEvolution !== state.evolution && !state.achievements.find(a => a.id === 'first_evolution')?.isUnlocked) {
        updatedAchievements = state.achievements.map(a => 
          a.id === 'first_evolution' ? { ...a, isUnlocked: true } : a
        );
      }

      return {
        ...state,
        hunger: Math.min(100, state.hunger + 30),
        energy: Math.min(100, state.energy + 10),
        lastFed: new Date(),
        experience: newFeedExp,
        evolution: newEvolution,
        achievements: updatedAchievements,
      };

    case 'COMPLETE_GAME':
      const { success, experienceGained, statBoosts } = action.payload;
      const newGameExp = state.experience + experienceGained;
      const newGamesPlayed = state.gamesPlayed + 1;

      // Check for game master achievement
      let gameAchievements = state.achievements;
      if (newGamesPlayed >= 10 && !state.achievements.find(a => a.id === 'game_master')?.isUnlocked) {
        gameAchievements = state.achievements.map(a =>
          a.id === 'game_master' ? { ...a, isUnlocked: true } : a
        );
      }

      return {
        ...state,
        experience: newGameExp,
        evolution: getEvolutionStage(newGameExp),
        gamesPlayed: newGamesPlayed,
        achievements: gameAchievements,
        hunger: Math.min(100, state.hunger + (statBoosts.hunger || 0)),
        happiness: Math.min(100, state.happiness + (statBoosts.happiness || 0)),
        energy: Math.min(100, state.energy + (statBoosts.energy || 0)),
        health: Math.min(100, state.health + (statBoosts.health || 0)),
      };

    case 'UNLOCK_ACHIEVEMENT':
      const achievement = state.achievements.find(a => a.id === action.payload);
      if (!achievement || achievement.isUnlocked) return state;

      return {
        ...state,
        achievements: state.achievements.map(a =>
          a.id === action.payload ? { ...a, isUnlocked: true } : a
        ),
        experience: state.experience + achievement.reward,
      };

    case 'PLAY':
      const playExp = 20;
      const newPlayExp = state.experience + playExp;
      return {
        ...state,
        happiness: Math.min(100, state.happiness + 30),
        energy: Math.max(0, state.energy - 20),
        hunger: Math.max(0, state.hunger - 10),
        lastPlayed: new Date(),
        experience: newPlayExp,
        evolution: getEvolutionStage(newPlayExp),
      };
    case 'SLEEP':
      const sleepExp = 5;
      const newSleepExp = state.experience + sleepExp;
      return {
        ...state,
        energy: Math.min(100, state.energy + 50),
        health: Math.min(100, state.health + 10),
        lastSlept: new Date(),
        experience: newSleepExp,
        evolution: getEvolutionStage(newSleepExp),
      };
    case 'UPDATE_STATUS':
      // Health decreases faster when hunger or happiness is low
      const healthPenalty = (state.hunger < 30 ? 2 : 0) + (state.happiness < 30 ? 2 : 0);
      const baseHealthLoss = 0.3; // Base health loss per second
      const newHealth = Math.max(0, state.health - (baseHealthLoss + healthPenalty));

      // Check for healthy pet achievement
      let healthAchievements = state.achievements;
      if (state.health > 80 && state.hunger > 80 && state.happiness > 80 && state.energy > 80) {
        if (!state.achievements.find(a => a.id === 'healthy_pet')?.isUnlocked) {
          healthAchievements = state.achievements.map(a =>
            a.id === 'healthy_pet' ? { ...a, isUnlocked: true } : a
          );
        }
      }

      return {
        ...state,
        hunger: Math.max(0, state.hunger - 0.2),
        happiness: Math.max(0, state.happiness - 0.2),
        energy: Math.max(0, state.energy - 0.1),
        health: newHealth,
        isAlive: newHealth > 0,
        age: state.age + 1,
        achievements: healthAchievements,
      };
    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
      };
    case 'GAIN_EXPERIENCE':
      const newExp = state.experience + action.payload;
      return {
        ...state,
        experience: newExp,
        evolution: getEvolutionStage(newExp),
      };
    default:
      return state;
  }
}

export function TamagotchiProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tamagotchiReducer, initialState);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_STATUS' });
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  return (
    <TamagotchiContext.Provider value={{ state, dispatch }}>
      {children}
    </TamagotchiContext.Provider>
  );
}

export function useTamagotchi() {
  const context = useContext(TamagotchiContext);
  if (!context) {
    throw new Error('useTamagotchi must be used within a TamagotchiProvider');
  }
  return context;
} 
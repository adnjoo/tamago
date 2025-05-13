'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TamagotchiState, TamagotchiAction, Evolution } from '@/types/tamagotchi';

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
      return {
        ...state,
        hunger: Math.min(100, state.hunger + 30),
        energy: Math.min(100, state.energy + 10),
        lastFed: new Date(),
        experience: newFeedExp,
        evolution: getEvolutionStage(newFeedExp),
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
      const newHealth = Math.max(0, state.health - (state.hunger < 30 || state.happiness < 30 ? 0.5 : 0));
      return {
        ...state,
        hunger: Math.max(0, state.hunger - 0.2),
        happiness: Math.max(0, state.happiness - 0.2),
        energy: Math.max(0, state.energy - 0.1),
        health: newHealth,
        isAlive: newHealth > 0,
        age: state.age + 1,
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
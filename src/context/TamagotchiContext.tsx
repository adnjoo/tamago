'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TamagotchiState, TamagotchiAction } from '@/types/tamagotchi';

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
};

const TamagotchiContext = createContext<{
  state: TamagotchiState;
  dispatch: React.Dispatch<TamagotchiAction>;
} | null>(null);

function tamagotchiReducer(state: TamagotchiState, action: TamagotchiAction): TamagotchiState {
  switch (action.type) {
    case 'FEED':
      return {
        ...state,
        hunger: Math.min(100, state.hunger + 30),
        energy: Math.min(100, state.energy + 10),
        lastFed: new Date(),
      };
    case 'PLAY':
      return {
        ...state,
        happiness: Math.min(100, state.happiness + 30),
        energy: Math.max(0, state.energy - 20),
        hunger: Math.max(0, state.hunger - 10),
        lastPlayed: new Date(),
      };
    case 'SLEEP':
      return {
        ...state,
        energy: Math.min(100, state.energy + 50),
        health: Math.min(100, state.health + 10),
        lastSlept: new Date(),
      };
    case 'UPDATE_STATUS':
      const newHealth = Math.max(0, state.health - (state.hunger < 30 || state.happiness < 30 ? 5 : 0));
      return {
        ...state,
        hunger: Math.max(0, state.hunger - 2),
        happiness: Math.max(0, state.happiness - 2),
        energy: Math.max(0, state.energy - 1),
        health: newHealth,
        isAlive: newHealth > 0,
      };
    case 'SET_NAME':
      return {
        ...state,
        name: action.payload,
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
    }, 10000); // Update every 10 seconds

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
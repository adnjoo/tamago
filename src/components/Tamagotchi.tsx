'use client';

import React from 'react';
import { useTamagotchi } from '@/context/TamagotchiContext';
import { Evolution } from '@/types/tamagotchi';

const SPRITES: Record<Evolution, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐔',
};

export default function Tamagotchi() {
  const { state, dispatch } = useTamagotchi();

  const getStatusColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const StatusBar = ({ value, label }: { value: number; label: string }) => (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${getStatusColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  if (!state.isAlive) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Game Over</h1>
        <p>Your Tamagotchi has passed away. Refresh to start a new game.</p>
      </div>
    );
  }

  const getNextEvolutionExp = () => {
    switch (state.evolution) {
      case 'egg': return 100;
      case 'baby': return 300;
      case 'child': return 600;
      case 'teen': return 1000;
      case 'adult': return null;
    }
  };

  const nextExp = getNextEvolutionExp();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{state.name}</h1>
        <div className="text-6xl mb-4">{SPRITES[state.evolution]}</div>
        <div className="text-sm text-gray-600 mb-2">
          Stage: {state.evolution.charAt(0).toUpperCase() + state.evolution.slice(1)}
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Age: {Math.floor(state.age / 60)} minutes
        </div>
        {nextExp && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">
              Experience: {state.experience} / {nextExp}
            </div>
            <div className="w-full h-1 bg-gray-200 rounded">
              <div
                className="h-1 rounded bg-blue-500"
                style={{ width: `${(state.experience / nextExp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <StatusBar value={state.health} label="Health" />
        <StatusBar value={state.hunger} label="Hunger" />
        <StatusBar value={state.happiness} label="Happiness" />
        <StatusBar value={state.energy} label="Energy" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => dispatch({ type: 'FEED' })}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          disabled={state.hunger >= 100}
        >
          Feed 🍎
        </button>
        <button
          onClick={() => dispatch({ type: 'PLAY' })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          disabled={state.energy <= 0}
        >
          Play 🎾
        </button>
        <button
          onClick={() => dispatch({ type: 'SLEEP' })}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          disabled={state.energy >= 100}
        >
          Sleep 😴
        </button>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { useTamagotchi } from '@/context/TamagotchiContext';
import { GameResult } from '@/types/tamagotchi';

const CHOICES = ['rock', 'paper', 'scissors'] as const;
type Choice = typeof CHOICES[number];

const EMOJIS: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export default function TamagotchiGames() {
  const { state, dispatch } = useTamagotchi();
  const [gameActive, setGameActive] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);

  const startGame = () => {
    if (state.energy < 20) return; // Need energy to play
    setGameActive(true);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  const determineWinner = (player: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const makeChoice = (choice: Choice) => {
    const computerChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
    setPlayerChoice(choice);
    setComputerChoice(computerChoice);
    const gameResult = determineWinner(choice, computerChoice);
    setResult(gameResult);

    // Calculate rewards based on result
    const gameData: GameResult = {
      success: gameResult === 'win',
      experienceGained: gameResult === 'win' ? 30 : gameResult === 'draw' ? 10 : 5,
      statBoosts: {
        happiness: gameResult === 'win' ? 20 : gameResult === 'draw' ? 10 : 5,
        energy: -20, // Playing costs energy
      },
    };

    dispatch({ type: 'COMPLETE_GAME', payload: gameData });
    setTimeout(() => setGameActive(false), 2000);
  };

  if (!gameActive) {
    return (
      <div className="mt-4">
        <button
          onClick={startGame}
          disabled={state.energy < 20}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Play Rock Paper Scissors (Energy: 20)
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-bold text-center mb-4">Rock Paper Scissors</h3>
      
      {!playerChoice ? (
        <div className="grid grid-cols-3 gap-4">
          {CHOICES.map((choice) => (
            <button
              key={choice}
              onClick={() => makeChoice(choice)}
              className="p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              <div className="text-4xl mb-2">{EMOJIS[choice]}</div>
              <div className="capitalize">{choice}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <div className="flex justify-center items-center gap-8 text-4xl mb-4">
            <div>
              <div className="text-sm mb-1">You</div>
              {EMOJIS[playerChoice]}
            </div>
            <div className="text-2xl">VS</div>
            <div>
              <div className="text-sm mb-1">Pet</div>
              {computerChoice && EMOJIS[computerChoice]}
            </div>
          </div>
          {result && (
            <div className={`text-xl font-bold ${
              result === 'win' ? 'text-green-500' : 
              result === 'lose' ? 'text-red-500' : 
              'text-yellow-500'
            }`}>
              {result === 'win' ? 'You Win!' : 
               result === 'lose' ? 'Pet Wins!' : 
               'Draw!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
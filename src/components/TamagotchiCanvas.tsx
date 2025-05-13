'use client';

import React, { useRef, useEffect } from 'react';
import { useTamagotchi } from '@/context/TamagotchiContext';
import { Evolution } from '@/types/tamagotchi';

const SPRITES: Record<Evolution, string> = {
  egg: '🥚',
  baby: '🐣',
  child: '🐥',
  teen: '🐤',
  adult: '🐔',
};

interface Position {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
}

export default function TamagotchiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef<Position>({
    x: 150,
    y: 150,
    targetX: 150,
    targetY: 150,
    speed: 2,
  });
  const { state } = useTamagotchi();

  // Pick a new random target position
  const pickNewTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 40; // Keep sprite away from edges
    const newTargetX = Math.random() * (canvas.width - padding * 2) + padding;
    const newTargetY = Math.random() * (canvas.height - padding * 2) + padding;

    positionRef.current.targetX = newTargetX;
    positionRef.current.targetY = newTargetY;
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      // Reset position when canvas size changes
      positionRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        speed: 2,
      };
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let animationFrameId: number;
    let lastTargetUpdate = Date.now();

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update position
      const pos = positionRef.current;
      const dx = pos.targetX - pos.x;
      const dy = pos.targetY - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= 1) {
        const moveX = (dx / distance) * pos.speed;
        const moveY = (dy / distance) * pos.speed;
        pos.x += moveX;
        pos.y += moveY;
      }

      // Draw sprite
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(SPRITES[state.evolution], pos.x, pos.y);

      // Pick new target every 3-6 seconds
      const now = Date.now();
      if (now - lastTargetUpdate > Math.random() * 3000 + 3000) {
        pickNewTarget();
        lastTargetUpdate = now;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [state.evolution]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] bg-white rounded-lg shadow-inner mb-4"
    />
  );
} 
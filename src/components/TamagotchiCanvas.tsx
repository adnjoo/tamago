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
  scale: number;
  jumpOffset: number;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  emoji: string;
  gravity?: number;
  bounce?: number;
  scale?: number;
}

export default function TamagotchiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positionRef = useRef<Position>({
    x: 150,
    y: 150,
    targetX: 150,
    targetY: 150,
    speed: 2,
    scale: 1,
    jumpOffset: 0,
    rotation: 0,
  });
  const particlesRef = useRef<Particle[]>([]);
  const isEatingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isSleepingRef = useRef(false);
  const playTimeRef = useRef(0);
  const sleepTimeRef = useRef(0);
  const { state } = useTamagotchi();

  // Pick a new random target position
  const pickNewTarget = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const padding = 40;
    const newTargetX = Math.random() * (canvas.width - padding * 2) + padding;
    const newTargetY = Math.random() * (canvas.height - padding * 2) + padding;

    positionRef.current.targetX = newTargetX;
    positionRef.current.targetY = newTargetY;
  };

  // Create food particles
  const createFoodParticles = () => {
    const pos = positionRef.current;
    const particles: Particle[] = [];
    const foodEmojis = ['🍎', '🍏', '🍐', '🍊', '🍌'];
    
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      particles.push({
        x: pos.x + Math.cos(angle) * 30,
        y: pos.y + Math.sin(angle) * 30,
        vx: Math.cos(angle) * 2,
        vy: Math.sin(angle) * 2,
        life: 60,
        maxLife: 60,
        emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)],
      });
    }
    
    particlesRef.current = particles;
    isEatingRef.current = true;
    positionRef.current.scale = 1.2;
  };

  // Create play particles
  const createPlayParticles = () => {
    const pos = positionRef.current;
    const particles: Particle[] = [];
    const playEmojis = ['⚽', '🎾', '🏀', '⭐', '🌟'];
    
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: pos.x,
        y: pos.y - 20,
        vx: (Math.random() - 0.5) * 8,
        vy: -8 - Math.random() * 4,
        life: 120,
        maxLife: 120,
        emoji: playEmojis[Math.floor(Math.random() * playEmojis.length)],
        gravity: 0.4,
        bounce: 0.6,
      });
    }
    
    particlesRef.current = [...particlesRef.current, ...particles];
    isPlayingRef.current = true;
    playTimeRef.current = 0;
  };

  // Create sleep particles
  const createSleepParticles = () => {
    const pos = positionRef.current;
    isSleepingRef.current = true;
    sleepTimeRef.current = 0;

    // Create initial Zzz particles
    const createZzz = () => {
      const particle: Particle = {
        x: pos.x + 20,
        y: pos.y - 20,
        vx: 0.5,
        vy: -1,
        life: 180,
        maxLife: 180,
        emoji: '💤',
        scale: 0.5,
      };
      particlesRef.current = [...particlesRef.current, particle];
    };

    createZzz();
    // Create new Zzz every 60 frames
    const interval = setInterval(() => {
      if (isSleepingRef.current) {
        createZzz();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      positionRef.current = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        targetX: canvas.width / 2,
        targetY: canvas.height / 2,
        speed: 2,
        scale: 1,
        jumpOffset: 0,
        rotation: 0,
      };
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let animationFrameId: number;
    let lastTargetUpdate = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pos = positionRef.current;

      // Update position
      if (!isPlayingRef.current && !isSleepingRef.current) {
        const dx = pos.targetX - pos.x;
        const dy = pos.targetY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= 1) {
          const moveX = (dx / distance) * pos.speed;
          const moveY = (dy / distance) * pos.speed;
          pos.x += moveX;
          pos.y += moveY;
        }
      } else if (isPlayingRef.current) {
        // Playing animation
        playTimeRef.current++;
        if (playTimeRef.current < 120) {
          pos.jumpOffset = -Math.abs(Math.sin(playTimeRef.current * 0.1) * 20);
        } else {
          pos.jumpOffset = 0;
          isPlayingRef.current = false;
        }
      } else if (isSleepingRef.current) {
        // Sleeping animation
        sleepTimeRef.current++;
        if (sleepTimeRef.current < 180) { // 3 seconds of sleep animation
          // Gentle rocking motion
          pos.rotation = Math.sin(sleepTimeRef.current * 0.05) * 0.1;
        } else {
          pos.rotation = 0;
          isSleepingRef.current = false;
        }
      }

      // Update eating animation
      if (isEatingRef.current) {
        pos.scale = Math.max(1, pos.scale - 0.01);
        if (pos.scale === 1) {
          isEatingRef.current = false;
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.gravity) {
          particle.vy += particle.gravity;
          
          if (particle.y > canvas.height - 20 && particle.bounce) {
            particle.y = canvas.height - 20;
            particle.vy = -particle.vy * particle.bounce;
          }
        }
        
        particle.life--;

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life / particle.maxLife;
          ctx.font = particle.scale ? `${20 * particle.scale}px Arial` : '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(particle.emoji, particle.x, particle.y);
        }

        return particle.life > 0;
      });
      ctx.globalAlpha = 1;

      // Draw sprite with rotation
      ctx.save();
      ctx.translate(pos.x, pos.y + pos.jumpOffset);
      ctx.rotate(pos.rotation);
      ctx.font = `${40 * pos.scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(SPRITES[state.evolution], 0, 0);
      ctx.restore();

      // Pick new target every 3-6 seconds when not playing or sleeping
      const now = Date.now();
      if (!isPlayingRef.current && !isSleepingRef.current && now - lastTargetUpdate > Math.random() * 3000 + 3000) {
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

  // Listen for feed events
  useEffect(() => {
    if (state.lastFed) {
      createFoodParticles();
    }
  }, [state.lastFed]);

  // Listen for play events
  useEffect(() => {
    if (state.lastPlayed) {
      createPlayParticles();
    }
  }, [state.lastPlayed]);

  // Listen for sleep events
  useEffect(() => {
    if (state.lastSlept) {
      const cleanup = createSleepParticles();
      return cleanup;
    }
  }, [state.lastSlept]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[200px] bg-white rounded-lg shadow-inner mb-4"
    />
  );
} 
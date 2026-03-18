import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  delay: number;
}

const COLORS = [
  '#22c55e', '#4ade80', '#86efac', // greens
  '#fbbf24', '#f59e0b', '#fcd34d', // golds
  '#6366f1', '#818cf8', '#a5b4fc', // indigos
  '#e85478', '#f3829a', '#fbd5dc', // sakura
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: randomBetween(-180, 180),
      y: randomBetween(-300, -100),
      rotation: randomBetween(-720, 720),
      scale: randomBetween(0.5, 1.2),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
      delay: randomBetween(0, 0.3),
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: '50vw',
              y: '50vh',
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: `calc(50vw + ${p.x}px)`,
              y: `calc(50vh + ${p.y}px)`,
              scale: p.scale,
              rotate: p.rotation,
              opacity: 0,
            }}
            transition={{
              duration: 1.5,
              delay: p.delay,
              ease: [0.25, 0.46, 0.45, 0.94],
              opacity: { duration: 1.2, delay: p.delay + 0.5 },
            }}
            className="absolute"
            style={{ willChange: 'transform, opacity' }}
          >
            {p.shape === 'circle' && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === 'square' && (
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: p.color }}
              />
            )}
            {p.shape === 'star' && (
              <div
                className="w-3 h-3"
                style={{ color: p.color, fontSize: '12px', lineHeight: 1 }}
              >
                ✦
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

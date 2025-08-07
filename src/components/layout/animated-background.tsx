"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Particle {
  id: number;
  x: number;
  y: number;
  xEnd: number;
  yEnd: number;
  duration: number;
  delay: number;
}

const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const isMobile = useIsMobile();
  const particleCount = useMemo(() => isMobile ? 50 : 100, [isMobile]);

  useEffect(() => {
    const newParticles: Particle[] = [];
    const { innerWidth: width, innerHeight: height } = window;

    for (let i = 0; i < particleCount; i++) {
      const xStart = Math.random() * width;
      const yStart = Math.random() * height;
      const xEnd = xStart + (Math.random() - 0.5) * 400;
      const yEnd = yStart + (Math.random() - 0.5) * 400;
      
      newParticles.push({
        id: i,
        x: xStart,
        y: yStart,
        xEnd: xEnd,
        yEnd: yEnd,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 10,
      });
    }
    setParticles(newParticles);
  }, [particleCount]);

  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--x-end': `${p.xEnd - p.x}px`,
            '--y-end': `${p.yEnd - p.y}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;

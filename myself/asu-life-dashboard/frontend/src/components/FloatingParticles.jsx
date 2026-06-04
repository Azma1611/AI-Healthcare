import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const FloatingParticles = ({ particleStyle }) => {
  const [particles] = useState(() => {
    const particleCount = 24;
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 4 + Math.random() * 4,
      size: Math.random() * 8 + 4,
      opacity: 0.2 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 60,
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            left: `${particle.left}%`,
            top: '110vh',
            opacity: 0,
          }}
          animate={{
            top: '-10vh',
            x: [0, particle.drift, -particle.drift * 0.5, 0],
            opacity: [0, particle.opacity, particle.opacity * 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            x: {
              duration: particle.duration * 0.8,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
          className={`absolute rounded-full blur-sm ${particleStyle || 'bg-pink-300/70'}`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
};

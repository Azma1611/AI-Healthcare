import React from 'react';
import { AnimatedCard } from '../AnimatedCard';

export const GlassCard = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  darkMode = false,
}) => {
  return (
    <AnimatedCard
      className={className}
      hover={hover}
      delay={delay}
      darkMode={darkMode}
    >
      {children}
    </AnimatedCard>
  );
};

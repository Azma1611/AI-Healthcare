import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

export const AnimatedCard = ({
  children,
  className = '',
  hover = true,
  delay = 0,
  darkMode = false,
}) => {
  const context = useUser();
  const themeStyles = context?.themeStyles || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay,
      }}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.12)',
              transition: { type: 'spring', stiffness: 300, damping: 15 },
            }
          : {}
      }
      className={`relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 ${themeStyles?.card || ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

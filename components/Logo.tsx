'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 96, height: 96 },
};

export function Logo({
  variant = 'auto',
  size = 'md',
  className,
  animated = true,
  onClick,
}: LogoProps) {
  const dimensions = sizeMap[size];
  
  // Determine which logo to use
  const getLogoPath = () => {
    if (variant === 'light') {
      return '/Logo/Transparant Brand Logo.png'; // Brand color logo for light backgrounds
    }
    if (variant === 'dark') {
      return '/Logo/Transparant Brand White Logo.png'; // White logo for dark backgrounds
    }
    // Auto mode - default to brand color (for light backgrounds)
    return '/Logo/Transparant Brand Logo.png';
  };

  const logoPath = getLogoPath();
  const isWhiteLogo = logoPath.includes('White');

  const LogoContent = (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isWhiteLogo ? 'bg-primary-500/10' : 'bg-transparent',
        className
      )}
    >
      <Image
        src={logoPath}
        alt="Africa TV"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(
          'object-contain transition-all duration-300',
          onClick && 'cursor-pointer'
        )}
        unoptimized
        priority
      />
    </div>
  );

  if (!animated) {
    return LogoContent;
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.1, rotate: [0, -5, 5, -5, 0] } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={cn('inline-block', onClick && 'cursor-pointer')}
      onClick={onClick}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 20,
      }}
    >
      {LogoContent}
    </motion.div>
  );
}


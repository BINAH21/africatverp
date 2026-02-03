'use client';

import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface LogoWithTextProps {
  variant?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
  href?: string;
}

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function LogoWithText({
  variant = 'auto',
  size = 'md',
  showText = true,
  textSize = 'md',
  className,
  animated = true,
  href,
}: LogoWithTextProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.push('/dashboard');
    }
  };

  const isDarkVariant = variant === 'dark' || (variant === 'auto' && false); // Auto defaults to light

  return (
    <motion.div
      className={cn('flex items-center gap-3', className)}
      onClick={href || !showText ? handleClick : undefined}
      whileHover={href || !showText ? { scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Logo
        variant={variant}
        size={size}
        animated={animated}
        onClick={href || !showText ? handleClick : undefined}
      />
      <AnimatePresence>
        {showText && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'font-bold',
              textSizeMap[textSize],
              isDarkVariant
                ? 'text-white'
                : 'bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent'
            )}
          >
            Africa TV
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


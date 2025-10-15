'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  badge?: number | boolean
  badgeColor?: string
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    children,
    badge,
    badgeColor = '#ef4444',
    size = 'md',
    className,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-9 h-9',
      lg: 'w-10 h-10',
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg',
          'bg-[#2a2a2a] dark:bg-[#2a2a2a]',
          'text-[#888] hover:text-white',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1a]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}

        {/* Badge indicator */}
        {badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute top-0 right-0 flex items-center justify-center',
              'rounded-full text-white text-[10px] font-semibold',
              'min-w-[16px] h-4 px-1',
              'border-2 border-[#1a1a1a]'
            )}
            style={{ backgroundColor: badgeColor }}
          >
            {typeof badge === 'number' && badge > 0 ? (
              badge > 99 ? '99+' : badge
            ) : null}
          </motion.span>
        )}
      </motion.button>
    )
  }
)

IconButton.displayName = 'IconButton'

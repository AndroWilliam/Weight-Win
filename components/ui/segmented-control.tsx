'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface SegmentedControlOption {
  value: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentedControlOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  size?: 'sm' | 'md'
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: SegmentedControlProps) {
  const activeIndex = options.findIndex((option) => option.value === value)

  return (
    <div
      className={cn(
        'relative inline-flex rounded-lg p-1',
        'bg-[#2a2a2a] dark:bg-[#2a2a2a]',
        className
      )}
      role="tablist"
      aria-label="Navigation tabs"
    >
      {/* Animated background indicator */}
      {activeIndex >= 0 && (
        <motion.div
          layoutId="segmented-control-indicator"
          className="absolute inset-y-1 rounded-md bg-primary"
          initial={false}
          animate={{
            x: `calc(${activeIndex * 100}% + ${activeIndex * 4}px)`,
            width: `calc(${100 / options.length}% - 4px)`,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}

      {/* Tab buttons */}
      {options.map((option) => {
        const isActive = option.value === value
        const sizeClasses = size === 'sm'
          ? 'px-3 py-1.5 text-xs min-w-[60px]'
          : 'px-4 py-2 text-sm min-w-[80px]'

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 rounded-md font-medium transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1a]',
              sizeClasses,
              isActive
                ? 'text-white'
                : 'text-[#888] hover:text-[#aaa]'
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.value}`}
            tabIndex={isActive ? 0 : -1}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

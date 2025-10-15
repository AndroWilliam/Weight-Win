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
      {/* Animated background indicator - Single source of truth */}
      {activeIndex >= 0 && (
        <motion.div
          key="tab-indicator"
          className="absolute inset-y-1 rounded-md bg-primary"
          initial={false}
          animate={{
            left: `calc(${activeIndex * (100 / options.length)}% + 4px)`,
            width: `calc(${100 / options.length}% - 8px)`,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            duration: 0.3,
          }}
          style={{
            willChange: 'left, width',
          }}
        />
      )}

      {/* Tab buttons */}
      {options.map((option, index) => {
        const isActive = option.value === value
        const sizeClasses = size === 'sm'
          ? 'px-3 py-1.5 text-xs min-w-[60px]'
          : 'px-4 py-2 text-sm min-w-[80px]'

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 rounded-md font-medium overflow-hidden',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-[#1a1a1a]',
              'after:content-[""] after:absolute after:inset-0 after:rounded-md',
              'after:bg-white/30 after:scale-0 after:transition-transform after:duration-300',
              'active:after:scale-100',
              sizeClasses,
              isActive
                ? 'text-white'
                : 'text-[#888] hover:text-[#aaa]'
            )}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${option.value}`}
            tabIndex={isActive ? 0 : -1}
            style={{
              flex: `1 1 ${100 / options.length}%`,
            }}
          >
            <span className="relative z-10">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

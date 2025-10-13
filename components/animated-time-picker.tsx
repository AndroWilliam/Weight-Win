'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedTimePickerProps {
  value: string // Format: "HH:MM"
  onChange: (value: string) => void
  className?: string
}

export function AnimatedTimePicker({ value, onChange, className }: AnimatedTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hour, setHour] = useState('08')
  const [minute, setMinute] = useState('00')
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Parse the value when component mounts or value changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':')
      const hourNum = parseInt(h)
      
      if (hourNum === 0) {
        setHour('12')
        setPeriod('AM')
      } else if (hourNum === 12) {
        setHour('12')
        setPeriod('PM')
      } else if (hourNum > 12) {
        setHour(String(hourNum - 12).padStart(2, '0'))
        setPeriod('PM')
      } else {
        setHour(h)
        setPeriod('AM')
      }
      
      setMinute(m)
    }
  }, [value])

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update parent component when time changes
  const updateTime = (h: string, m: string, p: 'AM' | 'PM') => {
    let hour24 = parseInt(h)
    
    if (p === 'PM' && hour24 !== 12) {
      hour24 += 12
    } else if (p === 'AM' && hour24 === 12) {
      hour24 = 0
    }
    
    const timeString = `${String(hour24).padStart(2, '0')}:${m}`
    onChange(timeString)
  }

  const handleHourChange = (newHour: string) => {
    setHour(newHour)
    updateTime(newHour, minute, period)
  }

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute)
    updateTime(hour, newMinute, period)
  }

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod)
    updateTime(hour, minute, newPeriod)
  }

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

  return (
    <div ref={pickerRef} className="relative">
      {/* Display Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-2 border-border
          bg-background text-foreground
          hover:border-primary hover:bg-muted/50
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          transition-all duration-200
          ${className}
        `}
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{hour}:{minute} {period}</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Clock className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Animated Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 mt-2 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-4">
              {/* Time Display */}
              <div className="text-center mb-4 pb-4 border-b border-border">
                <div className="text-3xl font-bold text-foreground flex items-center justify-center gap-1">
                  <span>{hour}</span>
                  <span className="animate-pulse">:</span>
                  <span>{minute}</span>
                  <span className="text-xl ml-2 text-primary">{period}</span>
                </div>
              </div>

              {/* Scrollable Selectors */}
              <div className="grid grid-cols-3 gap-3">
                {/* Hours */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Hour</p>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {hours.map((h) => (
                      <motion.button
                        key={h}
                        type="button"
                        onClick={() => handleHourChange(h)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-full py-2 px-3 rounded-lg text-center text-sm font-medium
                          transition-all duration-200
                          ${
                            hour === h
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-muted/50 text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        {h}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Minutes */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Min</p>
                  <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    {minutes.filter((_, i) => i % 5 === 0).map((m) => (
                      <motion.button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteChange(m)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-full py-2 px-3 rounded-lg text-center text-sm font-medium
                          transition-all duration-200
                          ${
                            minute === m
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-muted/50 text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* AM/PM */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Period</p>
                  <div className="space-y-2">
                    {['AM', 'PM'].map((p) => (
                      <motion.button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodChange(p as 'AM' | 'PM')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`
                          w-full py-3 px-3 rounded-lg text-center text-sm font-bold
                          transition-all duration-200
                          ${
                            period === p
                              ? 'bg-primary text-primary-foreground shadow-md'
                              : 'bg-muted/50 text-foreground hover:bg-muted'
                          }
                        `}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Done Button */}
              <motion.button
                type="button"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  )
}


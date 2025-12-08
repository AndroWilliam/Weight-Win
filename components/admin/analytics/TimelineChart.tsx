'use client'

import { useMemo } from 'react'

interface TimelineDataPoint {
  date: string
  clicks: number
  starts: number
}

interface TimelineChartProps {
  data: TimelineDataPoint[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  const { maxValue, chartData } = useMemo(() => {
    const allValues = data.flatMap(d => [d.clicks, d.starts])
    const max = Math.max(...allValues, 1)
    
    return {
      maxValue: max,
      chartData: data.slice(-30) // Last 30 days
    }
  }, [data])
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Activity Timeline</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
            <span className="text-gray-400">Clicks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-gray-400">Starts</span>
          </div>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          No data available yet
        </div>
      ) : (
        <div className="relative h-64 flex items-end gap-1 overflow-x-auto pb-8">
          {chartData.map((point, index) => {
            const clickHeight = (point.clicks / maxValue) * 100
            const startHeight = (point.starts / maxValue) * 100
            
            return (
              <div key={index} className="flex-1 min-w-[20px] flex flex-col items-center gap-1">
                {/* Bars */}
                <div className="w-full flex gap-0.5 items-end" style={{ height: '200px' }}>
                  <div
                    className="flex-1 bg-[#4F46E5] rounded-t hover:bg-[#6366F1] transition-colors cursor-pointer group relative"
                    style={{ height: `${Math.max(clickHeight, 2)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {point.clicks} clicks
                    </div>
                  </div>
                  <div
                    className="flex-1 bg-[#10B981] rounded-t hover:bg-[#34D399] transition-colors cursor-pointer group relative"
                    style={{ height: `${Math.max(startHeight, 2)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {point.starts} starts
                    </div>
                  </div>
                </div>
                
                {/* Date label (show every 5th) */}
                {index % 5 === 0 && (
                  <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap absolute bottom-0 rotate-[-45deg] origin-top-left">
                    {formatDate(point.date)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


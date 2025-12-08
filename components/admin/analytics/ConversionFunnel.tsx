interface FunnelData {
  clicks: number
  starts: number
  completions: number
  phones: number
}

interface ConversionFunnelProps {
  data: FunnelData
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const steps = [
    { label: 'Banner Clicks', value: data.clicks, icon: '👆', color: '#4F46E5' },
    { label: 'Started Challenge', value: data.starts, icon: '▶️', color: '#06B6D4' },
    { label: 'Completed Challenge', value: data.completions, icon: '✅', color: '#10B981' },
    { label: 'Submitted Phone', value: data.phones, icon: '📞', color: '#F59E0B' }
  ]
  
  const maxValue = data.clicks || 1
  
  const calculateRate = (current: number, previous: number) => {
    if (previous === 0) return '0.0'
    return ((current / previous) * 100).toFixed(1)
  }
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Conversion Funnel</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const width = (step.value / maxValue) * 100
          const conversionRate = index > 0 
            ? calculateRate(step.value, steps[index - 1].value)
            : '100.0'
          
          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <span className="text-white font-semibold">{step.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">{step.value.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm">
                    {conversionRate}%
                  </span>
                </div>
              </div>
              
              <div className="h-3 bg-[#0a0a0a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${width}%`,
                    backgroundColor: step.color
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Overall Conversion */}
      <div className="mt-6 pt-6 border-t border-[#333]">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Overall Conversion</span>
          <span className="text-2xl font-bold text-white">
            {calculateRate(data.phones, data.clicks)}%
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-2">
          From click to phone submission
        </p>
      </div>
    </div>
  )
}


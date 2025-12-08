interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon?: string
  color?: string
  subtitle?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon = '📊', 
  color = '#4F46E5',
  subtitle 
}: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#4F46E5] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: color }} 
        />
      </div>
      
      <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {change !== undefined && (
          <span className={`text-sm font-semibold ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-gray-500 text-xs mt-2">{subtitle}</p>
      )}
    </div>
  )
}


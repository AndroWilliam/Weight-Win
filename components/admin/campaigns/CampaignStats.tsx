export function CampaignStats({ total, active, scheduled, ended }: any) {
  const stats = [
    { label: 'Total', value: total, icon: '📊', color: '#4F46E5' },
    { label: 'Active', value: active, icon: '✅', color: '#059669' },
    { label: 'Scheduled', value: scheduled, icon: '📅', color: '#F59E0B' },
    { label: 'Ended', value: ended, icon: '🏁', color: '#6B7280' }
  ]
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(stat => (
        <div key={stat.label} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 hover:border-[#4F46E5] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{stat.icon}</span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
          <div className="text-sm text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}


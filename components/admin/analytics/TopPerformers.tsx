interface Performer {
  user_email: string
  completion_time: number
  completed_at: string
}

interface TopPerformersProps {
  performers: Performer[]
}

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">🏆 Top Performers</h3>
      
      {performers.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No completed challenges yet
        </div>
      ) : (
        <div className="space-y-3">
          {performers.slice(0, 10).map((performer, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? 'bg-[#F59E0B] text-black' :
                index === 1 ? 'bg-[#6B7280] text-white' :
                index === 2 ? 'bg-[#B45309] text-white' :
                'bg-[#2a2a2a] text-gray-400'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">{performer.user_email}</div>
                <div className="text-gray-400 text-sm">
                  Completed in {performer.completion_time} days
                </div>
              </div>
              
              {index < 3 && (
                <div className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


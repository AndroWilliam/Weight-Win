'use client'

import { useState } from 'react'

interface Participant {
  id: string
  user_id: string
  started_at: string
  completed_at: string | null
  phone_number: string | null
  days_completed: number
  status: string
  user_email?: string | null
  user_deleted?: boolean
}

interface ParticipantTableProps {
  participants: Participant[]
  requiredDays: number
}

export function ParticipantTable({ participants, requiredDays }: ParticipantTableProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all')
  const [search, setSearch] = useState('')
  
  const filteredParticipants = participants.filter(p => {
    // Filter by status
    if (filter === 'completed' && p.status !== 'completed') return false
    if (filter === 'active' && p.status !== 'active') return false
    
    // Search by email or phone
    if (search) {
      const searchLower = search.toLowerCase()
      const email = p.user_email?.toLowerCase() || ''
      const phone = p.phone_number?.toLowerCase() || ''
      const userId = p.user_id?.toLowerCase() || ''
      return email.includes(searchLower) || phone.includes(searchLower) || userId.includes(searchLower)
    }
    
    return true
  })
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const getDuration = (startedAt: string, completedAt: string | null) => {
    const start = new Date(startedAt)
    const end = completedAt ? new Date(completedAt) : new Date()
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }
  
  const completedCount = participants.filter(p => p.status === 'completed').length
  const activeCount = participants.filter(p => p.status === 'active').length
  
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Participants</h3>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            All ({participants.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            In Progress ({activeCount})
          </button>
        </div>
        
        <input
          type="text"
          placeholder="Search by email, phone, or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
        />
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#333]">
              <th className="pb-3 text-gray-400 text-sm font-semibold">User</th>
              <th className="pb-3 text-gray-400 text-sm font-semibold">Progress</th>
              <th className="pb-3 text-gray-400 text-sm font-semibold">Started</th>
              <th className="pb-3 text-gray-400 text-sm font-semibold">Duration</th>
              <th className="pb-3 text-gray-400 text-sm font-semibold">Phone</th>
              <th className="pb-3 text-gray-400 text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No participants found
                </td>
              </tr>
            ) : (
              filteredParticipants.map((participant) => (
                <tr key={participant.id} className="border-b border-[#333] hover:bg-[#0a0a0a]">
                  <td className="py-4">
                    <div className="max-w-[200px] truncate">
                      {participant.user_deleted || !participant.user_email ? (
                        <span className="text-gray-500 italic">[Deleted User]</span>
                      ) : (
                        <a
                          href={`/admin/users?search=${participant.user_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:underline font-medium"
                        >
                          {participant.user_email}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#10B981] rounded-full"
                          style={{ width: `${Math.min((participant.days_completed / requiredDays) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">
                        {participant.days_completed}/{requiredDays}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    {formatDate(participant.started_at)}
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    {getDuration(participant.started_at, participant.completed_at)} days
                  </td>
                  <td className="py-4 text-gray-400 text-sm">
                    {participant.phone_number || '—'}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      participant.status === 'completed'
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#F59E0B] text-black'
                    }`}>
                      {participant.status === 'completed' ? '✓ Done' : '⏳ Active'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


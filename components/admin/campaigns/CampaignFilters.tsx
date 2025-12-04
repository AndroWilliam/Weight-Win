'use client'

import { useEffect, useState } from 'react'

export function CampaignFilters({ statusFilter, onStatusChange, searchQuery, onSearchChange, sortBy, onSortChange }: any) {
  const [search, setSearch] = useState(searchQuery)
  
  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(search), 300)
    return () => clearTimeout(timer)
  }, [search, onSearchChange])
  
  const tabs = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'ended', label: 'Ended' },
    { value: 'paused', label: 'Paused' }
  ]
  
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:outline-none focus:border-[#4F46E5]"
        >
          <option value="date">Sort by: Date</option>
          <option value="name">Sort by: Name</option>
          <option value="participants">Sort by: Participants</option>
        </select>
      </div>
    </div>
  )
}


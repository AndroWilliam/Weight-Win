'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { PartnerCard } from '@/components/admin/partners/PartnerCard'
import { PartnerModal } from '@/components/admin/partners/PartnerModal'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch' }))
    throw new Error(error.message || error.error || 'Failed to fetch')
  }
  return res.json()
}

export default function PartnersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState<any>(null)
  
  // Build query string
  const queryParams = new URLSearchParams()
  if (searchQuery) queryParams.set('search', searchQuery)
  if (activeFilter !== 'all') queryParams.set('active', activeFilter)
  
  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/partners?${queryParams.toString()}`,
    fetcher
  )
  
  const partners = data?.data || []
  
  const handleAddPartner = () => {
    setEditingPartner(null)
    setShowModal(true)
  }
  
  const handleEditPartner = (partner: any) => {
    setEditingPartner(partner)
    setShowModal(true)
  }
  
  const handleModalClose = () => {
    setShowModal(false)
    setEditingPartner(null)
  }
  
  const handleSuccess = () => {
    mutate()
    setShowModal(false)
    setEditingPartner(null)
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🤝 Partners</h1>
          <p className="text-gray-400">Manage your partner organizations</p>
        </div>
        <button
          onClick={handleAddPartner}
          className="px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Add Partner
        </button>
      </div>
      
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Active/Inactive Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            All Partners
          </button>
          <button
            onClick={() => setActiveFilter('true')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeFilter === 'true'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('false')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeFilter === 'false'
                ? 'bg-[#4F46E5] text-white'
                : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
            }`}
          >
            Inactive
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search partners..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-[#1a1a1a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#4F46E5]"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        </div>
      </div>
      
      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4F46E5]"></div>
        </div>
      )}
      
      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-400">Failed to load partners</p>
          <button onClick={() => mutate()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
            Retry
          </button>
        </div>
      )}
      
      {/* Empty */}
      {!isLoading && !error && partners.length === 0 && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No partners found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery || activeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first partner'}
          </p>
          {!searchQuery && activeFilter === 'all' && (
            <button
              onClick={handleAddPartner}
              className="px-6 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg"
            >
              Add First Partner
            </button>
          )}
        </div>
      )}
      
      {/* Partner Cards Grid */}
      {!isLoading && !error && partners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner: any) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onEdit={handleEditPartner}
              onRefresh={mutate}
            />
          ))}
        </div>
      )}
      
      {/* Partner Modal */}
      {showModal && (
        <PartnerModal
          partner={editingPartner}
          onClose={handleModalClose}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}


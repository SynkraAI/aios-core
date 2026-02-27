'use client'

import { useEffect, useState } from 'react'
import { useCapturedOffersStore, type CapturedOffer } from '@/stores/captured-offers'
import { CapturedOffersTable } from '@/components/tables/CapturedOffersTable'
import { OfferDetailModal } from '@/components/modals/OfferDetailModal'
import { OfferReplicationModal } from '@/components/modals/OfferReplicationModal'

export default function CapturedOffersPage() {
  const {
    offers,
    filters,
    loading,
    error,
    total,
    counts,
    setFilters,
    fetchOffers,
    setError,
    resetFilters,
  } = useCapturedOffersStore()

  const [selectedOffer, setSelectedOffer] = useState<CapturedOffer | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOfferForReplication, setSelectedOfferForReplication] = useState<CapturedOffer | null>(null)
  const [showReplicationModal, setShowReplicationModal] = useState(false)

  // Fetch offers on mount and set up polling
  useEffect(() => {
    fetchOffers()

    // Set up polling for updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchOffers()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchOffers])

  // Handle marketplace filter change
  const handleMarketplaceChange = (marketplace: string | null) => {
    setFilters({ marketplace: marketplace === 'all' ? null : marketplace })
  }

  // Handle date range change
  const handleDatePreset = (preset: 'today' | 'week' | 'month' | 'custom' | null) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let dateFrom: Date | null = null
    let dateTo: Date | null = today

    if (preset === 'today') {
      dateFrom = new Date(today)
    } else if (preset === 'week') {
      dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 7)
    } else if (preset === 'month') {
      dateFrom = new Date(today)
      dateFrom.setDate(dateFrom.getDate() - 30)
    } else if (preset === null) {
      dateFrom = null
      dateTo = null
    }

    setFilters({ dateFrom, dateTo })
  }

  // Handle custom date range
  const handleCustomDateRange = (from: string, to: string) => {
    const dateFrom = from ? new Date(from) : null
    const dateTo = to ? new Date(to) : null

    setFilters({ dateFrom, dateTo })
  }

  // Handle search
  const handleSearch = (query: string) => {
    setFilters({ search: query })
  }

  // Handle duplicate filter toggle
  const handleDuplicateToggle = (show: boolean) => {
    setFilters({ showDuplicates: show })
  }

  // Handle offer row click
  const handleOfferClick = (offer: CapturedOffer) => {
    setSelectedOffer(offer)
    setShowDetailModal(true)
  }

  // Handle offer replication click
  const handleOfferReplication = (offer: CapturedOffer) => {
    setSelectedOfferForReplication(offer)
    setShowReplicationModal(true)
  }

  // Handle replication success
  const handleReplicationSuccess = () => {
    // Refresh offers list
    fetchOffers()
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ofertas Capturadas
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie ofertas capturadas de grupos de concorrentes monitorados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total de Ofertas</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Capturado Hoje</p>
            <p className="text-3xl font-bold text-blue-600">{counts.today}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Novas Ofertas</p>
            <p className="text-3xl font-bold text-green-600">{counts.new}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Por Marketplace</p>
            <div className="mt-2 space-y-1">
              {Object.entries(counts.by_marketplace).map(([marketplace, count]) => (
                <p key={marketplace} className="text-sm text-gray-600">
                  {marketplace === 'mercadolivre' ? 'ML' : marketplace.toUpperCase()}: {count}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && offers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando ofertas capturadas...</p>
            </div>
          </div>
        ) : (
          // Content
          <div className="bg-white rounded-lg shadow">
            {/* Filters Section */}
            <div className="border-b p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                {/* Marketplace Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marketplace
                  </label>
                  <select
                    value={filters.marketplace || 'all'}
                    onChange={(e) => handleMarketplaceChange(e.target.value === 'all' ? null : e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos os Marketplaces</option>
                    <option value="shopee">Shopee</option>
                    <option value="mercadolivre">Mercado Livre</option>
                    <option value="amazon">Amazon</option>
                  </select>
                </div>

                {/* Date Range Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo de Datas
                  </label>
                  <select
                    onChange={(e) => {
                      const value = e.target.value as 'today' | 'week' | 'month' | 'custom' | null
                      if (value === 'custom') {
                        // TODO: Open custom date picker
                      } else {
                        handleDatePreset(value || null)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todo o Período</option>
                    <option value="today">Hoje</option>
                    <option value="week">Últimos 7 dias</option>
                    <option value="month">Últimos 30 dias</option>
                  </select>
                </div>

                {/* Duplicate Filter */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={filters.showDuplicates}
                      onChange={(e) => handleDuplicateToggle(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Mostrar Duplicatas
                    </span>
                  </label>
                </div>

                {/* Search Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pesquisar Produto
                  </label>
                  <input
                    type="text"
                    placeholder="Pesquisar ofertas por nome de produto..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Active Filters Display */}
              {(filters.marketplace || filters.dateFrom || !filters.showDuplicates || filters.search) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                  {filters.marketplace && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      {filters.marketplace}
                      <button
                        onClick={() => handleMarketplaceChange(null)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {!filters.showDuplicates && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      No duplicates
                      <button
                        onClick={() => handleDuplicateToggle(true)}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.search && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                      &quot;{filters.search}&quot;
                      <button
                        onClick={() => handleSearch('')}
                        className="hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium ml-2 border-l pl-2"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <CapturedOffersTable
              offers={offers}
              loading={loading}
              onRowClick={handleOfferClick}
              onReplicateClick={handleOfferReplication}
              total={total}
              currentPage={filters.page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <OfferDetailModal
        offer={selectedOffer}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false)
          setSelectedOffer(null)
        }}
      />

      {/* Replication Modal */}
      <OfferReplicationModal
        offer={selectedOfferForReplication}
        isOpen={showReplicationModal}
        onClose={() => {
          setShowReplicationModal(false)
          setSelectedOfferForReplication(null)
        }}
        onSuccess={handleReplicationSuccess}
      />
    </div>
  )
}

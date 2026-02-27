'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import type { CapturedOffer } from '@/stores/captured-offers'

interface CapturedOffersTableProps {
  offers: CapturedOffer[]
  loading?: boolean
  onRowClick: (offer: CapturedOffer) => void
  onReplicateClick: (offer: CapturedOffer) => void
  total: number
  currentPage: number
  onPageChange: (page: number) => void
}

const ITEMS_PER_PAGE = 20

export function CapturedOffersTable({
  offers,
  loading = false,
  onRowClick,
  onReplicateClick,
  total,
  currentPage,
  onPageChange,
}: CapturedOffersTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)

  // Get marketplace badge color and label
  const getMarketplaceBadge = (marketplace: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      shopee: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Shopee' },
      mercadolivre: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Mercado Livre',
      },
      amazon: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Amazon' },
    }

    const style = styles[marketplace] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: marketplace,
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    )
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800' },
      pending_substitution: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      ready: { bg: 'bg-green-100', text: 'text-green-800' },
      sent: { bg: 'bg-purple-100', text: 'text-purple-800' },
      expired: { bg: 'bg-gray-100', text: 'text-gray-800' },
    }

    const style = styles[status] || { bg: 'bg-gray-100', text: 'text-gray-800' }

    const label = status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded ${style.bg} ${style.text}`}>
        {label}
      </span>
    )
  }

  // Format price display
  const formatPrice = (offer: CapturedOffer) => {
    const original = offer.original_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    const discounted = offer.discounted_price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

    if (offer.discount_percent > 0) {
      return `${original} → ${discounted} (-${offer.discount_percent}%)`
    }
    return original
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('pt-BR')
  }

  // Extract group name from JID
  const formatGroupName = (jid: string) => {
    // Format: "120363001@g.us" -> "Group"
    return jid.includes('@g.us') ? `Group ${jid.split('@')[0]}` : jid
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      {/* Loading state */}
      {loading && (
        <div className="p-4 bg-blue-50 text-blue-800 rounded">
          Loading offers...
        </div>
      )}

      {/* Empty state */}
      {!loading && offers.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded">
          <p className="text-gray-600 text-lg font-medium">Nenhuma oferta capturada ainda</p>
          <p className="text-gray-500 text-sm mt-1">
            As ofertas aparecerão aqui conforme os concorrentes postarem em grupos monitorados
          </p>
        </div>
      )}

      {/* Table */}
      {offers.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Marketplace
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Source Group
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Captured
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Duplicate
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {offers.map((offer) => (
                  <tr
                    key={offer.id}
                    onClick={() => onRowClick(offer)}
                    onMouseEnter={() => setHoveredRowId(offer.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                    className={`cursor-pointer transition-colors ${
                      hoveredRowId === offer.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Product Name */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {offer.product_title}
                        </p>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {offer.product_id}
                        </p>
                      </div>
                    </td>

                    {/* Marketplace */}
                    <td className="px-6 py-4">
                      {getMarketplaceBadge(offer.marketplace)}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(offer)}
                      </p>
                    </td>

                    {/* Source Group */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatGroupName(offer.source_group_jid)}
                      </p>
                    </td>

                    {/* Captured Date */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {formatDate(offer.captured_at)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(offer.status)}
                    </td>

                    {/* Duplicate Indicator */}
                    <td className="px-6 py-4">
                      {offer.is_duplicate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Duplicate
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onReplicateClick(offer)
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Replicar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t rounded-b">
              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({total} total)
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm text-gray-700 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-2 py-1 text-sm rounded ${
                          page === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm text-gray-700 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

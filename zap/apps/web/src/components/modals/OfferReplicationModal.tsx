'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react'
import type { CapturedOffer } from '@/stores/captured-offers'

interface Connection {
  id: string
  phone: string | null
  display_name: string | null
  status: 'connecting' | 'connected' | 'disconnected' | 'banned'
}

interface Group {
  id: string
  connection_id: string
  name: string
  members_count: number | null
}

interface OfferReplicationModalProps {
  offer: CapturedOffer | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function OfferReplicationModal({
  offer,
  isOpen,
  onClose,
  onSuccess,
}: OfferReplicationModalProps) {
  const queryClient = useQueryClient()
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())

  // Fetch connections
  const { data: connectionsData } = useQuery<{ data: Connection[] }>({
    queryKey: ['connections'],
    enabled: isOpen,
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
        },
      }).then((r) => r.json()),
  })

  // Fetch groups for selected connection
  const { data: groupsData } = useQuery<{ data: Group[] }>({
    queryKey: ['groups', selectedConnectionId],
    enabled: isOpen && !!selectedConnectionId,
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
        },
      }).then((r) => r.json()),
  })

  const connections = connectionsData?.data ?? []
  const groups = groupsData?.data ?? []

  // Filter groups for selected connection
  const filteredGroups = selectedConnectionId
    ? groups.filter((g) => g.connection_id === selectedConnectionId)
    : []

  // Replication mutation
  const replicationMutation = useMutation({
    mutationFn: async () => {
      if (!offer || !selectedConnectionId) {
        throw new Error('Missing offer or connection')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/captured-offers/${offer.id}/replicate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
          },
          body: JSON.stringify({
            connectionId: selectedConnectionId,
            targetGroupIds: Array.from(selectedGroupIds),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to replicate offer: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['captured-offers'] })
      onSuccess?.()
      handleClose()
    },
  })

  const handleClose = () => {
    setSelectedConnectionId(null)
    setSelectedGroupIds(new Set())
    onClose()
  }

  const toggleGroupSelection = (groupId: string) => {
    const newSelection = new Set(selectedGroupIds)
    if (newSelection.has(groupId)) {
      newSelection.delete(groupId)
    } else {
      newSelection.add(groupId)
    }
    setSelectedGroupIds(newSelection)
  }

  const selectAllGroups = () => {
    if (selectedGroupIds.size === filteredGroups.length) {
      setSelectedGroupIds(new Set())
    } else {
      setSelectedGroupIds(new Set(filteredGroups.map((g) => g.id)))
    }
  }

  const isReadyToReplicate =
    selectedConnectionId &&
    selectedGroupIds.size > 0 &&
    !replicationMutation.isPending

  if (!isOpen || !offer) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Replicar Oferta</h2>
            <p className="text-sm text-gray-600 mt-1">{offer.product_title}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status messages */}
          {replicationMutation.isSuccess && (
            <div className="flex gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900">Oferta enfileirada com sucesso!</p>
                <p className="text-sm text-green-700 mt-1">
                  A oferta será replicada em {selectedGroupIds.size} grupo(s) em breve.
                </p>
              </div>
            </div>
          )}

          {replicationMutation.isError && (
            <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Erro ao replicar</p>
                <p className="text-sm text-red-700 mt-1">
                  {replicationMutation.error instanceof Error
                    ? replicationMutation.error.message
                    : 'Ocorreu um erro ao processar a replicação'}
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Select Connection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              1. Selecione a Conexão WhatsApp
            </label>
            <div className="space-y-2">
              {connections.length === 0 ? (
                <p className="text-sm text-gray-600 py-4">
                  Nenhuma conexão WhatsApp disponível. Configure uma conexão primeiro.
                </p>
              ) : (
                connections.map((conn) => (
                  <label
                    key={conn.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedConnectionId === conn.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="connection"
                      value={conn.id}
                      checked={selectedConnectionId === conn.id}
                      onChange={() => {
                        setSelectedConnectionId(conn.id)
                        setSelectedGroupIds(new Set())
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">
                        {conn.display_name || conn.phone || 'WhatsApp Connection'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {conn.status === 'connected' ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-600 rounded-full" />
                            Conectado
                          </span>
                        ) : (
                          <span className="text-red-600">Não conectado</span>
                        )}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Step 2: Select Groups */}
          {selectedConnectionId && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-900">
                  2. Selecione os Grupos de Destino
                </label>
                {filteredGroups.length > 0 && (
                  <button
                    onClick={selectAllGroups}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {selectedGroupIds.size === filteredGroups.length
                      ? 'Desselecionar Tudo'
                      : 'Selecionar Tudo'}
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredGroups.length === 0 ? (
                  <p className="text-sm text-gray-600 py-4">
                    Nenhum grupo disponível para esta conexão.
                  </p>
                ) : (
                  filteredGroups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedGroupIds.has(group.id)}
                        onChange={() => toggleGroupSelection(group.id)}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{group.name}</p>
                        {group.members_count && (
                          <p className="text-xs text-gray-600">
                            {group.members_count} membros
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {selectedGroupIds.size > 0 && (
                <p className="text-sm text-gray-600 mt-3">
                  {selectedGroupIds.size} grupo(s) selecionado(s)
                </p>
              )}
            </div>
          )}

          {/* Offer Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Resumo da Oferta</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Marketplace</p>
                <p className="font-medium text-gray-900 capitalize">{offer.marketplace}</p>
              </div>
              <div>
                <p className="text-gray-600">Preço</p>
                <p className="font-medium text-gray-900">
                  {offer.discounted_price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              {offer.discount_percent > 0 && (
                <div>
                  <p className="text-gray-600">Desconto</p>
                  <p className="font-medium text-green-600">{offer.discount_percent}% OFF</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t bg-white">
          <button
            onClick={handleClose}
            disabled={replicationMutation.isPending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => replicationMutation.mutate()}
            disabled={!isReadyToReplicate}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 ${
              isReadyToReplicate
                ? 'bg-primary hover:bg-primary/90'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            {replicationMutation.isPending
              ? 'Enfileirando...'
              : `Replicar em ${selectedGroupIds.size} Grupo(s)`}
          </button>
        </div>
      </div>
    </div>
  )
}

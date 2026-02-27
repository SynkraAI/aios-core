'use client'

import { Header } from '@/components/layout/header'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Save, AlertCircle, CheckCircle, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CredentialStatus {
  configured: boolean
  affiliate_id?: string
  account_tag?: string
  associates_id?: string
}

interface CredentialsResponse {
  shopee: CredentialStatus
  mercadolivre: CredentialStatus
  amazon: CredentialStatus
}

interface ApiMarketplace {
  key: 'shopee' | 'mercadolivre' | 'amazon'
  name: string
  icon: string
  description: string
  docsUrl: string
  fields: {
    name: string
    label: string
    placeholder: string
    type: 'text' | 'password'
    hint?: string
  }[]
}

const MARKETPLACES: ApiMarketplace[] = [
  {
    key: 'shopee',
    name: 'Shopee',
    icon: '🛒',
    description: 'Configure suas credenciais de afiliado da Shopee',
    docsUrl: 'https://affiliate.shopee.com.br/open_api/home',
    fields: [
      {
        name: 'affiliate_id',
        label: 'Shopee Affiliate ID',
        placeholder: 'seu-affiliate-id',
        type: 'text',
        hint: 'Disponível no painel de afiliados da Shopee',
      },
      {
        name: 'api_key',
        label: 'Shopee API Key (Senha)',
        placeholder: '••••••••',
        type: 'password',
        hint: 'Sua senha do programa de afiliados',
      },
    ],
  },
  {
    key: 'mercadolivre',
    name: 'Mercado Livre',
    icon: '📦',
    description: 'Configure suas credenciais de afiliado do Mercado Livre',
    docsUrl: 'https://www.mercadolivre.com.br',
    fields: [
      {
        name: 'account_tag',
        label: 'Etiqueta de Conta',
        placeholder: 'sua-etiqueta',
        type: 'text',
        hint: 'Nome da etiqueta no administrador de etiquetas do ML',
      },
      {
        name: 'token',
        label: 'Token de Sessão',
        placeholder: '••••••••',
        type: 'password',
        hint: 'Token capturado via extensão Chrome ou manualmente',
      },
    ],
  },
  {
    key: 'amazon',
    name: 'Amazon',
    icon: '🔗',
    description: 'Configure suas credenciais de afiliado da Amazon',
    docsUrl: 'https://associates.amazon.com.br',
    fields: [
      {
        name: 'associates_id',
        label: 'Associates ID',
        placeholder: 'seu-associates-id',
        type: 'text',
        hint: 'Seu ID do programa de afiliados da Amazon',
      },
      {
        name: 'account_id',
        label: 'Account ID (Opcional)',
        placeholder: 'account-id-opcional',
        type: 'text',
        hint: 'ID da conta (opcional para configuração adicional)',
      },
    ],
  },
]

export default function ApisPage() {
  const queryClient = useQueryClient()
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({})
  const [savingMarketplace, setSavingMarketplace] = useState<string | null>(null)
  const [savedMarketplace, setSavedMarketplace] = useState<string | null>(null)

  // Fetch credential status
  const { data: credentialsStatus } = useQuery<CredentialsResponse>({
    queryKey: ['marketplace-credentials'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace-credentials`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
        },
      }).then((r) => r.json()),
  })

  // Save credential mutation
  const saveMutation = useMutation({
    mutationFn: async ({ marketplace, data }: { marketplace: string; data: Record<string, string> }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace-credentials/${marketplace}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar credenciais')
      }

      return response.json()
    },
    onSuccess: (_, { marketplace }) => {
      setSavedMarketplace(marketplace)
      setSavingMarketplace(null)
      queryClient.invalidateQueries({ queryKey: ['marketplace-credentials'] })
      setTimeout(() => setSavedMarketplace(null), 3000)
    },
    onError: (error, { marketplace }) => {
      setSavingMarketplace(null)
      alert(`Erro ao salvar credenciais do ${marketplace}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    },
  })

  // Delete credential mutation
  const deleteMutation = useMutation({
    mutationFn: async (marketplace: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace-credentials/${marketplace}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('zap-auth') ? JSON.parse(localStorage.getItem('zap-auth')!).state?.token : ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao deletar credenciais')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-credentials'] })
    },
  })

  const handleFieldChange = (marketplace: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [marketplace]: {
        ...(prev[marketplace] || {}),
        [field]: value,
      },
    }))
  }

  const handleSave = async (marketplace: string, marketplaceKey: string) => {
    const data = formData[marketplace]
    if (!data || Object.values(data).every((v) => !v)) {
      alert('Preencha pelo menos um campo')
      return
    }

    setSavingMarketplace(marketplace)
    await saveMutation.mutateAsync({ marketplace: marketplaceKey, data })
  }

  const handleDelete = async (marketplace: string, marketplaceKey: string) => {
    if (!confirm(`Deseja deletar as credenciais do ${marketplace}?`)) return
    await deleteMutation.mutateAsync(marketplaceKey)
  }

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const isCredentialConfigured = (marketplace: string) => {
    if (!credentialsStatus) return false
    return credentialsStatus[marketplace as keyof CredentialsResponse]?.configured || false
  }

  return (
    <div>
      <Header title="Configurar APIs de Marketplaces" />
      <div className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">Credenciais Protegidas</p>
            <p className="text-xs text-blue-700 mt-1">
              Suas credenciais são criptografadas e nunca são compartilhadas. Apenas usadas para construir links de afiliado.
            </p>
          </div>
        </div>

        {/* Marketplace Cards */}
        <div className="space-y-6">
          {MARKETPLACES.map((marketplace) => {
            const isConfigured = isCredentialConfigured(marketplace.key)
            const formValues = formData[marketplace.name] || {}

            return (
              <div
                key={marketplace.key}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{marketplace.icon}</span>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{marketplace.name}</h2>
                      <p className="text-sm text-gray-600">{marketplace.description}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {isConfigured && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Configurado
                      </div>
                    )}
                    <a
                      href={marketplace.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-primary transition-colors"
                      title="Abrir documentação"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  {marketplace.fields.map((field) => {
                    const key = `${marketplace.name}-${field.name}`
                    const value = formValues[field.name] || ''
                    const showSecret = showSecrets[key]

                    return (
                      <div key={field.name}>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            type={showSecret || field.type === 'text' ? 'text' : 'password'}
                            placeholder={field.placeholder}
                            value={value}
                            onChange={(e) =>
                              handleFieldChange(marketplace.name, field.name, e.target.value)
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => toggleShowSecret(key)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showSecret ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {field.hint && (
                          <p className="text-xs text-gray-500 mt-1.5">{field.hint}</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-7 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleSave(marketplace.name, marketplace.key)}
                    disabled={savingMarketplace === marketplace.name || saveMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      savingMarketplace === marketplace.name
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {savingMarketplace === marketplace.name ? 'Salvando...' : 'Salvar'}
                  </button>

                  {isConfigured && (
                    <button
                      onClick={() => handleDelete(marketplace.name, marketplace.key)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </button>
                  )}

                  {savedMarketplace === marketplace.name && (
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Salvo com sucesso
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Como Configurar</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              <strong>Shopee:</strong> Visite{' '}
              <a href="https://affiliate.shopee.com.br/open_api/home" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                affiliate.shopee.com.br
              </a>
              {' '}e copie seu Affiliate ID e API Key
            </li>
            <li>
              <strong>Mercado Livre:</strong> Pegue a etiqueta no administrador de etiquetas e use uma extensão para capturar o token
            </li>
            <li>
              <strong>Amazon:</strong> Visite{' '}
              <a href="https://associates.amazon.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                associates.amazon.com.br
              </a>
              {' '}e copie seu Associates ID
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

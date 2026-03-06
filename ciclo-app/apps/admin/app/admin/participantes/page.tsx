import type { Metadata } from 'next'
import {
  getParticipants,
  getEventsForFilter,
} from '../../../lib/actions/participants'
import { ParticipantListClient } from '../../../components/participants/participant-list-client'

export const metadata: Metadata = {
  title: 'Participantes (CRM)',
  description: 'CRM de participantes com histórico, filtros e export',
}

interface ParticipantesPageProps {
  searchParams: Promise<{
    page?: string
    eventId?: string
    status?: string
    isFirstTime?: string
    search?: string
  }>
}

export default async function ParticipantesPage({ searchParams }: ParticipantesPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1

  const filters = {
    eventId: params.eventId || undefined,
    status: (params.status as 'CONFIRMED' | 'PENDING' | 'CANCELLED') || undefined,
    isFirstTime: params.isFirstTime === 'true' ? true : params.isFirstTime === 'false' ? false : undefined,
    search: params.search || undefined,
  }

  const [result, events] = await Promise.all([
    getParticipants(filters, page, 25),
    getEventsForFilter(),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Participantes (CRM)</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerenciar participantes, visualizar histórico e exportar dados.
        </p>
      </div>

      <ParticipantListClient
        participants={result.participants}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        events={events}
        currentFilters={filters}
      />
    </div>
  )
}

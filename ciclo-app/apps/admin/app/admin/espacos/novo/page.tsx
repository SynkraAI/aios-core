import type { Metadata } from 'next'
import Link from 'next/link'
import { RoomForm } from '../../../../components/accommodations/room-form'

export const metadata: Metadata = {
  title: 'Criar Quarto',
  description: 'Criar novo quarto na Sun House',
}

export default function NovoQuartoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/espacos" className="hover:text-gray-700">
            Espaços
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Novo</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Criar Quarto</h1>
        <p className="mt-1 text-sm text-gray-600">
          Preencha os campos para cadastrar um novo quarto na Sun House.
        </p>
      </div>

      <RoomForm mode="create" />
    </div>
  )
}

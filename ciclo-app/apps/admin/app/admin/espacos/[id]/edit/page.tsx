import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRoom } from '../../../../../lib/actions/accommodations'
import { RoomForm } from '../../../../../components/accommodations/room-form'

export const metadata: Metadata = {
  title: 'Editar Quarto',
  description: 'Editar quarto da Sun House',
}

interface EditRoomPageProps {
  params: Promise<{ id: string }>
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  const { id } = await params
  const room = await getRoom(id)

  if (!room) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/admin/espacos" className="hover:text-gray-700">
            Espaços
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{room.name}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Editar Quarto</h1>
      </div>

      <RoomForm
        mode="edit"
        room={{
          id: room.id,
          name: room.name,
          theme: room.theme,
          description: room.description,
          pricePerNight: room.pricePerNight,
          capacity: room.capacity,
          isAvailable: room.isAvailable,
        }}
      />
    </div>
  )
}

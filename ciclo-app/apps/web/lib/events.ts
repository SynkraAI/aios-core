/**
 * Data fetching functions for public event pages.
 * Story E2.5 — Página Pública do Evento (SSR)
 */
import { prisma } from '@ciclo/database'

export async function getPublicEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, isPublished: true, isDeleted: false },
    include: {
      images: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
      activities: {
        orderBy: { order: 'asc' },
        include: {
          facilitator: {
            select: { id: true, name: true, photoUrl: true, specialties: true },
          },
        },
      },
      eventFacilitators: {
        include: { facilitator: true },
      },
      ticketTypes: true,
      cancellationPolicy: true,
    },
  })
}

export async function getPublishedEvents() {
  return prisma.event.findMany({
    where: { isPublished: true, isDeleted: false },
    include: {
      images: { take: 1, orderBy: { order: 'asc' } },
      ticketTypes: true,
    },
    orderBy: { startDate: 'asc' },
  })
}

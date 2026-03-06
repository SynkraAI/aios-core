import * as React from 'react'
import { cn } from '../../lib/utils'
import type { Season } from '../../contexts/season-context'

type EventStatus = 'disponivel' | 'esgotado' | 'em-breve'

const STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  disponivel: {
    label: 'Disponível',
    className: 'bg-base-emerald/15 text-base-emerald border-base-emerald/20',
  },
  esgotado: {
    label: 'Esgotado',
    className: 'bg-base-coral/15 text-base-coral border-base-coral/20',
  },
  'em-breve': {
    label: 'Em breve',
    className: 'bg-[#d4a574]/15 text-[#8B4513] border-[#d4a574]/20',
  },
} as const

const ELEMENT_ICONS: Record<string, string> = {
  Madeira: '\u6728',
  Fogo: '\u706B',
  Metal: '\u91D1',
  Água: '\u6C34',
  Terra: '\u571F',
} as const

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  date: string
  season?: Season
  element?: string
  status?: EventStatus
  priceFrom?: number
  imageUrl?: string
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      className,
      title,
      date,
      element,
      status = 'disponivel',
      priceFrom,
      imageUrl,
      ...props
    },
    ref,
  ) => {
    const statusConfig = STATUS_CONFIG[status]
    const elementIcon = element ? ELEMENT_ICONS[element] : undefined

    return (
      <div
        ref={ref}
        className={cn(
          'group relative overflow-hidden rounded-lg transition-seasonal',
          'card-seasonal',
          className,
        )}
        {...props}
      >
        {/* Gradiente sazonal de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-seasonal-primary/8 via-transparent to-seasonal-secondary/8 transition-seasonal" />

        {/* Borda sacred sutil */}
        <div className="absolute inset-0 rounded-lg border border-[#d4a574]/10" />

        {/* Imagem opcional com overlay */}
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        <div className="relative p-5 sm:p-6">
          {/* Header: Elemento MTC + Status Badge */}
          <div className="mb-3 flex items-center justify-between">
            {elementIcon && (
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-seasonal-primary/15 text-base font-bold text-seasonal-primary transition-seasonal"
                aria-label={`Elemento ${element}`}
              >
                {elementIcon}
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
                statusConfig.className,
              )}
              role="status"
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Titulo */}
          <h3 className="font-heading text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h3>

          {/* Data */}
          <p className="mt-1.5 text-sm text-muted-foreground">
            {date}
          </p>

          {/* Preco */}
          {priceFrom !== undefined && (
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-xs text-muted-foreground">A partir de</span>
              <span className="font-heading text-lg font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(priceFrom)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  },
)
EventCard.displayName = 'EventCard'

export { EventCard }
export type { EventCardProps, EventStatus }

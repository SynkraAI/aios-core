'use client'

import * as React from 'react'
import { cn } from '../../lib/utils'
import type { Season } from '../../contexts/season-context'

interface SeasonSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: Season
  onSeasonChange: (season: Season) => void
}

const SEASONS: { key: Season; label: string; emoji: string; color: string }[] = [
  { key: 'primavera', label: 'Primavera', emoji: '\uD83C\uDF31', color: '#5EA142' },
  { key: 'verao', label: 'Verão', emoji: '\u2600\uFE0F', color: '#D48113' },
  { key: 'outono', label: 'Outono', emoji: '\uD83C\uDF42', color: '#C97A46' },
  { key: 'inverno', label: 'Inverno', emoji: '\u2744\uFE0F', color: '#185474' },
] as const

export function SeasonSelector({
  value,
  onSeasonChange,
  className,
  ...props
}: SeasonSelectorProps) {
  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="radiogroup"
      aria-label="Selecionar estação"
      {...props}
    >
      {SEASONS.map((season) => {
        const isActive = value === season.key
        return (
          <button
            key={season.key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSeasonChange(season.key)}
            className={cn(
              'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-300',
              isActive
                ? 'scale-105 bg-white/80 shadow-lg backdrop-blur-sm'
                : 'opacity-60 hover:opacity-80',
            )}
            style={{
              boxShadow: isActive ? `0 0 20px ${season.color}30` : undefined,
              borderColor: isActive ? `${season.color}40` : 'transparent',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            <span className="text-lg">{season.emoji}</span>
            <span style={{ color: isActive ? season.color : undefined }}>
              {season.label}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-0.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full"
                style={{ backgroundColor: season.color }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

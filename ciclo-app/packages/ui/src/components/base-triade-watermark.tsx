import type { HTMLAttributes } from 'react'
import { cn } from '../lib/utils'

interface BaseTriadeWatermarkProps extends HTMLAttributes<HTMLDivElement> {
  opacity?: number
}

export function BaseTriadeWatermark({
  opacity = 0.03,
  className,
  ...props
}: BaseTriadeWatermarkProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden print:hidden',
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {/* Triskle Base Tríade — rotação em 137s (número sagrado / ângulo áureo) */}
      <div
        style={{
          opacity,
          animation: 'watermark-rotate 137s linear infinite',
        }}
      >
        <svg
          width="900"
          height="900"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Triskle — três espirais (Base Tríade) */}
          <g stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M50 50 C50 35, 60 20, 50 10 C40 20, 35 35, 50 50" opacity="0.5" />
            <path d="M50 10 C55 5, 65 8, 65 18 C65 28, 55 35, 50 50" opacity="0.35" />
            <path d="M50 50 C37 57, 22 57, 15 68 C25 65, 40 60, 50 50" opacity="0.5" />
            <path d="M15 68 C10 73, 12 83, 22 85 C32 85, 40 75, 50 50" opacity="0.35" />
            <path d="M50 50 C63 57, 78 57, 85 68 C75 65, 60 60, 50 50" opacity="0.5" />
            <path d="M85 68 C90 73, 88 83, 78 85 C68 85, 60 75, 50 50" opacity="0.35" />
          </g>
          {/* Centro */}
          <circle cx="50" cy="50" r="2.5" fill="#d4a574" opacity="0.3" />
          {/* Círculos concêntricos sutis */}
          <circle cx="50" cy="50" r="20" stroke="#d4a574" strokeWidth="0.3" opacity="0.15" />
          <circle cx="50" cy="50" r="35" stroke="#d4a574" strokeWidth="0.2" opacity="0.1" />
          <circle cx="50" cy="50" r="45" stroke="#8B4513" strokeWidth="0.3" opacity="0.08" />
          {/* 3 pontos nos vértices do triângulo (tríade) */}
          <circle cx="50" cy="10" r="1.5" fill="#d4a574" opacity="0.2" />
          <circle cx="15" cy="68" r="1.5" fill="#d4a574" opacity="0.2" />
          <circle cx="85" cy="68" r="1.5" fill="#d4a574" opacity="0.2" />
        </svg>
      </div>
      {/* Glow radial sutil — terroso */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.02) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}

import * as React from 'react'

export interface TriskleProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  animated?: boolean
  color?: string
}

export const Triskle = React.forwardRef<SVGSVGElement, TriskleProps>(
  ({ size = 64, animated = false, color = 'currentColor', className, style, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{
          ...style,
          animation: animated ? 'mandala-slow 30s linear infinite' : undefined,
        }}
        aria-hidden="true"
        {...props}
      >
        {/* Triskle — três espirais convergindo ao centro */}
        <g stroke={color} strokeWidth="2" fill="none" strokeLinecap="round">
          {/* Espiral 1 — topo (0deg) */}
          <path d="M50 50 C50 35, 60 20, 50 10 C40 20, 35 35, 50 50" opacity="0.9" />
          <path d="M50 10 C55 5, 65 8, 65 18 C65 28, 55 35, 50 50" opacity="0.7" />
          {/* Espiral 2 — esquerda inferior (120deg) */}
          <path d="M50 50 C37 57, 22 57, 15 68 C25 65, 40 60, 50 50" opacity="0.9" />
          <path d="M15 68 C10 73, 12 83, 22 85 C32 85, 40 75, 50 50" opacity="0.7" />
          {/* Espiral 3 — direita inferior (240deg) */}
          <path d="M50 50 C63 57, 78 57, 85 68 C75 65, 60 60, 50 50" opacity="0.9" />
          <path d="M85 68 C90 73, 88 83, 78 85 C68 85, 60 75, 50 50" opacity="0.7" />
        </g>
        {/* Centro — ponto de convergencia */}
        <circle cx="50" cy="50" r="3" fill={color} opacity="0.6" />
        {/* Circulo externo sutil */}
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="0.5" opacity="0.2" />
      </svg>
    )
  }
)

Triskle.displayName = 'Triskle'

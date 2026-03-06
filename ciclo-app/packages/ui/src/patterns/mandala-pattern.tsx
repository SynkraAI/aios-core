import * as React from 'react'

export interface MandalaPatternProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  rings?: number
  petals?: number
  color?: string
  opacity?: number
}

export const MandalaPattern = React.forwardRef<SVGSVGElement, MandalaPatternProps>(
  ({ size = 400, rings = 5, petals = 12, color = '#932E88', opacity = 0.06, className, ...props }, ref) => {
    const cx = 50
    const cy = 50

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
        {...props}
      >
        {/* Circulos concentricos */}
        {Array.from({ length: rings }, (_, i) => {
          const r = ((i + 1) / rings) * 45
          return (
            <circle
              key={`ring-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth="0.3"
              opacity={opacity * (1 - i * 0.12)}
            />
          )
        })}
        {/* Petalas radiantes */}
        {Array.from({ length: petals }, (_, i) => {
          const angle = (i / petals) * 360
          const rad = (angle * Math.PI) / 180
          const x2 = cx + 45 * Math.cos(rad)
          const y2 = cy + 45 * Math.sin(rad)
          return (
            <line
              key={`petal-${i}`}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="0.2"
              opacity={opacity * 0.7}
            />
          )
        })}
        {/* Pontos nas interseções */}
        {Array.from({ length: rings }, (_, ri) =>
          Array.from({ length: petals }, (_, pi) => {
            const r = ((ri + 1) / rings) * 45
            const angle = (pi / petals) * 360
            const rad = (angle * Math.PI) / 180
            const px = cx + r * Math.cos(rad)
            const py = cy + r * Math.sin(rad)
            return (
              <circle
                key={`dot-${ri}-${pi}`}
                cx={px}
                cy={py}
                r="0.4"
                fill={color}
                opacity={opacity * 1.5}
              />
            )
          })
        )}
      </svg>
    )
  }
)

MandalaPattern.displayName = 'MandalaPattern'

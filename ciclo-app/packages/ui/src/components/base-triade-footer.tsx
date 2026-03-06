import type { HTMLAttributes } from 'react'
import { cn } from '../lib/utils'
import { Triskle } from '../patterns/triskle'

interface BaseTriadeFooterProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'minimal'
}

export function BaseTriadeFooter({ variant = 'default', className, ...props }: BaseTriadeFooterProps) {
  return (
    <footer
      className={cn(
        'relative w-full overflow-hidden border-t py-6 text-center',
        'border-base-gold/20 bg-base-dark/5',
        className,
      )}
      {...props}
    >
      <div className="relative flex flex-col items-center gap-2">
        <Triskle size={24} color="#8B4513" className="opacity-40" />
        <p
          className={cn(
            'font-body tracking-wider text-base-dark/50',
            variant === 'default' ? 'text-sm' : 'text-xs',
          )}
        >
          iAi &middot; ECOssistema Base Tríade&trade;
        </p>
      </div>
    </footer>
  )
}

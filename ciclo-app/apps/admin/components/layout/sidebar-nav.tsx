'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@ciclo/ui'
import { NavIcon } from '@/layout/nav-icon'
import type { NavItem } from '@/navigation'

interface SidebarNavProps {
  items: NavItem[]
  onItemClick?: () => void
}

export function SidebarNav({ items, onItemClick }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Navegação do admin">
      {items.map((item) => {
        const isActive =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-base-gold/20 text-base-gold'
                : 'text-base-bg/70 hover:bg-base-bg/10 hover:text-base-bg',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <NavIcon name={item.icon} className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

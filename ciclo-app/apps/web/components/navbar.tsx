'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Triskle } from '@ciclo/ui'

const NAV_LINKS = [
  { href: '#inicio', label: 'Início' },
  { href: '/eventos', label: 'Eventos' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#facilitadoras', label: 'Facilitadoras' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contato', label: 'Contato' },
] as const

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#d4a574]/20"
      style={{ backgroundColor: 'rgba(254, 249, 240, 0.95)', backdropFilter: 'blur(12px)' }}
    >
      {/* Desktop + Mobile bar */}
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16" aria-label="Navegação principal">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Triskle size={28} color="#8B4513" />
          <span className="font-heading text-base font-semibold" style={{ color: '#2d1810' }}>
            Ciclo das Estações
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-[#8B4513]"
              style={{ color: '#6b5744' }}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <Link
              href="/minha-conta"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: '#D2691E' }}
            >
              Minha Conta
            </Link>
          ) : (
            <Link
              href="/eventos"
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: '#D2691E' }}
            >
              Inscreva-se
            </Link>
          )}
        </div>

        {/* Hamburger button */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d1810" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d1810" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="border-t border-[#e8ddd0] bg-[#fef9f0] px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-[#d4a574]/10"
                style={{ color: '#2d1810' }}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            {session ? (
              <Link
                href="/minha-conta"
                className="block w-full rounded-lg py-3 text-center text-base font-medium text-white"
                style={{ backgroundColor: '#D2691E' }}
                onClick={() => setIsOpen(false)}
              >
                Minha Conta
              </Link>
            ) : (
              <Link
                href="/eventos"
                className="block w-full rounded-lg py-3 text-center text-base font-medium text-white"
                style={{ backgroundColor: '#D2691E' }}
                onClick={() => setIsOpen(false)}
              >
                Inscreva-se
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

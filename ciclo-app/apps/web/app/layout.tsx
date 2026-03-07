import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { BaseTriadeFooter, BaseTriadeWatermark } from '@ciclo/ui'
import { SessionProvider } from './providers/session-provider'
import { Navbar } from '../components/navbar'
import { SwRegister } from '../components/pwa/sw-register'
import { InstallBanner } from '../components/pwa/install-banner'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodaseestacoes.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Ciclo das Estações | Base Tríade',
    template: '%s | Ciclo das Estações',
  },
  description:
    'Programa de autocuidado cíclico voltado para terapeutas holísticos. Eventos sazonais, comunidade e jornada de transformação.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ciclo',
  },
  icons: {
    apple: '/icons/apple-touch-icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#8B4513',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`${playfairDisplay.variable} ${inter.variable}`}
      data-season="primavera"
    >
      <body className="flex min-h-screen flex-col">
        <SessionProvider>
          <SwRegister />
          <Navbar />
          <BaseTriadeWatermark />
          <main className="relative z-10 flex-1">{children}</main>
          <BaseTriadeFooter className="relative z-10" />
          <InstallBanner />
        </SessionProvider>
      </body>
    </html>
  )
}

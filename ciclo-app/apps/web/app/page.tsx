import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@ciclo/database'
import { EventCard, SacredDivider, Triskle } from '@ciclo/ui'
import { getSiteContents } from '../lib/site-content'
import { LeadCaptureForm } from '../components/lead-capture-form'
import {
  HERO_CONTENT,
  SOBRE_CONTENT,
  PROPOSITOS,
  PROGRAMACAO,
  FACILITADORAS,
  FAQ_ITEMS,
  CANCELAMENTO,
  INFO_PRATICAS,
} from '../lib/home-content'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ciclodaseestacoes.com.br'

export const metadata: Metadata = {
  title: 'Ciclo das Estações — Jornadas de Autoconhecimento | Base Tríade',
  description:
    'Programa de autocuidado cíclico com Medicina Tradicional Chinesa, Ayurveda e Yoga. Eventos sazonais presenciais em Barra Velha, SC.',
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'Ciclo das Estações — Jornadas de Autoconhecimento',
    description:
      'Programa de autocuidado cíclico com MTC, Ayurveda e Yoga. Eventos sazonais em Barra Velha, SC.',
    type: 'website',
    url: BASE_URL,
    images: [{ url: `${BASE_URL}/og-default.svg`, width: 1200, height: 630, alt: 'Ciclo das Estações' }],
  },
}

const SEASONS_MANDALA = [
  { slug: 'primavera', name: 'Primavera', element: 'Madeira', organ: 'Fígado', emoji: '\uD83C\uDF31', cssClass: 'primavera' },
  { slug: 'verao', name: 'Verão', element: 'Fogo', organ: 'Coração', emoji: '\u2600\uFE0F', cssClass: 'verao' },
  { slug: 'outono', name: 'Outono', element: 'Metal', organ: 'Pulmão', emoji: '\uD83C\uDF42', cssClass: 'outono' },
  { slug: 'inverno', name: 'Inverno', element: 'Água', organ: 'Rins', emoji: '\u2744\uFE0F', cssClass: 'inverno' },
] as const

const ELEMENT_MAP: Record<string, string> = {
  Wood: 'Madeira', Fire: 'Fogo', Earth: 'Terra', Metal: 'Metal', Water: 'Água',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

function getEventStatus(event: { isSoldOut: boolean; startDate: Date }): 'disponivel' | 'esgotado' | 'em-breve' {
  if (event.isSoldOut) return 'esgotado'
  const diffDays = (event.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (diffDays > 30) return 'em-breve'
  return 'disponivel'
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-base-gold' : 'text-base-cream'} aria-hidden="true">{'\u2605'}</span>
  ))
}

export default async function HomePage() {
  const [events, testimonials, siteContents] = await Promise.all([
    prisma.event.findMany({
      where: { isPublished: true, isDeleted: false, startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 4,
      include: { ticketTypes: { orderBy: { regularPrice: 'asc' }, take: 1 } },
    }),
    prisma.testimonial.findMany({
      where: { isApproved: true, isFeatured: true },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    getSiteContents(['hero_tagline', 'about_program']),
  ])

  const heroTagline = (siteContents.get('hero_tagline') as string | null) ?? HERO_CONTENT.tagline
  const aboutProgram = (siteContents.get('about_program') as string | null) ?? null

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Base Tríade',
    url: BASE_URL,
    logo: `${BASE_URL}/og-default.svg`,
    sameAs: ['https://instagram.com/podprana', 'https://instagram.com/koch.milenar'],
    contactPoint: { '@type': 'ContactPoint', email: 'contato@basetriade.com', contactType: 'customer service', availableLanguage: 'Portuguese' },
  }

  return (
    <div className="flex flex-col" id="inicio">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      {/* ===== HERO — Compacto ===== */}
      <section className="flex flex-col items-center bg-background px-4 pb-6 pt-12 text-center md:pb-10 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8B4513' }}>
            {HERO_CONTENT.locationBadge}
          </p>
          <h1 className="mt-3 font-heading text-[28px] font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl" style={{ color: '#2d1810' }}>
            {HERO_CONTENT.titulo}
          </h1>
          <p className="mt-3 text-base leading-relaxed sm:text-lg" style={{ color: '#6b5744' }}>
            {heroTagline}
          </p>
          <p className="mt-1 text-[13px] sm:text-sm" style={{ color: 'rgba(139, 69, 19, 0.7)' }}>
            {HERO_CONTENT.subtitulo}
          </p>
        </div>

        {/* Mandala das 4 Estacoes */}
        <nav className="relative z-10 mt-8 w-full" aria-label="Mandala de navegação das 4 Estações">
          <h2 className="sr-only">Mandala de navegação das 4 Estações</h2>
          <div className="seasons-mandala">
            {SEASONS_MANDALA.map((season) => (
              <Link
                key={season.slug}
                href={`/eventos?season=${season.slug}`}
                className={`season-card ${season.cssClass}`}
                aria-label={`Estação ${season.name} — Elemento ${season.element}, Órgão ${season.organ}`}
              >
                <span className="season-emoji" aria-hidden="true">{season.emoji}</span>
                <span className="season-name mt-2 font-heading font-semibold text-foreground">{season.name}</span>
                <span className="season-info mt-1 text-muted-foreground">{season.element} / {season.organ}</span>
              </Link>
            ))}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
              <div style={{ animation: 'watermark-rotate 137s linear infinite' }}>
                <Triskle size={36} color="#8B4513" className="opacity-50 md:hidden" />
                <Triskle size={56} color="#8B4513" className="hidden opacity-60 md:block" />
              </div>
            </div>
          </div>
        </nav>

        {/* CTAs */}
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a
            href="#eventos"
            className="inline-flex w-full items-center justify-center rounded-lg px-8 py-3.5 text-base font-medium text-white shadow-sm transition-all hover:brightness-90 sm:w-auto"
            style={{ backgroundColor: '#D2691E' }}
          >
            Conhecer Eventos
          </a>
          <a
            href="#interesse"
            className="inline-flex w-full items-center justify-center rounded-lg border px-8 py-3.5 text-base font-medium text-foreground transition-all hover:bg-[#d4a574]/10 sm:w-auto"
            style={{ borderColor: '#d4a574' }}
          >
            Receber Chamado
          </a>
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== SOBRE O PROGRAMA ===== */}
      <section id="sobre" className="section-padding bg-background">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8B4513' }}>
            {SOBRE_CONTENT.missao}
          </p>
          <h2 className="mt-3 font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            {SOBRE_CONTENT.titulo}
          </h2>
          {aboutProgram ? (
            <p className="mt-6 text-sm leading-relaxed sm:text-base" style={{ color: '#6b5744', maxWidth: '640px', margin: '1.5rem auto 0' }}>
              {aboutProgram}
            </p>
          ) : (
            SOBRE_CONTENT.paragrafos.map((p, i) => (
              <p key={i} className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: '#6b5744', maxWidth: '640px', margin: i === 0 ? '1.5rem auto 0' : '1rem auto 0' }}>
                {p}
              </p>
            ))
          )}
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== PROPOSITOS DA VIVENCIA ===== */}
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#8B4513' }}>
            Propósitos da Vivência
          </h2>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            O que cada jornada desperta em você
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROPOSITOS.map((p) => (
              <div
                key={p.titulo}
                className="flex items-start gap-3 rounded-lg border bg-white p-3 sm:p-4"
                style={{ borderColor: '#e8ddd0' }}
              >
                <span className="shrink-0 text-2xl" aria-hidden="true">{p.emoji}</span>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#2d1810' }}>{p.titulo}</h3>
                  <p className="mt-1 text-xs leading-relaxed sm:text-[13px]" style={{ color: '#6b5744' }}>{p.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== PROGRAMACAO TIPICA ===== */}
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#8B4513' }}>
            Exemplo de uma jornada
          </p>
          <h2 className="mt-2 font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            Programação Típica
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Baseada na Jornada Renascença — Equinócio de Primavera
          </p>

          <div className="mt-8 space-y-0">
            {PROGRAMACAO.map((item, i) => (
              <div
                key={item.horario}
                className="relative pb-6 pl-6 sm:pl-8"
                style={{
                  borderLeft: i < PROGRAMACAO.length - 1 ? '2px solid #d4a574' : '2px solid transparent',
                }}
              >
                {/* Dot */}
                <div
                  className="absolute left-[-5px] top-[2px] h-2 w-2 rounded-full"
                  style={{ backgroundColor: '#8B4513' }}
                />
                <p className="text-[13px] font-semibold" style={{ color: '#8B4513' }}>{item.horario}</p>
                <p className="text-sm font-semibold" style={{ color: '#2d1810' }}>{item.titulo}</p>
                <p className="mt-0.5 text-xs" style={{ color: '#6b5744' }}>{item.descricao}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] italic" style={{ color: '#6b5744' }}>
            * Programação varia conforme a estação e o tema da jornada
          </p>
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== PROXIMOS EVENTOS ===== */}
      <section id="eventos" className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#8B4513' }}>
            Próximos Eventos
          </h2>
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Jornadas sazonais para reconexão e transformação
          </p>

          {events.length > 0 ? (
            <>
              <div className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const lowestPrice = event.ticketTypes[0]?.earlyBirdPrice ?? event.ticketTypes[0]?.regularPrice
                  return (
                    <Link key={event.id} href={`/eventos/${event.slug}`}>
                      <EventCard
                        title={event.name}
                        date={formatDate(event.startDate)}
                        element={event.elementMTC ? ELEMENT_MAP[event.elementMTC] ?? event.elementMTC : undefined}
                        status={getEventStatus(event)}
                        priceFrom={lowestPrice ? lowestPrice / 100 : undefined}
                      />
                    </Link>
                  )
                })}
              </div>
              <div className="mt-6 text-center">
                <Link href="/eventos" className="inline-flex items-center gap-1 text-sm font-medium text-[#8B4513] underline-offset-4 hover:text-foreground hover:underline">
                  Ver Todos os Eventos
                </Link>
              </div>
            </>
          ) : (
            <div className="mx-auto mt-8 max-w-sm rounded-lg border bg-white p-6 text-center" style={{ borderColor: '#e8ddd0' }}>
              <p className="text-sm text-muted-foreground">Novos eventos em breve!</p>
              <a href="#interesse" className="mt-3 inline-block text-sm font-medium text-[#8B4513] underline-offset-4 hover:underline">
                Receba o chamado quando abrirem
              </a>
            </div>
          )}
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== FACILITADORAS ===== */}
      <section id="facilitadoras" className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#8B4513' }}>
            Facilitadoras e Terapeutas
          </h2>
          <p className="mt-2 text-center text-[13px] text-muted-foreground">
            Profissionais que conduzem as vivências
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FACILITADORAS.map((f) => (
              <div
                key={f.nome}
                className="flex items-start gap-3 rounded-lg border bg-white p-3 sm:flex-col sm:items-center sm:p-4 sm:text-center"
                style={{ borderColor: '#e8ddd0' }}
              >
                {/* Avatar iniciais */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold sm:h-16 sm:w-16 sm:text-base"
                  style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)', color: '#8B4513' }}
                >
                  {f.iniciais}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold" style={{ color: '#2d1810' }}>{f.nome}</h3>
                  <p className="text-xs font-medium" style={{ color: '#8B4513' }}>{f.papel}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: '#6b5744' }}>
                    <span className="line-clamp-3 sm:line-clamp-none">{f.bio}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== DEPOIMENTOS ===== */}
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#8B4513' }}>
            Depoimentos
          </h2>

          {testimonials.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card-seasonal p-4">
                  <div className="flex items-center gap-1" aria-label={`${testimonial.rating} de 5 estrelas`}>
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="mt-3 text-sm italic leading-relaxed text-foreground">
                    <span className="text-[#d4a574]" aria-hidden="true">&ldquo;</span>
                    {testimonial.text}
                    <span className="text-[#d4a574]" aria-hidden="true">&rdquo;</span>
                  </p>
                  <p className="mt-4 text-sm font-medium text-[#8B4513]">
                    {testimonial.user.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-muted-foreground text-sm">
              Depoimentos em breve — participe de um evento!
            </p>
          )}
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== FAQ ===== */}
      <section id="faq" className="section-padding bg-background">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            Perguntas Frequentes
          </h2>
          <div className="mt-8 space-y-2">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.pergunta}
                className="group rounded-lg border bg-white"
                style={{ borderColor: '#e8ddd0' }}
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold" style={{ color: '#2d1810' }}>
                  {item.pergunta}
                  <svg
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                    style={{ color: '#d4a574' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="border-t px-4 py-3 text-[13px] leading-relaxed" style={{ borderColor: '#e8ddd0', color: '#6b5744' }}>
                  {item.resposta}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== POLITICA DE CANCELAMENTO ===== */}
      <section className="section-padding bg-background">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            Política de Cancelamento
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#fef9f0' }}>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8B4513' }}>Prazo</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8B4513' }}>Política</th>
                </tr>
              </thead>
              <tbody>
                {CANCELAMENTO.map((rule) => (
                  <tr key={rule.prazo} className="border-t" style={{ borderColor: '#e8ddd0' }}>
                    <td className="px-4 py-3 text-[13px] font-medium" style={{ color: '#2d1810' }}>{rule.prazo}</td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: '#6b5744' }}>{rule.politica}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs" style={{ color: '#6b5744' }}>
            Transferência de inscrição sempre permitida sem custo adicional
          </p>
        </div>
      </section>

      <SacredDivider variant="line" />

      {/* ===== LEAD CAPTURE ===== */}
      <section id="interesse" className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            Receba o Chamado das Estações
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Receba novidades sobre os próximos eventos e jornadas
          </p>
          <div className="mt-8">
            <Suspense fallback={<div className="mx-auto h-64 max-w-md animate-pulse rounded-xl border border-[#e8ddd0] bg-white" />}>
              <LeadCaptureForm />
            </Suspense>
          </div>
        </div>
      </section>

      <SacredDivider variant="sacred" />

      {/* ===== INFORMACOES PRATICAS ===== */}
      <section id="contato" className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-heading text-[22px] font-bold sm:text-3xl" style={{ color: '#2d1810' }}>
            Informações Práticas
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {INFO_PRATICAS.map((info) => (
              <div
                key={info.titulo}
                className="rounded-lg border bg-white p-4"
                style={{ borderColor: '#e8ddd0' }}
              >
                <h3 className="text-sm font-semibold" style={{ color: '#2d1810' }}>{info.titulo}</h3>
                <ul className="mt-2 space-y-1">
                  {info.linhas.map((linha) => (
                    <li key={linha} className="text-[13px]" style={{ color: '#6b5744' }}>{linha}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * Conteudo rico da home page — constantes tipadas.
 * Fonte: docs/research/2026-03-07-redesign-mobile-conteudo.md (Renascenca + basetriade.com)
 * Override: admin pode sobrescrever via getSiteContents()
 */

// === TIPOS ===

export interface Proposito {
  emoji: string
  titulo: string
  descricao: string
}

export interface Facilitadora {
  nome: string
  iniciais: string
  papel: string
  bio: string
}

export interface FAQItem {
  pergunta: string
  resposta: string
}

export interface TimelineItem {
  horario: string
  titulo: string
  descricao: string
}

export interface CancellationRule {
  prazo: string
  politica: string
}

export interface PracticalInfo {
  titulo: string
  linhas: string[]
}

// === HERO ===

export const HERO_CONTENT = {
  locationBadge: 'Base Tríade — Barra Velha, SC',
  titulo: 'Ciclo das Estações',
  tagline: 'Respire. Reconecte. Renasça.',
  subtitulo: 'O primeiro programa de autocuidado cíclico do Brasil',
} as const

// === SOBRE ===

export const SOBRE_CONTENT = {
  missao: 'Resgatar a Harmonia entre Humanidade e Natureza',
  titulo: 'Sobre o Programa',
  paragrafos: [
    'O equinócio da primavera simboliza o renascimento da natureza, o equilíbrio entre luz e sombra, e o florescer de novos ciclos. O Ciclo das Estações é um programa de imersão em práticas integrativas que conectam corpo, mente e natureza através de Yoga, Ayurveda, Ginecologia Natural, Nutrição e Sound Healing.',
    'Voltado para terapeutas holísticos, facilitadores de bem-estar, praticantes de yoga, profissionais de saúde integrativa — e qualquer pessoa interessada em autocuidado cíclico e reconexão com a natureza.',
  ],
} as const

// === PROPOSITOS ===

export const PROPOSITOS: Proposito[] = [
  {
    emoji: '\uD83E\uDDD8',
    titulo: 'Autoconhecimento',
    descricao: 'Reconexão corpo-mente via Yoga, meditação e práticas contemplativas que revelam sua essência.',
  },
  {
    emoji: '\uD83D\uDCAA',
    titulo: 'Força Interna',
    descricao: 'Fortalecimento da autonomia e da capacidade de cuidar de si com sabedoria e coragem.',
  },
  {
    emoji: '\uD83C\uDF3F',
    titulo: 'Integração',
    descricao: 'Saberes ancestrais unidos a práticas contemporâneas para uma visão integral de saúde.',
  },
  {
    emoji: '\uD83C\uDF38',
    titulo: 'Alegria e Florescimento',
    descricao: 'Despertar celebrando o equinócio, honrando os ciclos da natureza e da vida.',
  },
  {
    emoji: '\uD83C\uDF4E',
    titulo: 'Saúde Integral',
    descricao: 'Alimentação ayurvédica como nutrição energética que nutre corpo, mente e espírito.',
  },
  {
    emoji: '\uD83E\uDD1D',
    titulo: 'Rede de Apoio',
    descricao: 'Comunidade entre participantes que se fortalece a cada jornada sazonal.',
  },
]

// === PROGRAMACAO TIPICA ===

export const PROGRAMACAO: TimelineItem[] = [
  { horario: '07:15', titulo: 'Credenciamento', descricao: 'Abertura e acolhimento dos participantes' },
  { horario: '08:00', titulo: 'Acolhimento', descricao: 'Infusão de ervas frescas e círculo de intenção' },
  { horario: '08:30', titulo: 'Yoga Solar', descricao: 'Hatha Vinyasa Yoga para honrar o astro-rei' },
  { horario: '10:00', titulo: 'Brunch Ayurvédico', descricao: 'Experiência sensorial com nutrição ayurvédica' },
  { horario: '11:00', titulo: 'Ayurveda', descricao: 'Rotinas diárias reconhecendo ciclos e ervas medicinais' },
  { horario: '12:30', titulo: 'Almoço Meditativo', descricao: 'Refeição em silêncio — experiência meditativa única' },
  { horario: '15:00', titulo: 'Ginecologia Natural', descricao: 'Roda de conversa sobre saúde e fertilidade' },
  { horario: '17:00', titulo: 'Sound Healing', descricao: 'Imersão sonora com cristais, tambores e cantos xamânicos' },
  { horario: '18:30', titulo: 'Rito de Equinócio', descricao: 'Fogueira, cânticos e liberação de intenções' },
]

// === FACILITADORAS ===

export const FACILITADORAS: Facilitadora[] = [
  {
    nome: 'Lionara Artn',
    iniciais: 'LA',
    papel: 'Yoga',
    bio: 'Formada em Hatha Vinyasa (2020) e Hatha Chakra (2024). Conduz práticas que conectam movimento, respiração e consciência.',
  },
  {
    nome: 'Lia Cristina Corrêa Dias',
    iniciais: 'LC',
    papel: 'Nutrição',
    bio: '19 anos de experiência em nutrição integrativa. Reikiana e especialista em alimentação ayurvédica.',
  },
  {
    nome: 'Juliana Coimbra Zanatta',
    iniciais: 'JZ',
    papel: 'Ayurveda',
    bio: 'Mais de uma década de estudos, incluindo formação na Índia. Especialista em rotinas e ervas medicinais.',
  },
  {
    nome: 'Gabriela Vilela',
    iniciais: 'GV',
    papel: 'Ginecologia Natural',
    bio: 'Enfermeira pós-graduada em saúde da mulher. Facilitadora de rodas de conversa sobre autonomia feminina.',
  },
  {
    nome: 'Cassiano Darela',
    iniciais: 'CD',
    papel: 'Sound Healing',
    bio: 'Terapeuta sonoro com flautas, gongo e instrumentos ancestrais. Cria imersões que restauram o equilíbrio.',
  },
  {
    nome: 'Giorgia Sell',
    iniciais: 'GS',
    papel: 'Surf & Movimento',
    bio: 'Educadora física e coach esportivo. Conduz práticas de movimento conectadas à natureza e ao mar.',
  },
]

// === FAQ ===

export const FAQ_ITEMS: FAQItem[] = [
  {
    pergunta: 'O que está incluído no passaporte?',
    resposta: 'O passaporte inclui alimentação completa (brunch ayurvédico, almoço meditativo e lanches), todas as oficinas e vivências do dia, e material básico para as práticas.',
  },
  {
    pergunta: 'Posso levar crianças ou animais?',
    resposta: 'As jornadas são espaços de imersão voltados para adultos. Para garantir a profundidade das práticas, não é permitida a entrada de crianças ou animais de estimação.',
  },
  {
    pergunta: 'O menu atende restrições alimentares?',
    resposta: 'Sim! Nosso cardápio ayurvédico é naturalmente adaptável. Informe suas restrições alimentares no momento da inscrição para que possamos atendê-lo adequadamente.',
  },
  {
    pergunta: 'As vagas são limitadas?',
    resposta: 'Sim, trabalhamos com grupos reduzidos para garantir qualidade e atenção individual em cada vivência. Recomendamos inscrição antecipada.',
  },
  {
    pergunta: 'O que devo levar?',
    resposta: 'Tapete de yoga (se tiver), manta ou canga, garrafa de água reutilizável, caderno para anotações e roupas confortáveis. Itens básicos também serão disponibilizados.',
  },
  {
    pergunta: 'Há estacionamento no local?',
    resposta: 'Sim, a Base Tríade oferece estacionamento gratuito e seguro para todos os participantes.',
  },
]

// === POLITICA DE CANCELAMENTO ===

export const CANCELAMENTO: CancellationRule[] = [
  { prazo: 'Mais de 15 dias', politica: '80% de reembolso' },
  { prazo: '7 a 14 dias', politica: '50% de reembolso' },
  { prazo: 'Menos de 7 dias', politica: 'Sem reembolso, pode transferir' },
  { prazo: 'No-show', politica: 'Sem reembolso' },
  { prazo: 'Intempérie', politica: 'Crédito integral ou 80% reembolso' },
]

// === INFORMACOES PRATICAS ===

export const INFO_PRATICAS: PracticalInfo[] = [
  {
    titulo: 'Local',
    linhas: ['Base Tríade — Barra Velha, SC', 'Estacionamento gratuito e seguro'],
  },
  {
    titulo: 'Contato',
    linhas: ['contato@basetriade.com', 'WhatsApp: (47) 99241-4009'],
  },
  {
    titulo: 'Facilitadoras Principais',
    linhas: ['@podprana', '@koch.milenar'],
  },
]

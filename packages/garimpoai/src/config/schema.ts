import { z } from 'zod';
import { Modalidade } from '../types/pncp';

const UF_SIGLAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
  'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

export const pncpConfigSchema = z.object({
  ufs: z.array(z.enum(UF_SIGLAS)).default([]),
  modalidades: z.array(z.nativeEnum(Modalidade)).default([
    Modalidade.PregaoEletronico,
    Modalidade.DispensaDeLicitacao,
    Modalidade.ConcorrenciaEletronica,
  ]),
  keywords: z.array(z.string()).default([]),
  valorMinimo: z.number().optional(),
  valorMaximo: z.number().optional(),
});

export const telegramConfigSchema = z.object({
  enabled: z.boolean().default(false),
  botToken: z.string().default(''),
  chatId: z.string().default(''),
});

export const emailConfigSchema = z.object({
  enabled: z.boolean().default(false),
  smtpHost: z.string().default(''),
  smtpPort: z.number().default(587),
  smtpUser: z.string().default(''),
  smtpPass: z.string().default(''),
  from: z.string().default(''),
  to: z.string().default(''),
});

export const iaConfigSchema = z.object({
  provider: z.literal('anthropic').default('anthropic'),
  apiKey: z.string().default(''),
  autoAnalyze: z.boolean().default(true),
  maxPerDay: z.number().default(50),
  chatModel: z.string().default('claude-haiku-4-5-20251001'),
  analysisModel: z.string().default('claude-sonnet-4-5-20250929'),
});

export const schedulerConfigSchema = z.object({
  intervalMinutes: z.number().min(5).max(1440).default(30),
});

export const configSchema = z.object({
  pncp: pncpConfigSchema.default({}),
  alertas: z.object({
    telegram: telegramConfigSchema.default({}),
    email: emailConfigSchema.default({}),
  }).default({}),
  ia: iaConfigSchema.default({}),
  scheduler: schedulerConfigSchema.default({}),
  dataDir: z.string().default(''),
});

export type ValidatedConfig = z.infer<typeof configSchema>;

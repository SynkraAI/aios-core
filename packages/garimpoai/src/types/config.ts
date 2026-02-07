// Configuration types for GarimpoAI

import { Modalidade } from './pncp';

export interface PncpConfig {
  ufs: string[];
  modalidades: Modalidade[];
  keywords: string[];
  valorMinimo?: number;
  valorMaximo?: number;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface EmailConfig {
  enabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  to: string;
}

export interface AlertasConfig {
  telegram: TelegramConfig;
  email: EmailConfig;
}

export interface IaConfig {
  provider: 'anthropic';
  apiKey: string;
  autoAnalyze: boolean;
  maxPerDay: number;
  chatModel: string;
  analysisModel: string;
}

export interface SchedulerConfig {
  intervalMinutes: number;
}

export interface GarimpoAIConfig {
  pncp: PncpConfig;
  alertas: AlertasConfig;
  ia: IaConfig;
  scheduler: SchedulerConfig;
  dataDir: string;
}

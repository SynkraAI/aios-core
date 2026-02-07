import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { configSchema, ValidatedConfig } from './schema';
import { GarimpoAIConfig } from '../types/config';

const CONFIG_FILENAME = 'garimpoai.yaml';
const DEFAULT_DATA_DIR = path.join(process.env.HOME || '~', '.garimpoai');

/** Search paths for config file (in order of priority) */
function getConfigSearchPaths(): string[] {
  return [
    path.join(process.cwd(), CONFIG_FILENAME),
    path.join(DEFAULT_DATA_DIR, CONFIG_FILENAME),
    path.join(process.env.HOME || '~', `.${CONFIG_FILENAME}`),
  ];
}

/** Find and load config file */
export function findConfigFile(): string | null {
  for (const configPath of getConfigSearchPaths()) {
    if (fs.existsSync(configPath)) {
      return configPath;
    }
  }
  return null;
}

/** Load and validate config from YAML file */
export function loadConfig(configPath?: string): GarimpoAIConfig {
  const filePath = configPath || findConfigFile();

  let rawConfig: Record<string, unknown> = {};

  if (filePath && fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    rawConfig = (yaml.load(content) as Record<string, unknown>) || {};
  }

  // Apply environment variable overrides
  if (process.env.ANTHROPIC_API_KEY && !rawConfig.ia) {
    rawConfig.ia = { apiKey: process.env.ANTHROPIC_API_KEY };
  } else if (process.env.ANTHROPIC_API_KEY) {
    (rawConfig.ia as Record<string, unknown>).apiKey = process.env.ANTHROPIC_API_KEY;
  }

  if (process.env.GARIMPOAI_DATA_DIR) {
    rawConfig.dataDir = process.env.GARIMPOAI_DATA_DIR;
  }

  // Validate with Zod
  const validated = configSchema.parse(rawConfig);

  // Set default data dir
  if (!validated.dataDir) {
    validated.dataDir = DEFAULT_DATA_DIR;
  }

  return validated as GarimpoAIConfig;
}

/** Generate default config YAML content */
export function generateDefaultConfig(): string {
  return `# GarimpoAI - Configuracao
# Edite este arquivo com seus filtros e credenciais

pncp:
  # UFs para monitorar (vazio = todas)
  ufs: []
  # Modalidades: 6=Pregao Eletronico, 8=Dispensa, 4=Concorrencia Eletronica
  modalidades: [6, 8, 4]
  # Palavras-chave para filtrar licitacoes
  keywords:
    - "software"
    - "tecnologia da informacao"
    - "sistema de gestao"
  # Faixa de valor (opcional)
  # valorMinimo: 10000
  # valorMaximo: 500000

alertas:
  telegram:
    enabled: false
    botToken: ""
    chatId: ""
  email:
    enabled: false
    smtpHost: ""
    smtpPort: 587
    smtpUser: ""
    smtpPass: ""
    from: ""
    to: ""

ia:
  provider: "anthropic"
  apiKey: "" # Ou use env var ANTHROPIC_API_KEY
  autoAnalyze: true
  maxPerDay: 50
  chatModel: "claude-haiku-4-5-20251001"
  analysisModel: "claude-sonnet-4-5-20250929"

scheduler:
  intervalMinutes: 30
`;
}

/** Save config to file */
export function saveConfig(config: ValidatedConfig, configPath?: string): string {
  const filePath = configPath || path.join(DEFAULT_DATA_DIR, CONFIG_FILENAME);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = yaml.dump(config, { indent: 2, lineWidth: 120 });
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

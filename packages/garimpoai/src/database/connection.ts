import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let currentDataDir: string | null = null;

/** Get or create database connection */
export function getDb(dataDir?: string): ReturnType<typeof drizzle<typeof schema>> {
  const dir = dataDir || path.join(process.env.HOME || '~', '.garimpoai');

  // Return existing connection if same dataDir
  if (db && currentDataDir === dir) return db;

  // Close existing connection if dataDir changed
  if (db) closeDb();

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const dbPath = path.join(dir, 'garimpoai.db');
  const sqlite = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL');
  // Enable foreign keys
  sqlite.pragma('foreign_keys = ON');

  db = drizzle(sqlite, { schema });
  currentDataDir = dir;
  return db;
}

/** Close database connection */
export function closeDb(): void {
  if (db) {
    try {
      const sqlite = (db as unknown as { session: { client: Database.Database } }).session.client;
      sqlite.close();
    } catch {
      // Already closed
    }
  }
  db = null;
  currentDataDir = null;
}

/** Initialize database with tables (run migrations) */
export function initializeDb(dataDir?: string): void {
  const database = getDb(dataDir);

  // Create tables using raw SQL (since we may not have drizzle-kit in prod)
  const sqlite = (database as unknown as { session: { client: Database.Database } }).session.client;

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS licitacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_controle_pncp TEXT NOT NULL UNIQUE,
      objeto_compra TEXT NOT NULL,
      valor_total_estimado REAL,
      valor_total_homologado REAL,
      modalidade_id INTEGER NOT NULL,
      modalidade_nome TEXT NOT NULL,
      modo_disputa_id INTEGER,
      modo_disputa_nome TEXT,
      situacao_compra_id INTEGER,
      situacao_compra_nome TEXT,
      ano_compra INTEGER NOT NULL,
      sequencial_compra INTEGER NOT NULL,
      numero_compra TEXT,
      processo TEXT,
      srp INTEGER DEFAULT 0,
      data_publicacao_pncp TEXT,
      data_abertura_proposta TEXT,
      data_encerramento_proposta TEXT,
      data_inclusao TEXT,
      data_atualizacao TEXT,
      data_atualizacao_global TEXT,
      orgao_cnpj TEXT NOT NULL,
      orgao_razao_social TEXT,
      orgao_poder_id TEXT,
      orgao_esfera_id TEXT,
      uf_sigla TEXT,
      uf_nome TEXT,
      municipio_nome TEXT,
      codigo_ibge TEXT,
      nome_unidade TEXT,
      amparo_legal_nome TEXT,
      amparo_legal_descricao TEXT,
      link_sistema_origem TEXT,
      link_processo_eletronico TEXT,
      informacao_complementar TEXT,
      matched INTEGER DEFAULT 0,
      match_score REAL DEFAULT 0,
      analisado INTEGER DEFAULT 0,
      notificado INTEGER DEFAULT 0,
      raw_json TEXT,
      criado_em TEXT DEFAULT (datetime('now')),
      atualizado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_uf_sigla ON licitacoes(uf_sigla);
    CREATE INDEX IF NOT EXISTS idx_modalidade ON licitacoes(modalidade_id);
    CREATE INDEX IF NOT EXISTS idx_data_publicacao ON licitacoes(data_publicacao_pncp);
    CREATE INDEX IF NOT EXISTS idx_data_abertura ON licitacoes(data_abertura_proposta);
    CREATE INDEX IF NOT EXISTS idx_matched ON licitacoes(matched);
    CREATE INDEX IF NOT EXISTS idx_valor ON licitacoes(valor_total_estimado);
    CREATE INDEX IF NOT EXISTS idx_orgao_cnpj ON licitacoes(orgao_cnpj);
    CREATE INDEX IF NOT EXISTS idx_situacao ON licitacoes(situacao_compra_id);

    CREATE VIRTUAL TABLE IF NOT EXISTS licitacoes_fts USING fts5(
      objeto_compra,
      orgao_razao_social,
      municipio_nome,
      content='licitacoes',
      content_rowid='id'
    );

    -- Triggers to keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS licitacoes_ai AFTER INSERT ON licitacoes BEGIN
      INSERT INTO licitacoes_fts(rowid, objeto_compra, orgao_razao_social, municipio_nome)
      VALUES (new.id, new.objeto_compra, new.orgao_razao_social, new.municipio_nome);
    END;

    CREATE TRIGGER IF NOT EXISTS licitacoes_ad AFTER DELETE ON licitacoes BEGIN
      INSERT INTO licitacoes_fts(licitacoes_fts, rowid, objeto_compra, orgao_razao_social, municipio_nome)
      VALUES ('delete', old.id, old.objeto_compra, old.orgao_razao_social, old.municipio_nome);
    END;

    CREATE TRIGGER IF NOT EXISTS licitacoes_au AFTER UPDATE ON licitacoes BEGIN
      INSERT INTO licitacoes_fts(licitacoes_fts, rowid, objeto_compra, orgao_razao_social, municipio_nome)
      VALUES ('delete', old.id, old.objeto_compra, old.orgao_razao_social, old.municipio_nome);
      INSERT INTO licitacoes_fts(rowid, objeto_compra, orgao_razao_social, municipio_nome)
      VALUES (new.id, new.objeto_compra, new.orgao_razao_social, new.municipio_nome);
    END;

    CREATE TABLE IF NOT EXISTS analises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      licitacao_id TEXT NOT NULL REFERENCES licitacoes(numero_controle_pncp),
      resumo TEXT NOT NULL,
      o_que_e TEXT,
      documentos_necessarios TEXT,
      prazo_proposta TEXT,
      valor_estimado TEXT,
      dificuldade TEXT,
      justificativa_dificuldade TEXT,
      requisitos_habilitacao TEXT,
      dica_iniciante TEXT,
      proximo_passo TEXT,
      modelo TEXT NOT NULL,
      tokens_usados INTEGER DEFAULT 0,
      custo_estimado REAL DEFAULT 0,
      raw_response TEXT,
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      keywords TEXT NOT NULL,
      ufs TEXT,
      modalidades TEXT,
      valor_minimo REAL,
      valor_maximo REAL,
      canal TEXT NOT NULL DEFAULT 'telegram',
      ativo INTEGER DEFAULT 1,
      criado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notificacoes_enviadas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alerta_id INTEGER REFERENCES alertas(id),
      licitacao_id TEXT NOT NULL REFERENCES licitacoes(numero_controle_pncp),
      canal TEXT NOT NULL,
      enviado_em TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_notif_alerta_licitacao
      ON notificacoes_enviadas(alerta_id, licitacao_id);

    CREATE TABLE IF NOT EXISTS coletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      modalidade_id INTEGER NOT NULL,
      data_inicial TEXT NOT NULL,
      data_final TEXT NOT NULL,
      total_registros INTEGER DEFAULT 0,
      novos_registros INTEGER DEFAULT 0,
      atualizados INTEGER DEFAULT 0,
      erros INTEGER DEFAULT 0,
      duracao_ms INTEGER DEFAULT 0,
      sucesso INTEGER DEFAULT 1,
      mensagem_erro TEXT,
      iniciado_em TEXT DEFAULT (datetime('now')),
      finalizado_em TEXT
    );

    CREATE TABLE IF NOT EXISTS ia_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      modelo TEXT NOT NULL,
      tokens_input INTEGER DEFAULT 0,
      tokens_output INTEGER DEFAULT 0,
      custo_estimado REAL DEFAULT 0,
      data TEXT NOT NULL,
      criado_em TEXT DEFAULT (datetime('now'))
    );
  `);
}

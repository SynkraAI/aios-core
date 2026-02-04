/**
 * AIOS Memory Layer - SQLite Schema
 *
 * Database schema creation for aios_memories, aios_memory_relations,
 * and aios_session_traces tables with FTS5 and optional vector search.
 */

import Database from 'better-sqlite3';
import { ConnectionInfo } from './connection';

// =============================================================================
// Schema SQL
// =============================================================================

const CREATE_MEMORIES_TABLE = `
CREATE TABLE IF NOT EXISTS aios_memories (
  id TEXT PRIMARY KEY,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('entity', 'daily', 'persistent')),
  entity TEXT,
  content TEXT NOT NULL,
  category TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'archived')),
  source_file TEXT NOT NULL,
  source_session TEXT,
  embedding BLOB,
  created_at TEXT NOT NULL,
  updated_at TEXT
)`;

const CREATE_RELATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS aios_memory_relations (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES aios_memories(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL REFERENCES aios_memories(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('references', 'supersedes', 'relates_to', 'contradicts')),
  confidence REAL DEFAULT 1.0,
  created_at TEXT NOT NULL
)`;

const CREATE_TRACES_TABLE = `
CREATE TABLE IF NOT EXISTS aios_session_traces (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  input_summary TEXT,
  output_summary TEXT,
  tools_called TEXT,
  cost_usd REAL,
  user_feedback INTEGER CHECK (user_feedback IN (-1, 0, 1)),
  source_file TEXT NOT NULL,
  created_at TEXT NOT NULL
)`;

// Indexes for performance
const CREATE_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_memories_type_status ON aios_memories(memory_type, status)',
  'CREATE INDEX IF NOT EXISTS idx_memories_entity ON aios_memories(entity)',
  'CREATE INDEX IF NOT EXISTS idx_memories_priority ON aios_memories(priority)',
  'CREATE INDEX IF NOT EXISTS idx_memories_source ON aios_memories(source_file)',
  'CREATE INDEX IF NOT EXISTS idx_memories_session ON aios_memories(source_session)',
  'CREATE INDEX IF NOT EXISTS idx_relations_source ON aios_memory_relations(source_id)',
  'CREATE INDEX IF NOT EXISTS idx_relations_target ON aios_memory_relations(target_id)',
  'CREATE INDEX IF NOT EXISTS idx_relations_type ON aios_memory_relations(relation_type)',
  'CREATE INDEX IF NOT EXISTS idx_traces_session ON aios_session_traces(session_id)',
  'CREATE INDEX IF NOT EXISTS idx_traces_agent ON aios_session_traces(agent_id)',
  'CREATE INDEX IF NOT EXISTS idx_traces_action ON aios_session_traces(action)'
];

// FTS5 virtual table for full-text search
const CREATE_FTS_TABLE = `
CREATE VIRTUAL TABLE IF NOT EXISTS aios_memories_fts USING fts5(
  content,
  entity,
  content='aios_memories',
  content_rowid='rowid'
)`;

// Triggers to keep FTS in sync
const CREATE_FTS_TRIGGERS = [
  `CREATE TRIGGER IF NOT EXISTS aios_memories_ai AFTER INSERT ON aios_memories BEGIN
    INSERT INTO aios_memories_fts(rowid, content, entity)
    VALUES (NEW.rowid, NEW.content, NEW.entity);
  END`,

  `CREATE TRIGGER IF NOT EXISTS aios_memories_ad AFTER DELETE ON aios_memories BEGIN
    INSERT INTO aios_memories_fts(aios_memories_fts, rowid, content, entity)
    VALUES('delete', OLD.rowid, OLD.content, OLD.entity);
  END`,

  `CREATE TRIGGER IF NOT EXISTS aios_memories_au AFTER UPDATE ON aios_memories BEGIN
    INSERT INTO aios_memories_fts(aios_memories_fts, rowid, content, entity)
    VALUES('delete', OLD.rowid, OLD.content, OLD.entity);
    INSERT INTO aios_memories_fts(rowid, content, entity)
    VALUES (NEW.rowid, NEW.content, NEW.entity);
  END`
];

// Metadata table for tracking index state
const CREATE_METADATA_TABLE = `
CREATE TABLE IF NOT EXISTS aios_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

// Embedding cache table
const CREATE_EMBEDDING_CACHE_TABLE = `
CREATE TABLE IF NOT EXISTS aios_embedding_cache (
  content_hash TEXT PRIMARY KEY,
  embedding BLOB NOT NULL,
  model_version TEXT NOT NULL,
  dimensions INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

const CREATE_EMBEDDING_CACHE_INDEX = `
CREATE INDEX IF NOT EXISTS idx_embedding_cache_model
ON aios_embedding_cache(model_version)
`;

// =============================================================================
// Schema Management
// =============================================================================

/**
 * Create all required tables and indexes.
 */
export function createSchema(conn: ConnectionInfo): void {
  const { db, vectorSearchEnabled, vectorDimensions } = conn;

  // Create tables
  db.exec(CREATE_MEMORIES_TABLE);
  db.exec(CREATE_RELATIONS_TABLE);
  db.exec(CREATE_TRACES_TABLE);
  db.exec(CREATE_METADATA_TABLE);
  db.exec(CREATE_EMBEDDING_CACHE_TABLE);
  db.exec(CREATE_EMBEDDING_CACHE_INDEX);

  // Create indexes
  for (const indexSql of CREATE_INDEXES) {
    db.exec(indexSql);
  }

  // Create FTS5 table and triggers
  db.exec(CREATE_FTS_TABLE);
  for (const triggerSql of CREATE_FTS_TRIGGERS) {
    db.exec(triggerSql);
  }

  // Create vector index if sqlite-vec is available
  if (vectorSearchEnabled) {
    createVectorIndex(db, vectorDimensions);
  }

  // Set initial metadata
  setMetadata(db, 'schema_version', '1.0.0');
  setMetadata(db, 'vector_enabled', vectorSearchEnabled ? 'true' : 'false');
  setMetadata(db, 'vector_dimensions', vectorDimensions.toString());
}

/**
 * Create the vector search index using sqlite-vec.
 */
function createVectorIndex(db: Database.Database, dimensions: number): void {
  try {
    // Create virtual table for vector similarity search
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS aios_memories_vec USING vec0(
        memory_id TEXT PRIMARY KEY,
        embedding FLOAT[${dimensions}]
      )
    `);
  } catch (error) {
    console.warn('Failed to create vector index:', error);
  }
}

/**
 * Check if the schema exists and is valid.
 */
export function isSchemaValid(db: Database.Database): boolean {
  try {
    // Check if main tables exist
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name IN ('aios_memories', 'aios_memory_relations', 'aios_session_traces', 'aios_metadata')
    `).all();

    return tables.length === 4;
  } catch {
    return false;
  }
}

/**
 * Get the schema version.
 */
export function getSchemaVersion(db: Database.Database): string | null {
  try {
    const row = db.prepare(
      'SELECT value FROM aios_metadata WHERE key = ?'
    ).get('schema_version') as { value: string } | undefined;

    return row?.value || null;
  } catch {
    return null;
  }
}

/**
 * Set a metadata value.
 */
export function setMetadata(db: Database.Database, key: string, value: string): void {
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO aios_metadata (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, now);
}

/**
 * Get a metadata value.
 */
export function getMetadata(db: Database.Database, key: string): string | null {
  const row = db.prepare(
    'SELECT value FROM aios_metadata WHERE key = ?'
  ).get(key) as { value: string } | undefined;

  return row?.value || null;
}

/**
 * Drop all tables (for rebuild).
 */
export function dropAllTables(db: Database.Database): void {
  // Disable foreign keys temporarily
  db.pragma('foreign_keys = OFF');

  try {
    // Drop in reverse order of dependencies
    db.exec('DROP TABLE IF EXISTS aios_memories_fts');
    db.exec('DROP TABLE IF EXISTS aios_memories_vec');
    db.exec('DROP TABLE IF EXISTS aios_memory_relations');
    db.exec('DROP TABLE IF EXISTS aios_session_traces');
    db.exec('DROP TABLE IF EXISTS aios_memories');
    db.exec('DROP TABLE IF EXISTS aios_metadata');

    // Drop triggers
    db.exec('DROP TRIGGER IF EXISTS aios_memories_ai');
    db.exec('DROP TRIGGER IF EXISTS aios_memories_ad');
    db.exec('DROP TRIGGER IF EXISTS aios_memories_au');
  } finally {
    // Re-enable foreign keys
    db.pragma('foreign_keys = ON');
  }
}

/**
 * Get table row counts for statistics.
 */
export function getTableCounts(db: Database.Database): {
  memories: number;
  relations: number;
  traces: number;
} {
  const memories = (db.prepare('SELECT COUNT(*) as count FROM aios_memories').get() as { count: number }).count;
  const relations = (db.prepare('SELECT COUNT(*) as count FROM aios_memory_relations').get() as { count: number }).count;
  const traces = (db.prepare('SELECT COUNT(*) as count FROM aios_session_traces').get() as { count: number }).count;

  return { memories, relations, traces };
}

/**
 * Get memory counts by type.
 */
export function getMemoryCountsByType(db: Database.Database): Record<string, number> {
  const rows = db.prepare(`
    SELECT memory_type, COUNT(*) as count
    FROM aios_memories
    GROUP BY memory_type
  `).all() as Array<{ memory_type: string; count: number }>;

  const result: Record<string, number> = {
    entity: 0,
    daily: 0,
    persistent: 0
  };

  for (const row of rows) {
    result[row.memory_type] = row.count;
  }

  return result;
}

/**
 * Get memory counts by status.
 */
export function getMemoryCountsByStatus(db: Database.Database): Record<string, number> {
  const rows = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM aios_memories
    GROUP BY status
  `).all() as Array<{ status: string; count: number }>;

  const result: Record<string, number> = {
    active: 0,
    superseded: 0,
    archived: 0
  };

  for (const row of rows) {
    result[row.status] = row.count;
  }

  return result;
}

/**
 * Shared Memory — SQLite FTS5
 *
 * Persistent, searchable memory for the AIOS ecosystem.
 * Stores user_input / agent_output pairs with full-text search.
 *
 * Database location: /home/ubuntu/.openclaw/memory.sqlite
 */

const { existsSync, mkdirSync } = require('node:fs')
const { dirname } = require('node:path')

const DB_PATH = '/home/ubuntu/.openclaw/memory.sqlite'

let db = null

/**
 * Initialize the SQLite database and FTS5 virtual table.
 * Uses better-sqlite3 for synchronous, reliable operations.
 */
function initDB() {
  if (db) return db

  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  const Database = require('better-sqlite3')
  db = new Database(DB_PATH)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')

  // Create main table for conversation records
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      session_id TEXT,
      agent_id TEXT,
      user_input TEXT,
      agent_output TEXT,
      intent TEXT,
      metadata TEXT
    )
  `)

  // Create FTS5 virtual table for full-text search
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS conversations_fts USING fts5(
      user_input,
      agent_output,
      intent,
      content=conversations,
      content_rowid=id
    )
  `)

  // Triggers to keep FTS index in sync
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS conversations_ai AFTER INSERT ON conversations BEGIN
      INSERT INTO conversations_fts(rowid, user_input, agent_output, intent)
      VALUES (new.id, new.user_input, new.agent_output, new.intent);
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS conversations_ad AFTER DELETE ON conversations BEGIN
      INSERT INTO conversations_fts(conversations_fts, rowid, user_input, agent_output, intent)
      VALUES ('delete', old.id, old.user_input, old.agent_output, old.intent);
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS conversations_au AFTER UPDATE ON conversations BEGIN
      INSERT INTO conversations_fts(conversations_fts, rowid, user_input, agent_output, intent)
      VALUES ('delete', old.id, old.user_input, old.agent_output, old.intent);
      INSERT INTO conversations_fts(rowid, user_input, agent_output, intent)
      VALUES (new.id, new.user_input, new.agent_output, new.intent);
    END
  `)

  // Index on timestamp for recency queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp DESC)
  `)

  return db
}

/**
 * Log a conversation exchange to the database.
 */
function logConversation({ session_id, agent_id, user_input, agent_output, intent, metadata }) {
  const database = initDB()
  const stmt = database.prepare(`
    INSERT INTO conversations (session_id, agent_id, user_input, agent_output, intent, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  const result = stmt.run(
    session_id || null,
    agent_id || null,
    user_input || '',
    agent_output || '',
    intent || null,
    metadata ? JSON.stringify(metadata) : null
  )
  return result.lastInsertRowid
}

/**
 * Query historical context using FTS5 full-text search.
 * Returns the most relevant conversation snippets.
 */
function queryContext(query, limit = 10) {
  const database = initDB()

  // Sanitize query for FTS5 — escape special characters
  const sanitized = query.replace(/['"]/g, '').trim()
  if (!sanitized) return []

  const stmt = database.prepare(`
    SELECT
      c.id,
      c.timestamp,
      c.session_id,
      c.agent_id,
      c.user_input,
      c.agent_output,
      c.intent,
      c.metadata
    FROM conversations_fts fts
    JOIN conversations c ON c.id = fts.rowid
    WHERE conversations_fts MATCH ?
    ORDER BY rank
    LIMIT ?
  `)

  try {
    const rows = stmt.all(sanitized, limit)
    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      session_id: row.session_id,
      agent_id: row.agent_id,
      user_input: row.user_input,
      agent_output: row.agent_output,
      intent: row.intent,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }))
  } catch {
    // FTS5 query syntax error — fall back to LIKE search
    const fallback = database.prepare(`
      SELECT id, timestamp, session_id, agent_id, user_input, agent_output, intent, metadata
      FROM conversations
      WHERE user_input LIKE ? OR agent_output LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `)
    const pattern = `%${sanitized}%`
    const rows = fallback.all(pattern, pattern, limit)
    return rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
    }))
  }
}

/**
 * Get recent conversations (no search, just latest).
 */
function getRecent(limit = 20) {
  const database = initDB()
  const stmt = database.prepare(`
    SELECT id, timestamp, session_id, agent_id, user_input, agent_output, intent, metadata
    FROM conversations
    ORDER BY timestamp DESC
    LIMIT ?
  `)
  return stmt.all(limit).map((row) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }))
}

/**
 * Get conversation count and database stats.
 */
function getStats() {
  const database = initDB()
  const count = database.prepare('SELECT COUNT(*) as total FROM conversations').get()
  const oldest = database.prepare('SELECT MIN(timestamp) as oldest FROM conversations').get()
  const newest = database.prepare('SELECT MAX(timestamp) as newest FROM conversations').get()
  const agents = database
    .prepare('SELECT DISTINCT agent_id FROM conversations WHERE agent_id IS NOT NULL')
    .all()
    .map((r) => r.agent_id)

  return {
    total_conversations: count.total,
    oldest_record: oldest.oldest,
    newest_record: newest.newest,
    agents_seen: agents,
    db_path: DB_PATH,
  }
}

/**
 * Close the database connection.
 */
function closeDB() {
  if (db) {
    db.close()
    db = null
  }
}

module.exports = {
  initDB,
  logConversation,
  queryContext,
  getRecent,
  getStats,
  closeDB,
  DB_PATH,
}

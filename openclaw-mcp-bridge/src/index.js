const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { execFile } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Phase 3: SQLite FTS5 Shared Memory
// ---------------------------------------------------------------------------

const DB_PATH = '/home/ubuntu/.openclaw/memory.sqlite';
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let Database;
try {
  Database = require('better-sqlite3');
} catch {
  // Fallback: try sqlite3 callback API wrapped
  Database = null;
}

let db;

function initDB() {
  if (db) return db;

  if (Database) {
    // better-sqlite3 (synchronous, preferred)
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db._isBetter = true;
  } else {
    // Fallback to sqlite3 callback API
    const sqlite3 = require('sqlite3').verbose();
    db = new sqlite3.Database(DB_PATH);
    db._isBetter = false;
  }

  const schema = `
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      session_id TEXT,
      agent_id TEXT,
      user_input TEXT,
      agent_output TEXT,
      intent TEXT,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      target TEXT,
      type TEXT,
      payload TEXT,
      sender TEXT
    );

    CREATE TABLE IF NOT EXISTS media_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      source_number TEXT,
      media_type TEXT,
      media_url TEXT,
      description TEXT,
      raw_size INTEGER
    );
  `;

  const fts = `
    CREATE VIRTUAL TABLE IF NOT EXISTS conversations_fts USING fts5(
      user_input, agent_output, intent,
      content=conversations, content_rowid=id
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      payload, content=messages, content_rowid=id
    );
  `;

  const triggers = `
    CREATE TRIGGER IF NOT EXISTS conversations_ai AFTER INSERT ON conversations BEGIN
      INSERT INTO conversations_fts(rowid, user_input, agent_output, intent)
      VALUES (new.id, new.user_input, new.agent_output, new.intent);
    END;

    CREATE TRIGGER IF NOT EXISTS messages_ai AFTER INSERT ON messages BEGIN
      INSERT INTO messages_fts(rowid, payload) VALUES (new.id, new.payload);
    END;
  `;

  if (db._isBetter) {
    db.exec(schema);
    db.exec(fts);
    db.exec(triggers);
  } else {
    db.serialize(() => {
      schema.split(';').filter(s => s.trim()).forEach(s => db.run(s + ';'));
      fts.split(';').filter(s => s.trim()).forEach(s => db.run(s + ';'));
      triggers.split(';').filter(s => s.trim()).forEach(s => db.run(s + ';'));
    });
  }

  return db;
}

initDB();

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

function logMessage(target, type, payload, sender = 'AIOS-Master') {
  if (db._isBetter) {
    db.prepare('INSERT INTO messages (target, type, payload, sender) VALUES (?, ?, ?, ?)')
      .run(target, type, payload, sender);
  } else {
    return new Promise(resolve => {
      db.run('INSERT INTO messages (target, type, payload, sender) VALUES (?, ?, ?, ?)',
        [target, type, payload, sender], () => resolve());
    });
  }
}

function logConversation({ session_id, agent_id, user_input, agent_output, intent, metadata }) {
  const meta = metadata ? JSON.stringify(metadata) : null;
  if (db._isBetter) {
    return db.prepare(
      'INSERT INTO conversations (session_id, agent_id, user_input, agent_output, intent, metadata) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(session_id || null, agent_id || null, user_input || '', agent_output || '', intent || null, meta);
  }
  return new Promise(resolve => {
    db.run(
      'INSERT INTO conversations (session_id, agent_id, user_input, agent_output, intent, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [session_id || null, agent_id || null, user_input || '', agent_output || '', intent || null, meta],
      () => resolve()
    );
  });
}

function queryFTS(query, limit) {
  const sanitized = query.replace(/['"]/g, '').trim();
  if (!sanitized) return [];

  if (db._isBetter) {
    try {
      return db.prepare(`
        SELECT c.id, c.timestamp, c.session_id, c.agent_id, c.user_input, c.agent_output, c.intent, c.metadata
        FROM conversations_fts fts
        JOIN conversations c ON c.id = fts.rowid
        WHERE conversations_fts MATCH ?
        ORDER BY rank LIMIT ?
      `).all(sanitized, limit);
    } catch {
      // Fallback to LIKE
      const pattern = `%${sanitized}%`;
      return db.prepare(`
        SELECT * FROM conversations
        WHERE user_input LIKE ? OR agent_output LIKE ?
        ORDER BY timestamp DESC LIMIT ?
      `).all(pattern, pattern, limit);
    }
  }

  // sqlite3 callback API
  return new Promise((resolve) => {
    const sql = `
      SELECT m.* FROM messages_fts
      JOIN messages m ON messages_fts.rowid = m.id
      WHERE messages_fts.payload MATCH ?
      ORDER BY m.timestamp DESC LIMIT ?
    `;
    db.all(sql, [sanitized, limit], (err, rows) => {
      resolve(err ? [] : (rows || []));
    });
  });
}

function logMedia(source_number, media_type, media_url, description, raw_size) {
  if (db._isBetter) {
    db.prepare(
      'INSERT INTO media_log (source_number, media_type, media_url, description, raw_size) VALUES (?, ?, ?, ?, ?)'
    ).run(source_number, media_type, media_url, description, raw_size || 0);
  } else {
    db.run(
      'INSERT INTO media_log (source_number, media_type, media_url, description, raw_size) VALUES (?, ?, ?, ?, ?)',
      [source_number, media_type, media_url, description, raw_size || 0]
    );
  }
}

// ---------------------------------------------------------------------------
// Phase 4: Multimodal helpers
// ---------------------------------------------------------------------------

/**
 * Download media from URL and return as base64.
 * Follows redirects (max 3).
 */
function downloadMedia(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && maxRedirects > 0) {
        return downloadMedia(res.headers.location, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching media`));
      }
      const chunks = [];
      let totalSize = 0;
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
      res.on('data', (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_SIZE) {
          res.destroy();
          reject(new Error('Media exceeds 10MB size limit'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || 'application/octet-stream';
        resolve({ buffer: buf, contentType, size: buf.length });
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Detect media type from content-type header or URL extension.
 */
function detectMediaType(contentType, url) {
  const ct = (contentType || '').toLowerCase();
  if (ct.includes('image/') || /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(url)) return 'image';
  if (ct.includes('audio/') || /\.(mp3|ogg|opus|wav|m4a|aac)(\?|$)/i.test(url)) return 'audio';
  if (ct.includes('video/') || /\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video';
  return 'unknown';
}

/**
 * Describe an image using Claude Vision via the claude CLI.
 * Saves the image temporarily, passes to claude with vision prompt.
 */
async function describeImageWithClaude(buffer, contentType) {
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const tmpPath = `/tmp/openclaw-media-${Date.now()}.${ext}`;
  fs.writeFileSync(tmpPath, buffer);

  try {
    const { stdout } = await execFileAsync('claude', [
      '--dangerously-skip-permissions',
      '-p',
      `Descreva esta imagem de forma estruturada e concisa em português. Inclua: 1) O que é mostrado 2) Texto legível na imagem 3) Contexto relevante. Imagem: ${tmpPath}`,
    ], { timeout: 60000, cwd: '/home/ubuntu/aios-core' });
    return stdout.trim() || 'Imagem recebida mas não foi possível gerar descrição.';
  } catch (err) {
    return `Erro ao analisar imagem: ${err.message}`;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
}

/**
 * Transcribe audio using whisper CLI (if available) or fallback description.
 */
async function transcribeAudio(buffer, contentType) {
  const ext = contentType.includes('ogg') ? 'ogg'
    : contentType.includes('mp3') ? 'mp3'
    : contentType.includes('wav') ? 'wav'
    : 'm4a';
  const tmpPath = `/tmp/openclaw-audio-${Date.now()}.${ext}`;
  fs.writeFileSync(tmpPath, buffer);

  try {
    // Try whisper CLI first
    const { stdout } = await execFileAsync('whisper', [
      tmpPath,
      '--model', 'base',
      '--language', 'pt',
      '--output_format', 'txt',
      '--output_dir', '/tmp',
    ], { timeout: 120000 });

    // Read the transcription output file
    const txtPath = tmpPath.replace(/\.\w+$/, '.txt');
    if (fs.existsSync(txtPath)) {
      const text = fs.readFileSync(txtPath, 'utf-8').trim();
      try { fs.unlinkSync(txtPath); } catch {}
      return text || 'Áudio recebido mas transcrição vazia.';
    }
    return stdout.trim() || 'Áudio recebido mas transcrição vazia.';
  } catch {
    // Whisper not available — return metadata only
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    return `[Áudio recebido: ${sizeMB}MB, formato ${ext}. Whisper não disponível para transcrição automática.]`;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch {}
  }
}

// ---------------------------------------------------------------------------
// MCP Server
// ---------------------------------------------------------------------------

const server = new McpServer(
  { name: 'openclaw-mcp-bridge', version: '2.0.0' },
  { capabilities: { tools: {} } }
);

// --- Tool 1: send_whatsapp_message ---
server.tool(
  'send_whatsapp_message',
  'Send a message via OpenClaw Gateway (WhatsApp/Telegram).',
  {
    target_number: z.string().describe('Phone number in E.164 format (e.g. +5528999301848)'),
    message_type: z.string().describe('Intent: feature_request, bug_report, status_query, or notification'),
    payload: z.string().describe('Message content, max 4096 chars'),
  },
  async ({ target_number, message_type, payload }) => {
    try {
      const cleanTarget = target_number.replace(/[\s\-()]/g, '');
      if (!/^\+\d{10,15}$/.test(cleanTarget)) {
        return { content: [{ type: 'text', text: `Invalid phone format: ${target_number}. Use E.164 (e.g. +5528999301848)` }], isError: true };
      }
      if (!payload || payload.trim().length === 0) {
        return { content: [{ type: 'text', text: 'Payload cannot be empty.' }], isError: true };
      }
      if (payload.length > 4096) {
        return { content: [{ type: 'text', text: `Payload exceeds 4096 char limit (got ${payload.length}).` }], isError: true };
      }

      const formatted = `[${message_type}] ${payload}`;
      const { stdout } = await execFileAsync('sudo', [
        '/usr/bin/openclaw', 'message', 'send',
        '--target', cleanTarget,
        '--message', formatted,
      ], { timeout: 30000 });

      await logMessage(cleanTarget, message_type, payload);

      return { content: [{ type: 'text', text: stdout || 'Message sent successfully.' }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Send failed: ${e.message}` }], isError: true };
    }
  }
);

// --- Tool 2: read_gateway_status ---
server.tool(
  'read_gateway_status',
  'Read OpenClaw Gateway status (channels, sessions, health).',
  {},
  async () => {
    try {
      const { stdout } = await execFileAsync('sudo', ['/usr/bin/openclaw', 'status'], { timeout: 15000 });
      return { content: [{ type: 'text', text: stdout || 'No status output.' }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Status check failed: ${e.message}` }], isError: true };
    }
  }
);

// --- Tool 3 (Phase 3): query_historical_context ---
server.tool(
  'query_historical_context',
  'Search past conversations and messages using full-text search (SQLite FTS5).',
  {
    query: z.string().describe('Search query (FTS5 syntax supported)'),
    limit: z.number().optional().default(10).describe('Max results to return'),
  },
  async ({ query, limit }) => {
    try {
      const results = await queryFTS(query, limit);
      if (!results || results.length === 0) {
        return { content: [{ type: 'text', text: 'No matching records found.' }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(results, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Query failed: ${e.message}` }], isError: true };
    }
  }
);

// --- Tool 4 (Phase 3): log_conversation ---
server.tool(
  'log_conversation',
  'Log a conversation exchange (user input + agent output) to shared memory.',
  {
    user_input: z.string().describe('What the user said/asked'),
    agent_output: z.string().describe('What the agent responded'),
    agent_id: z.string().optional().describe('Agent identifier (e.g. @dev, @qa)'),
    intent: z.string().optional().describe('Classified intent'),
    session_id: z.string().optional().describe('Session identifier'),
  },
  async ({ user_input, agent_output, agent_id, intent, session_id }) => {
    try {
      await logConversation({ session_id, agent_id, user_input, agent_output, intent });
      return { content: [{ type: 'text', text: 'Conversation logged successfully.' }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Logging failed: ${e.message}` }], isError: true };
    }
  }
);

// --- Tool 5 (Phase 4): process_media ---
server.tool(
  'process_media',
  'Process a media file (image/audio) from a URL. Images are described via Claude Vision, audio is transcribed via Whisper.',
  {
    media_url: z.string().describe('URL of the media file to process'),
    source_number: z.string().optional().describe('Phone number that sent the media'),
    context: z.string().optional().describe('Additional context about the media'),
  },
  async ({ media_url, source_number, context }) => {
    try {
      // Download the media
      const { buffer, contentType, size } = await downloadMedia(media_url);
      const mediaType = detectMediaType(contentType, media_url);

      let description;
      if (mediaType === 'image') {
        description = await describeImageWithClaude(buffer, contentType);
      } else if (mediaType === 'audio') {
        description = await transcribeAudio(buffer, contentType);
      } else if (mediaType === 'video') {
        description = `[Vídeo recebido: ${(size / 1024 / 1024).toFixed(2)}MB. Processamento de vídeo não suportado ainda.]`;
      } else {
        description = `[Mídia recebida: tipo ${contentType}, ${(size / 1024 / 1024).toFixed(2)}MB. Tipo não reconhecido.]`;
      }

      // Log to database
      logMedia(source_number || 'unknown', mediaType, media_url, description, size);

      const result = {
        media_type: mediaType,
        content_type: contentType,
        size_bytes: size,
        description,
        source: source_number || null,
        context: context || null,
      };

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Media processing failed: ${e.message}` }], isError: true };
    }
  }
);

// --- Tool 6 (Phase 3): memory_stats ---
server.tool(
  'memory_stats',
  'Get statistics about the shared memory database.',
  {},
  async () => {
    try {
      let stats;
      if (db._isBetter) {
        const convCount = db.prepare('SELECT COUNT(*) as total FROM conversations').get();
        const msgCount = db.prepare('SELECT COUNT(*) as total FROM messages').get();
        const mediaCount = db.prepare('SELECT COUNT(*) as total FROM media_log').get();
        stats = {
          conversations: convCount.total,
          messages: msgCount.total,
          media_files: mediaCount.total,
          db_path: DB_PATH,
        };
      } else {
        stats = await new Promise(resolve => {
          db.get('SELECT COUNT(*) as total FROM messages', [], (_, row) => {
            resolve({ messages: row ? row.total : 0, db_path: DB_PATH });
          });
        });
      }
      return { content: [{ type: 'text', text: JSON.stringify(stats, null, 2) }] };
    } catch (e) {
      return { content: [{ type: 'text', text: `Stats failed: ${e.message}` }], isError: true };
    }
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  await server.connect(new StdioServerTransport());
}

main().catch(console.error);

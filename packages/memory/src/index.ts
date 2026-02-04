/**
 * AIOS Memory Layer
 *
 * Local-first persistent memory system with SQLite + sqlite-vec.
 *
 * @module @aios/memory
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MemoryLayer,
  MemoryLayerConfig,
  Fact,
  FactInput,
  FactFilter,
  DailyEntry,
  DailyNote,
  PersistentMemory,
  SessionTrace,
  SessionTraceInput,
  SearchOptions,
  SearchResult,
  IndexStats
} from './types';
import {
  createConnection,
  closeConnection,
  databaseExists,
  ConnectionInfo
} from './db/connection';
import { createSchema, isSchemaValid } from './db/schema';
import { searchFTS, searchVector, indexEmbedding } from './db/search';
import { rebuildIndex, getIndexStats } from './sync/index-builder';
import {
  ensureDirectoryStructure,
  getMemoryPaths,
  getDailyNotePath,
  getSessionTracePath,
  getCurrentDateString
} from './files/directory';
import {
  addFact as addFactToFile,
  getFacts as getFactsFromFile,
  supersedeFact as supersedeFactInFile
} from './files/facts';
import {
  generateEmbeddingCached,
  generateEmbeddingsCached,
  getEmbeddingCacheStats
} from './embeddings/cached-generator';
import { indexEmbedding as indexVectorEmbedding } from './db/search';

// =============================================================================
// Re-exports
// =============================================================================

export * from './types';
export { getMemoryPaths, ensureDirectoryStructure } from './files/directory';

// Embedding exports
export {
  MODEL_NAME,
  MODEL_DIMENSIONS,
  getEmbeddingPipeline,
  preloadModel,
  isModelLoaded,
  isModelCached,
  unloadModel,
  getModelInfo,
  type ModelLoadProgress,
  type ProgressCallback
} from './embeddings/model-loader';

export {
  generateEmbedding,
  generateEmbeddings,
  cosineSimilarity,
  getEmbeddingDimensions,
  type BatchProgress,
  type BatchProgressCallback
} from './embeddings/generator';

export {
  hashContent,
  getCachedEmbedding,
  cacheEmbedding,
  getCacheStats,
  resetCacheStats,
  clearCache,
  clearOldCache,
  invalidateCacheEntry,
  type CacheStats
} from './embeddings/cache';

export {
  generateEmbeddingCached,
  generateEmbeddingsCached,
  getEmbeddingCacheStats,
  type CachedGeneratorOptions
} from './embeddings/cached-generator';

// =============================================================================
// Memory Layer Implementation
// =============================================================================

class MemoryLayerImpl implements MemoryLayer {
  private conn: ConnectionInfo;
  private basePath: string;
  private config: MemoryLayerConfig;

  constructor(conn: ConnectionInfo, basePath: string, config: MemoryLayerConfig) {
    this.conn = conn;
    this.basePath = basePath;
    this.config = config;
  }

  // ===========================================================================
  // Facts (Layer 1)
  // ===========================================================================

  async addFact(input: FactInput & { skipEmbedding?: boolean }): Promise<Fact> {
    // Add to file (source of truth)
    const fact = await addFactToFile(input, this.basePath);

    // Index in SQLite
    const { db } = this.conn;
    const memoryId = `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

    // Generate embedding if not skipped and vector search is enabled
    let embeddingBlob: Buffer | null = null;
    if (!input.skipEmbedding && this.conn.vectorSearchEnabled) {
      try {
        const embedding = await generateEmbeddingCached(fact.fact, { db });
        embeddingBlob = Buffer.from(new Float32Array(embedding).buffer);

        // Index in vector table
        indexVectorEmbedding(this.conn, memoryId, embedding);
      } catch (error) {
        // Non-fatal: proceed without embedding
        console.warn('Failed to generate embedding for fact:', error);
      }
    }

    db.prepare(`
      INSERT INTO aios_memories (
        id, memory_type, entity, content, category, priority, status,
        source_file, source_session, embedding, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memoryId,
      'entity',
      fact.entity,
      fact.fact,
      fact.category,
      fact.priority,
      fact.status,
      'facts/entities.jsonl',
      fact.source_session || null,
      embeddingBlob,
      fact.created
    );

    return fact;
  }

  async getFacts(filter?: FactFilter): Promise<Fact[]> {
    return getFactsFromFile(filter, this.basePath);
  }

  async supersedeFact(id: string, newFact: string, options?: { skipEmbedding?: boolean }): Promise<Fact> {
    // Supersede in file
    const fact = await supersedeFactInFile(id, newFact, this.basePath);

    // Update index - mark old as superseded, add new
    const { db } = this.conn;

    db.prepare(`
      UPDATE aios_memories SET status = 'superseded', updated_at = ?
      WHERE content LIKE ? AND status = 'active'
    `).run(new Date().toISOString(), `%${id}%`);

    // Add new fact to index
    const memoryId = `mem-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

    // Generate embedding if not skipped and vector search is enabled
    let embeddingBlob: Buffer | null = null;
    if (!options?.skipEmbedding && this.conn.vectorSearchEnabled) {
      try {
        const embedding = await generateEmbeddingCached(fact.fact, { db });
        embeddingBlob = Buffer.from(new Float32Array(embedding).buffer);

        // Index in vector table
        indexVectorEmbedding(this.conn, memoryId, embedding);
      } catch (error) {
        // Non-fatal: proceed without embedding
        console.warn('Failed to generate embedding for superseded fact:', error);
      }
    }

    db.prepare(`
      INSERT INTO aios_memories (
        id, memory_type, entity, content, category, priority, status,
        source_file, source_session, embedding, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      memoryId,
      'entity',
      fact.entity,
      fact.fact,
      fact.category,
      fact.priority,
      fact.status,
      'facts/entities.jsonl',
      fact.source_session || null,
      embeddingBlob,
      fact.created
    );

    return fact;
  }

  // ===========================================================================
  // Daily Notes (Layer 2)
  // ===========================================================================

  async logToDaily(entry: DailyEntry): Promise<void> {
    const dailyPath = getDailyNotePath(this.basePath);
    const date = getCurrentDateString();

    let content = '';

    // Read existing content or create header
    if (fs.existsSync(dailyPath)) {
      content = fs.readFileSync(dailyPath, 'utf-8');
    } else {
      content = `# ${date}\n\n`;
    }

    // Find or create session section
    const sessionHeader = `## Session: ${entry.session_id}`;
    if (!content.includes(sessionHeader)) {
      content += `\n${sessionHeader}\n\n`;
    }

    // Add entry to appropriate section
    const sectionMap: Record<string, string> = {
      context: '### Context',
      decisions: '### Key Decisions',
      learnings: '### Learnings',
      followups: '### Follow-ups'
    };

    const sectionHeader = sectionMap[entry.section];
    if (!content.includes(sectionHeader)) {
      // Find session section and add the subsection
      const sessionIndex = content.indexOf(sessionHeader);
      const nextSessionIndex = content.indexOf('\n## Session:', sessionIndex + 1);
      const insertIndex = nextSessionIndex > -1 ? nextSessionIndex : content.length;

      content = content.slice(0, insertIndex) +
        `\n${sectionHeader}\n` +
        content.slice(insertIndex);
    }

    // Add the content
    const sectionIndex = content.indexOf(sectionHeader);
    const nextSectionIndex = content.indexOf('\n###', sectionIndex + 1);
    const insertIndex = nextSectionIndex > -1 ? nextSectionIndex : content.length;

    let newEntry = '';
    if (entry.section === 'decisions' && entry.priority) {
      newEntry = `- [${entry.priority.toUpperCase()}] ${entry.content}\n`;
    } else if (entry.section === 'followups') {
      newEntry = `- [ ] ${entry.content}\n`;
    } else {
      newEntry = `- ${entry.content}\n`;
    }

    content = content.slice(0, insertIndex) + newEntry + content.slice(insertIndex);

    fs.writeFileSync(dailyPath, content, 'utf-8');
  }

  async getDailyNotes(date: string): Promise<DailyNote | null> {
    const dailyPath = getDailyNotePath(this.basePath, date);

    if (!fs.existsSync(dailyPath)) {
      return null;
    }

    const content = fs.readFileSync(dailyPath, 'utf-8');

    // Simple parsing - return raw structure
    return {
      date,
      sessions: [] // TODO: Full parsing implementation
    };
  }

  // ===========================================================================
  // Persistent Memory (Layer 3)
  // ===========================================================================

  async updatePersistent(section: keyof PersistentMemory, content: string): Promise<void> {
    const paths = getMemoryPaths(this.basePath);
    const memoryPath = path.join(paths.persistent, 'MEMORY.md');

    let fileContent = '';
    if (fs.existsSync(memoryPath)) {
      fileContent = fs.readFileSync(memoryPath, 'utf-8');
    }

    const sectionMap: Record<keyof PersistentMemory, string> = {
      user_preferences: '## User Preferences',
      architectural_decisions: '## Architectural Decisions',
      learned_patterns: '## Learned Patterns',
      constraints: '## Constraints'
    };

    const sectionHeader = sectionMap[section];
    const sectionIndex = fileContent.indexOf(sectionHeader);

    if (sectionIndex === -1) {
      // Section doesn't exist, add it
      fileContent += `\n${sectionHeader}\n- ${content}\n`;
    } else {
      // Find the end of the section
      const nextSectionIndex = fileContent.indexOf('\n## ', sectionIndex + 1);
      const endIndex = nextSectionIndex > -1 ? nextSectionIndex : fileContent.length;

      // Insert the new content
      const beforeSection = fileContent.slice(0, endIndex);
      const afterSection = fileContent.slice(endIndex);

      fileContent = beforeSection.trimEnd() + `\n- ${content}\n` + afterSection;
    }

    fs.writeFileSync(memoryPath, fileContent, 'utf-8');
  }

  async getPersistent(): Promise<PersistentMemory> {
    const paths = getMemoryPaths(this.basePath);
    const memoryPath = path.join(paths.persistent, 'MEMORY.md');

    const result: PersistentMemory = {
      user_preferences: [],
      architectural_decisions: [],
      learned_patterns: [],
      constraints: []
    };

    if (!fs.existsSync(memoryPath)) {
      return result;
    }

    const content = fs.readFileSync(memoryPath, 'utf-8');

    // Simple parsing - extract bullet points from each section
    const sections: Array<{ key: keyof PersistentMemory; header: string }> = [
      { key: 'user_preferences', header: '## User Preferences' },
      { key: 'architectural_decisions', header: '## Architectural Decisions' },
      { key: 'learned_patterns', header: '## Learned Patterns' },
      { key: 'constraints', header: '## Constraints' }
    ];

    for (const { key, header } of sections) {
      const sectionIndex = content.indexOf(header);
      if (sectionIndex === -1) continue;

      const nextSectionIndex = content.indexOf('\n## ', sectionIndex + 1);
      const sectionContent = nextSectionIndex > -1
        ? content.slice(sectionIndex, nextSectionIndex)
        : content.slice(sectionIndex);

      // Extract bullet points
      const bullets = sectionContent.match(/^- .+$/gm) || [];
      result[key] = bullets.map(b => b.replace(/^- /, '').trim());
    }

    return result;
  }

  // ===========================================================================
  // Session Traces
  // ===========================================================================

  async traceAction(trace: SessionTraceInput): Promise<void> {
    const sessionId = trace.agent + '-' + Date.now().toString(36);
    const tracePath = getSessionTracePath(this.basePath, sessionId);

    const fullTrace: SessionTrace = {
      ts: new Date().toISOString(),
      ...trace
    };

    const line = JSON.stringify(fullTrace) + '\n';

    // Ensure directory exists
    const dir = path.dirname(tracePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(tracePath, line, 'utf-8');

    // Also index in SQLite
    const { db } = this.conn;
    const traceId = `trace-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

    db.prepare(`
      INSERT INTO aios_session_traces (
        id, session_id, agent_id, action, target, input_summary, output_summary,
        tools_called, cost_usd, user_feedback, source_file, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      traceId,
      sessionId,
      trace.agent,
      trace.action,
      trace.target || null,
      trace.input || null,
      trace.output || null,
      trace.tools_called ? JSON.stringify(trace.tools_called) : null,
      trace.cost_usd || null,
      trace.user_feedback ?? null,
      path.relative(this.basePath, tracePath),
      fullTrace.ts
    );
  }

  async getSessionTraces(sessionId: string): Promise<SessionTrace[]> {
    const tracePath = getSessionTracePath(this.basePath, sessionId);

    if (!fs.existsSync(tracePath)) {
      return [];
    }

    const content = fs.readFileSync(tracePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());

    return lines.map(line => {
      try {
        return JSON.parse(line) as SessionTrace;
      } catch {
        return null;
      }
    }).filter((t): t is SessionTrace => t !== null);
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    return searchFTS(this.conn.db, query, options);
  }

  async searchSimilar(embedding: number[], limit: number = 10): Promise<SearchResult[]> {
    return searchVector(this.conn, embedding, limit);
  }

  // ===========================================================================
  // Index Management
  // ===========================================================================

  async rebuildIndex(): Promise<IndexStats> {
    return rebuildIndex(this.conn, this.basePath);
  }

  async getIndexStats(): Promise<IndexStats> {
    return getIndexStats(this.conn, this.basePath);
  }

  // ===========================================================================
  // Lifecycle
  // ===========================================================================

  close(): void {
    closeConnection(this.conn);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new MemoryLayer instance.
 *
 * @example
 * ```typescript
 * const memory = await createMemoryLayer({
 *   basePath: '.aios/memory',
 *   autoIndex: true
 * });
 *
 * // Add a fact
 * await memory.addFact({
 *   entity: 'user',
 *   fact: 'Prefers TypeScript',
 *   category: 'preference',
 *   priority: 'high'
 * });
 *
 * // Search
 * const results = await memory.search('TypeScript');
 *
 * // Close when done
 * memory.close();
 * ```
 */
export async function createMemoryLayer(config: MemoryLayerConfig = {}): Promise<MemoryLayer> {
  const {
    basePath = '.aios/memory',
    autoIndex = true
  } = config;

  // Ensure directory structure
  ensureDirectoryStructure(basePath);

  // Create database connection
  const conn = createConnection(config);

  // Check if schema exists
  const schemaValid = isSchemaValid(conn.db);

  if (!schemaValid) {
    // Create schema
    createSchema(conn);

    // Auto-rebuild index from existing files
    if (autoIndex) {
      rebuildIndex(conn, basePath);
    }
  } else if (autoIndex && !databaseExists(basePath)) {
    // Index exists but database file is missing (edge case)
    rebuildIndex(conn, basePath);
  }

  return new MemoryLayerImpl(conn, basePath, config);
}

/**
 * Quick check if memory layer is initialized.
 */
export function isMemoryLayerInitialized(basePath: string = '.aios/memory'): boolean {
  const paths = getMemoryPaths(basePath);
  return fs.existsSync(paths.base) && fs.existsSync(paths.index);
}

/**
 * AIOS Memory Layer - Type Definitions
 *
 * Core types for the local-first memory system based on ADR-001-LOCAL.
 */

// =============================================================================
// Fact Types (Layer 1: Entity Knowledge)
// =============================================================================

export type FactCategory = 'preference' | 'context' | 'decision' | 'learning' | 'constraint';
export type Priority = 'high' | 'medium' | 'low';
export type FactStatus = 'active' | 'superseded' | 'archived';

export interface Fact {
  /** Unique identifier (fact-XXX format) */
  id: string;
  /** What/who this fact is about */
  entity: string;
  /** The knowledge statement */
  fact: string;
  /** Category of the fact */
  category: FactCategory;
  /** Priority level */
  priority: Priority;
  /** Current status */
  status: FactStatus;
  /** ID of fact this replaces (if superseding) */
  supersedes?: string;
  /** Session that created this fact */
  source_session?: string;
  /** ISO timestamp of creation */
  created: string;
  /** ISO timestamp of last update */
  updated?: string;
}

export type FactInput = Omit<Fact, 'id' | 'created' | 'status'>;

export interface FactFilter {
  entity?: string;
  category?: FactCategory;
  priority?: Priority;
  status?: FactStatus;
  limit?: number;
}

// =============================================================================
// Memory Types (SQLite Index)
// =============================================================================

export type MemoryType = 'entity' | 'daily' | 'persistent';

export interface Memory {
  id: string;
  memory_type: MemoryType;
  entity: string | null;
  content: string;
  category: string | null;
  priority: Priority | null;
  status: FactStatus;
  source_file: string;
  source_session: string | null;
  embedding: Buffer | null;
  created_at: string;
  updated_at: string | null;
}

export interface MemoryRelation {
  id: string;
  source_id: string;
  target_id: string;
  relation_type: 'references' | 'supersedes' | 'relates_to' | 'contradicts';
  confidence: number;
  created_at: string;
}

// =============================================================================
// Session Trace Types
// =============================================================================

export interface SessionTrace {
  /** ISO timestamp */
  ts: string;
  /** Agent ID that performed the action */
  agent: string;
  /** Action performed */
  action: string;
  /** Target file/resource */
  target?: string;
  /** Summary of input */
  input?: string;
  /** Summary of output */
  output?: string;
  /** Tools used during action */
  tools_called?: string[];
  /** API cost in USD */
  cost_usd?: number;
  /** User feedback (-1=negative, 0=neutral, 1=positive) */
  user_feedback?: -1 | 0 | 1;
}

export type SessionTraceInput = Omit<SessionTrace, 'ts'>;

// =============================================================================
// Daily Note Types (Layer 2)
// =============================================================================

export interface DailyEntry {
  /** Session ID */
  session_id: string;
  /** Section: context, decisions, learnings, followups */
  section: 'context' | 'decisions' | 'learnings' | 'followups';
  /** Priority for decisions */
  priority?: Priority;
  /** Content to add */
  content: string;
}

export interface DailyNote {
  date: string;
  sessions: DailySession[];
}

export interface DailySession {
  session_id: string;
  time_range?: string;
  context: string[];
  decisions: Array<{ priority: Priority; content: string }>;
  learnings: string[];
  followups: Array<{ done: boolean; content: string }>;
}

// =============================================================================
// Persistent Memory Types (Layer 3)
// =============================================================================

export interface PersistentMemory {
  user_preferences: string[];
  architectural_decisions: string[];
  learned_patterns: string[];
  constraints: string[];
}

// =============================================================================
// Search Types
// =============================================================================

export interface SearchOptions {
  /** Maximum results to return */
  limit?: number;
  /** Filter by memory type */
  memory_type?: MemoryType;
  /** Filter by status */
  status?: FactStatus;
  /** Minimum relevance score (0-1) */
  min_score?: number;
}

export interface SearchResult extends Memory {
  /** Relevance score (for FTS) or distance (for vector) */
  score?: number;
}

// =============================================================================
// Index Statistics
// =============================================================================

export interface IndexStats {
  total_memories: number;
  by_type: Record<MemoryType, number>;
  by_status: Record<FactStatus, number>;
  total_relations: number;
  total_traces: number;
  last_rebuild: string | null;
  index_size_bytes: number;
}

// =============================================================================
// Configuration
// =============================================================================

export interface MemoryLayerConfig {
  /** Base path for memory files (default: .aios/memory) */
  basePath?: string;
  /** Auto-rebuild index on missing/corrupted (default: true) */
  autoIndex?: boolean;
  /** Enable vector search if sqlite-vec available (default: true) */
  enableVectorSearch?: boolean;
  /** Vector dimensions (default: 384 for all-MiniLM-L6-v2) */
  vectorDimensions?: number;
}

// =============================================================================
// Memory Layer Interface
// =============================================================================

export interface MemoryLayer {
  // Facts (Layer 1)
  addFact(fact: FactInput & { skipEmbedding?: boolean }): Promise<Fact>;
  getFacts(filter?: FactFilter): Promise<Fact[]>;
  supersedeFact(id: string, newFact: string, options?: { skipEmbedding?: boolean }): Promise<Fact>;

  // Daily Notes (Layer 2)
  logToDaily(entry: DailyEntry): Promise<void>;
  getDailyNotes(date: string): Promise<DailyNote | null>;

  // Persistent Memory (Layer 3)
  updatePersistent(section: keyof PersistentMemory, content: string): Promise<void>;
  getPersistent(): Promise<PersistentMemory>;

  // Session Traces
  traceAction(trace: SessionTraceInput): Promise<void>;
  getSessionTraces(sessionId: string): Promise<SessionTrace[]>;

  // Search (uses SQLite index)
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  searchSimilar(embedding: number[], limit?: number): Promise<SearchResult[]>;

  // Index Management
  rebuildIndex(): Promise<IndexStats>;
  getIndexStats(): Promise<IndexStats>;

  // Lifecycle
  close(): void;
}

/**
 * Types for the Automated Digital Presence Audit (BSS-7.3).
 *
 * Defines the audit report data shape, analysis results, and pipeline
 * configuration consumed by BSS-7.4 (AI Draft Generation).
 *
 * @module onboarding/audit/audit-types
 */

import type { AuditUrl, AuditUrlCollection } from './types';

// ---------------------------------------------------------------------------
// Confidence Level (AC-8)
// ---------------------------------------------------------------------------

/**
 * Confidence level for an inference (AC-8).
 * - High: >= 3 consistent sources
 * - Medium: 1-2 sources or mild inconsistency
 * - Low: single source or significant inconsistency
 */
export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

// ---------------------------------------------------------------------------
// Page Analysis (AC-2)
// ---------------------------------------------------------------------------

/** Extracted data from a single accessible URL (AC-2). */
export interface PageAnalysis {
  readonly url: string;
  readonly accessible: boolean;
  readonly accessError?: string;
  readonly title?: string;
  readonly metaDescription?: string;
  readonly headings: readonly HeadingEntry[];
  readonly dominantColors: readonly string[]; // hex values, minimum 5 when available
  readonly fontNames: readonly string[];
  readonly imageryDescriptions: readonly string[];
  readonly textContent: string; // combined visible text for tone analysis
  readonly fetchedAt: string; // ISO 8601
}

/** A heading extracted from the page (H1-H3). */
export interface HeadingEntry {
  readonly level: 1 | 2 | 3;
  readonly text: string;
}

// ---------------------------------------------------------------------------
// Tone of Voice Analysis (AC-3)
// ---------------------------------------------------------------------------

/** Tone of voice analysis across all accessible pages (AC-3). */
export interface ToneAnalysis {
  /** Formal (1) to Casual (5) spectrum. */
  readonly formalCasualScore: number;
  readonly formalCasualLabel: string;
  /** Emotional register detected (e.g., "inspirational", "informative", "urgent"). */
  readonly emotionalRegister: readonly string[];
  /** Vocabulary complexity: "simple" | "moderate" | "technical". */
  readonly vocabularyComplexity: 'simple' | 'moderate' | 'technical';
  /** Supporting evidence/reasoning for the analysis. */
  readonly reasoning: string;
  readonly confidence: ConfidenceLevel;
}

// ---------------------------------------------------------------------------
// Messaging Consistency Analysis (AC-4)
// ---------------------------------------------------------------------------

/** Messaging consistency analysis across pages and channels (AC-4). */
export interface MessagingAnalysis {
  /** Recurring value propositions found across multiple pages. */
  readonly recurringValuePropositions: readonly string[];
  /** Contradictions or inconsistencies detected. */
  readonly contradictions: readonly MessagingContradiction[];
  /** Overall messaging consistency score: 1 (inconsistent) to 5 (very consistent). */
  readonly consistencyScore: number;
  readonly reasoning: string;
  readonly confidence: ConfidenceLevel;
}

/** A specific messaging contradiction found between pages. */
export interface MessagingContradiction {
  readonly description: string;
  readonly sourceUrls: readonly string[];
}

// ---------------------------------------------------------------------------
// Visual Consistency Analysis (AC-5)
// ---------------------------------------------------------------------------

/** Visual consistency analysis across URLs (AC-5). */
export interface VisualAnalysis {
  /** Color palette consistency: consistent colors found across URLs. */
  readonly colorPalette: readonly ColorCluster[];
  /** Typography consistency assessment. */
  readonly typographyConsistency: TypographyAssessment;
  /** Imagery style patterns detected. */
  readonly imageryStyle: ImageryStyleAssessment;
  /** Overall visual consistency score: 1 (inconsistent) to 5 (very consistent). */
  readonly consistencyScore: number;
  readonly reasoning: string;
  readonly confidence: ConfidenceLevel;
}

/** A cluster of similar colors found across multiple pages. */
export interface ColorCluster {
  readonly hexValue: string;
  readonly occurrenceCount: number;
  readonly sourceUrls: readonly string[];
}

/** Typography consistency assessment across pages. */
export interface TypographyAssessment {
  readonly fontsDetected: readonly string[];
  readonly isConsistent: boolean;
  readonly notes: string;
}

/** Imagery style assessment. */
export interface ImageryStyleAssessment {
  /** Photo-heavy vs. illustration-heavy vs. mixed. */
  readonly dominantStyle: 'photo-heavy' | 'illustration-heavy' | 'mixed' | 'minimal';
  /** Warm vs. cool vs. neutral tones. */
  readonly tonality: 'warm' | 'cool' | 'neutral' | 'mixed';
  readonly notes: string;
}

// ---------------------------------------------------------------------------
// Improvement Opportunities (AC-6)
// ---------------------------------------------------------------------------

/** A specific improvement opportunity identified by AI analysis (AC-6). */
export interface ImprovementItem {
  readonly title: string;
  readonly description: string;
  readonly category: 'branding' | 'messaging' | 'visual' | 'content' | 'seo';
  readonly confidence: ConfidenceLevel;
}

// ---------------------------------------------------------------------------
// Competitive Gap Assessment (AC-7)
// ---------------------------------------------------------------------------

/** Competitive gap assessment section (AC-7). */
export interface CompetitiveGapAnalysis {
  readonly available: boolean;
  /** Present only if competitor URLs were provided. */
  readonly gaps?: readonly CompetitiveGap[];
  readonly summary?: string;
  readonly confidence?: ConfidenceLevel;
  /** Message shown if no competitor URLs were provided. */
  readonly unavailableMessage?: string;
}

/** A specific competitive gap identified. */
export interface CompetitiveGap {
  readonly area: string;
  readonly description: string;
  readonly competitorUrls: readonly string[];
  readonly confidence: ConfidenceLevel;
}

// ---------------------------------------------------------------------------
// Inference Item (AC-8)
// ---------------------------------------------------------------------------

/** A single inference with confidence level (AC-8). */
export interface InferenceItem {
  readonly category: string;
  readonly statement: string;
  readonly confidence: ConfidenceLevel;
  readonly sourceUrls: readonly string[];
}

// ---------------------------------------------------------------------------
// Complete Audit Report (AC-9)
// ---------------------------------------------------------------------------

/** The complete audit report stored in R2 (AC-9). */
export interface AuditReport {
  readonly clientId: string;
  readonly generatedAt: string; // ISO 8601
  readonly urlsSubmitted: number;
  readonly urlsAccessible: number;
  readonly pageAnalyses: readonly PageAnalysis[];
  readonly toneOfVoice: ToneAnalysis;
  readonly messagingConsistency: MessagingAnalysis;
  readonly visualConsistency: VisualAnalysis;
  readonly improvementOpportunities: readonly ImprovementItem[];
  readonly competitiveGap: CompetitiveGapAnalysis;
  readonly inferences: readonly InferenceItem[];
}

// ---------------------------------------------------------------------------
// Pipeline Progress (AC-10)
// ---------------------------------------------------------------------------

/** Pipeline execution status for polling (AC-10). */
export type AuditPipelineStatus = 'pending' | 'fetching' | 'analyzing' | 'complete' | 'failed';

/** Progress event for a single URL in the pipeline. */
export interface AuditUrlProgress {
  readonly url: string;
  readonly status: 'pending' | 'fetching' | 'complete' | 'failed';
  readonly error?: string;
}

/** Overall pipeline progress for polling endpoint (AC-10). */
export interface AuditPipelineProgress {
  readonly clientId: string;
  readonly status: AuditPipelineStatus;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly urlProgress: readonly AuditUrlProgress[];
  readonly completedUrls: number;
  readonly totalUrls: number;
  readonly currentPhase: string;
  readonly error?: string;
}

// ---------------------------------------------------------------------------
// Pipeline Dependencies (Dependency Injection)
// ---------------------------------------------------------------------------

/** HTTP fetcher interface for dependency injection. */
export interface HttpFetcher {
  fetch(url: string, options?: FetchOptions): Promise<FetchResult>;
}

/** Options for HTTP fetch. */
export interface FetchOptions {
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
}

/** Result of an HTTP fetch operation. */
export interface FetchResult {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Record<string, string>;
  readonly text(): Promise<string>;
}

/** AI text generation interface for dependency injection. */
export interface AuditAIService {
  generateText(prompt: string, options?: AuditAIOptions): Promise<AuditAIResponse>;
}

/** Options for AI text generation. */
export interface AuditAIOptions {
  readonly systemPrompt?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly clientId?: string;
}

/** AI text generation response. */
export interface AuditAIResponse {
  readonly text: string;
}

/** R2 storage interface for audit pipeline. */
export interface AuditR2Client {
  uploadJson(key: string, data: unknown): Promise<{ key: string }>;
}

/** ClickUp client interface for audit pipeline. */
export interface AuditClickUpClient {
  postComment(taskId: string, comment: string): Promise<void>;
}

/** Dependencies injected into the AuditPipeline. */
export interface AuditPipelineDeps {
  readonly httpFetcher: HttpFetcher;
  readonly aiService: AuditAIService;
  readonly r2Client: AuditR2Client;
  readonly clickUpClient?: AuditClickUpClient;
  readonly clickUpTaskId?: string;
  readonly logger?: AuditLogger;
}

/** Logger interface for audit pipeline. */
export interface AuditLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Pipeline Configuration
// ---------------------------------------------------------------------------

/** Configuration for the audit pipeline. */
export interface AuditPipelineConfig {
  /** Timeout per URL fetch in milliseconds. Defaults to 10_000. */
  readonly fetchTimeoutMs: number;
  /** Maximum concurrent URL fetches. Defaults to 3. */
  readonly maxConcurrentFetches: number;
  /** Maximum URLs the pipeline can process. Defaults to 15. */
  readonly maxUrls: number;
}

/** Default pipeline configuration. */
export const DEFAULT_AUDIT_CONFIG: AuditPipelineConfig = {
  fetchTimeoutMs: 10_000,
  maxConcurrentFetches: 3,
  maxUrls: 15,
} as const;

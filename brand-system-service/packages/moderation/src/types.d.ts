/**
 * Type definitions for content moderation system.
 * @module moderation/types
 */
/** Severity levels for moderation results. */
export type ModerationSeverity = 'PASS' | 'WARN' | 'FAIL';
/** Filter types for moderation flags. */
export type FilterType = 'profanity' | 'competitor' | 'forbidden-words' | 'factual-claims' | 'legal-compliance';
/** Individual moderation flag from a specific filter. */
export interface ModerationFlag {
    /** The filter that generated this flag. */
    filter: FilterType;
    /** Severity level of this flag. */
    severity: 'WARN' | 'FAIL';
    /** The words/phrases that triggered the flag. */
    matchedContent: string[];
    /** Human-readable explanation. */
    explanation: string;
}
/** Context provided for content moderation. */
export interface ModerationContext {
    /** Client ID for logging and context isolation. */
    clientId: string;
    /** Brand-specific forbidden words. */
    brandForbiddenWords: string[];
    /** Competitor brand names to flag. */
    competitorNames: string[];
}
/** Configuration options for moderation filters. */
export interface ModerationOptions {
    /** Enable profanity filter (default: true). */
    enableProfanity?: boolean;
    /** Enable competitor mention detector (default: true). */
    enableCompetitor?: boolean;
    /** Enable forbidden words checker (default: true). */
    enableForbiddenWords?: boolean;
    /** Enable factual claims flagger (default: true). */
    enableFactualClaims?: boolean;
    /** Enable legal compliance checker (default: true). */
    enableLegalCompliance?: boolean;
}
/** Result of content moderation. */
export interface ModerationResult {
    /** Whether the content passed moderation. */
    passed: boolean;
    /** Array of flags raised during moderation. */
    flags: ModerationFlag[];
    /** Whether this content requires human review. */
    requiresHumanReview: boolean;
    /** Most severe flag severity. */
    severity: ModerationSeverity;
}
/** AI batch check response schema. */
export interface AIBatchCheckResponse {
    offensiveLanguage: {
        detected: boolean;
        examples: string[];
    };
    factualClaims: {
        detected: boolean;
        sentences: string[];
    };
    legalRisks: {
        detected: boolean;
        phrases: string[];
    };
}
//# sourceMappingURL=types.d.ts.map
/**
 * Conflict Detector for Audit Data Quality (BSS-7.5, AC-4).
 *
 * Identifies contradictions between brand signals across different URLs:
 * - Tone of voice inconsistencies (formal vs. casual across sources)
 * - Color family conflicts (warm vs. cool across sources)
 * - Messaging contradictions (from audit's messaging analysis)
 *
 * @module onboarding/quality/conflict-detector
 */

import type { AuditReport, PageAnalysis, ToneAnalysis } from '../audit/audit-types';
import type { URLCategory } from '../audit/types';
import type { BrandingConflict, DataQualityIssue, IssueSeverity } from './quality-types';
import { TONE_CONFLICT_THRESHOLD } from './quality-types';

// ---------------------------------------------------------------------------
// Color Classification
// ---------------------------------------------------------------------------

/** Classifies a hex color as warm, cool, or neutral. */
export function classifyColorFamily(hex: string): 'warm' | 'cool' | 'neutral' {
  const cleaned = hex.replace('#', '');
  if (cleaned.length < 6) return 'neutral';

  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return 'neutral';

  // Warm: red/orange/yellow dominant
  // Cool: blue/green/purple dominant
  // Neutral: close to grey or balanced
  const warmScore = r - b;
  const coolScore = b - r;

  if (warmScore > 50) return 'warm';
  if (coolScore > 50) return 'cool';
  return 'neutral';
}

/** Determines the dominant color family from a list of hex colors. */
export function getDominantColorFamily(
  colors: readonly string[],
): 'warm' | 'cool' | 'neutral' | 'mixed' {
  if (colors.length === 0) return 'neutral';

  const families = colors.map(classifyColorFamily);
  const counts = { warm: 0, cool: 0, neutral: 0 };

  for (const family of families) {
    counts[family]++;
  }

  const total = families.length;
  const warmRatio = counts.warm / total;
  const coolRatio = counts.cool / total;

  if (warmRatio >= 0.5) return 'warm';
  if (coolRatio >= 0.5) return 'cool';
  if (counts.neutral === total) return 'neutral';
  return 'mixed';
}

// ---------------------------------------------------------------------------
// URL Category Helper
// ---------------------------------------------------------------------------

/** Derives a URL category label from the URL string. */
function inferCategoryFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('facebook.com')) return 'facebook';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com')) return 'youtube';
  return 'website';
}

// ---------------------------------------------------------------------------
// Conflict Detector
// ---------------------------------------------------------------------------

export class ConflictDetector {
  /**
   * Detects branding conflicts in the audit report (AC-4).
   *
   * Examines:
   * 1. Tone inconsistencies -- compares formalCasualScore per URL/category
   * 2. Color family conflicts -- compares warm/cool color dominance across URLs
   * 3. Messaging contradictions -- surfaces existing contradictions from audit
   */
  detect(report: AuditReport): readonly DataQualityIssue[] {
    const issues: DataQualityIssue[] = [];

    // 1. Tone conflicts
    const toneConflicts = this.detectToneConflicts(report);
    issues.push(...toneConflicts.map((c) => this.conflictToIssue(c)));

    // 2. Color family conflicts
    const colorConflicts = this.detectColorConflicts(report);
    issues.push(...colorConflicts.map((c) => this.conflictToIssue(c)));

    // 3. Messaging contradictions (already captured in audit)
    const messagingIssues = this.extractMessagingContradictions(report);
    issues.push(...messagingIssues);

    return issues;
  }

  /**
   * Detects tone of voice conflicts across accessible pages.
   *
   * Groups pages by inferred category, then compares the overall tone
   * analysis against the text content patterns to find inconsistencies.
   * If the audit has a global toneOfVoice score, compare individual page
   * categories against it.
   */
  detectToneConflicts(report: AuditReport): readonly BrandingConflict[] {
    const conflicts: BrandingConflict[] = [];
    const accessiblePages = report.pageAnalyses.filter((p) => p.accessible);

    if (accessiblePages.length < 2) return conflicts;

    // Group pages by category
    const categoryGroups = new Map<string, PageAnalysis[]>();
    for (const page of accessiblePages) {
      const category = inferCategoryFromUrl(page.url);
      const existing = categoryGroups.get(category) ?? [];
      existing.push(page);
      categoryGroups.set(category, existing);
    }

    // Compare tone across category groups using the global tone score
    const categories = Array.from(categoryGroups.keys());
    const globalScore = report.toneOfVoice.formalCasualScore;

    // For each pair of categories, check if tone diverges significantly
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const catA = categories[i];
        const catB = categories[j];
        const pagesA = categoryGroups.get(catA)!;
        const pagesB = categoryGroups.get(catB)!;

        // Estimate tone from text content length and patterns
        const scoreA = this.estimateToneScore(pagesA);
        const scoreB = this.estimateToneScore(pagesB);

        if (Math.abs(scoreA - scoreB) > TONE_CONFLICT_THRESHOLD) {
          const labelA = scoreA <= 2.5 ? 'formal tone' : 'casual tone';
          const labelB = scoreB <= 2.5 ? 'formal tone' : 'casual tone';

          conflicts.push({
            conflict_type: 'tone',
            source_a: {
              url: pagesA[0].url,
              category: catA,
              value: labelA,
            },
            source_b: {
              url: pagesB[0].url,
              category: catB,
              value: labelB,
            },
            description: `Detected "${labelA}" on ${catA} but "${labelB}" on ${catB}`,
            severity: 'medium',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Detects color family conflicts across accessible pages.
   *
   * If one page category is predominantly warm colors and another is cool,
   * flags as inconsistent_branding.
   */
  detectColorConflicts(report: AuditReport): readonly BrandingConflict[] {
    const conflicts: BrandingConflict[] = [];
    const accessiblePages = report.pageAnalyses.filter((p) => p.accessible);

    if (accessiblePages.length < 2) return conflicts;

    // Group pages by category
    const categoryColors = new Map<string, { url: string; family: string }>();
    for (const page of accessiblePages) {
      const category = inferCategoryFromUrl(page.url);
      if (page.dominantColors.length > 0 && !categoryColors.has(category)) {
        const family = getDominantColorFamily(page.dominantColors);
        categoryColors.set(category, { url: page.url, family });
      }
    }

    const entries = Array.from(categoryColors.entries());

    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [catA, dataA] = entries[i];
        const [catB, dataB] = entries[j];

        // Only flag warm vs. cool conflicts (not neutral/mixed)
        if (
          (dataA.family === 'warm' && dataB.family === 'cool') ||
          (dataA.family === 'cool' && dataB.family === 'warm')
        ) {
          conflicts.push({
            conflict_type: 'color',
            source_a: {
              url: dataA.url,
              category: catA,
              value: `${dataA.family} colors`,
            },
            source_b: {
              url: dataB.url,
              category: catB,
              value: `${dataB.family} colors`,
            },
            description: `Color palette conflict: ${catA} uses ${dataA.family} tones while ${catB} uses ${dataB.family} tones`,
            severity: 'low',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Extracts messaging contradictions from the audit report.
   * These are already detected by BSS-7.3 -- we surface them as quality issues.
   */
  private extractMessagingContradictions(report: AuditReport): readonly DataQualityIssue[] {
    if (!report.messagingConsistency.contradictions.length) return [];

    return report.messagingConsistency.contradictions.map((contradiction) => ({
      issue_type: 'inconsistent_branding' as const,
      affected_url: contradiction.sourceUrls[0] ?? null,
      description: contradiction.description,
      severity: 'medium' as const,
      impact_on_audit:
        'Messaging contradictions reduce confidence in brand voice and positioning analysis.',
    }));
  }

  /**
   * Converts a BrandingConflict into a DataQualityIssue.
   */
  private conflictToIssue(conflict: BrandingConflict): DataQualityIssue {
    return {
      issue_type: 'inconsistent_branding',
      affected_url: conflict.source_a.url,
      description: conflict.description,
      severity: conflict.severity,
      impact_on_audit: `Brand inconsistency between ${conflict.source_a.category} and ${conflict.source_b.category} reduces audit confidence in unified brand identity analysis.`,
    };
  }

  /**
   * Estimates a tone score (1=formal, 5=casual) from page content.
   *
   * Simple heuristic based on text characteristics:
   * - Shorter sentences / informal markers -> more casual
   * - Longer, structured content -> more formal
   */
  private estimateToneScore(pages: readonly PageAnalysis[]): number {
    if (pages.length === 0) return 3; // neutral default

    let totalScore = 0;
    for (const page of pages) {
      const text = page.textContent || '';
      const words = text.split(/\s+/).filter((w) => w.length > 0);
      const wordCount = words.length;

      if (wordCount === 0) {
        totalScore += 3;
        continue;
      }

      // Heuristic: count informal indicators
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      const avgWordsPerSentence = wordCount / Math.max(sentences.length, 1);

      // Shorter sentences + exclamation marks = more casual
      const exclamationRatio = (text.match(/!/g) || []).length / Math.max(sentences.length, 1);

      let score = 3; // neutral
      if (avgWordsPerSentence > 20) score -= 1; // more formal
      if (avgWordsPerSentence < 10) score += 1; // more casual
      if (exclamationRatio > 0.3) score += 0.5; // casual marker

      totalScore += Math.max(1, Math.min(5, score));
    }

    return totalScore / pages.length;
  }
}

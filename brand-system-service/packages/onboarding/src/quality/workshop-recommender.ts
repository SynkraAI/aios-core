/**
 * Workshop Recommender for Audit Data Quality (BSS-7.5, AC-5).
 *
 * Generates 3-5 recommended discovery workshop focus areas based on
 * data quality gaps found in the audit report.
 *
 * @module onboarding/quality/workshop-recommender
 */

import type { DataQualityIssue, WorkshopFocusArea, IssueSeverity } from './quality-types';
import {
  FOCUS_AREA_TEMPLATES,
  MIN_WORKSHOP_FOCUS_AREAS,
  MAX_WORKSHOP_FOCUS_AREAS,
} from './quality-types';

// ---------------------------------------------------------------------------
// Priority Mapping
// ---------------------------------------------------------------------------

/** Maps issue severity to workshop priority. */
function severityToPriority(severity: IssueSeverity): 'high' | 'medium' | 'low' {
  return severity;
}

/** Maps issue type to a default priority if no severity context. */
const ISSUE_TYPE_PRIORITY: Record<string, 'high' | 'medium' | 'low'> = {
  inaccessible_url: 'high',
  inconsistent_branding: 'high',
  missing_category: 'medium',
  stale_content: 'medium',
  low_content_density: 'low',
};

// ---------------------------------------------------------------------------
// Workshop Recommender
// ---------------------------------------------------------------------------

export class WorkshopRecommender {
  /**
   * Generates 3-5 workshop focus areas from the list of quality issues (AC-5).
   *
   * Steps:
   * 1. Group issues by type
   * 2. Generate a focus area per group using templates
   * 3. Deduplicate by topic similarity
   * 4. Sort by priority (high > medium > low)
   * 5. Clamp to 3-5 results
   */
  recommend(issues: readonly DataQualityIssue[]): readonly WorkshopFocusArea[] {
    if (issues.length === 0) {
      return this.getDefaultFocusAreas();
    }

    // 1. Group issues by type
    const groupedByType = new Map<string, DataQualityIssue[]>();
    for (const issue of issues) {
      const existing = groupedByType.get(issue.issue_type) ?? [];
      existing.push(issue);
      groupedByType.set(issue.issue_type, existing);
    }

    // 2. Generate focus areas per group
    const focusAreas: WorkshopFocusArea[] = [];

    for (const [issueType, groupIssues] of groupedByType) {
      const area = this.buildFocusArea(issueType, groupIssues);
      if (area) {
        focusAreas.push(area);
      }
    }

    // 3. Sort by priority
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    focusAreas.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // 4. Clamp to MAX, pad to MIN if needed
    const clamped = focusAreas.slice(0, MAX_WORKSHOP_FOCUS_AREAS);

    if (clamped.length < MIN_WORKSHOP_FOCUS_AREAS) {
      const defaults = this.getDefaultFocusAreas();
      for (const def of defaults) {
        if (clamped.length >= MIN_WORKSHOP_FOCUS_AREAS) break;
        // Only add if not already covered
        if (!clamped.some((a) => a.topic === def.topic)) {
          clamped.push(def);
        }
      }
    }

    return clamped.slice(0, MAX_WORKSHOP_FOCUS_AREAS);
  }

  /**
   * Builds a single focus area from a group of issues of the same type.
   */
  private buildFocusArea(
    issueType: string,
    issues: readonly DataQualityIssue[],
  ): WorkshopFocusArea | null {
    const highestSeverity = this.getHighestSeverity(issues);
    const priority = severityToPriority(highestSeverity);

    switch (issueType) {
      case 'inconsistent_branding':
        return {
          topic: this.buildInconsistentBrandingTopic(issues),
          reason: `${issues.length} branding inconsistenc${issues.length === 1 ? 'y' : 'ies'} detected across digital channels. Workshop should align brand voice and visual identity.`,
          priority,
        };

      case 'inaccessible_url':
        return {
          topic: 'Verify digital presence -- some URLs could not be analyzed',
          reason: `${issues.length} URL${issues.length === 1 ? '' : 's'} were inaccessible during audit. Client should verify these channels are active and accessible.`,
          priority,
        };

      case 'missing_category':
        return {
          topic: this.buildMissingCategoryTopic(issues),
          reason: `Key digital channel${issues.length === 1 ? '' : 's'} not provided for audit. Workshop should discuss presence strategy for missing channels.`,
          priority,
        };

      case 'stale_content':
        return {
          topic: 'Review and refresh outdated content',
          reason: `${issues.length} page${issues.length === 1 ? '' : 's'} appear${issues.length === 1 ? 's' : ''} to have content older than 12 months. Workshop should discuss content freshness strategy.`,
          priority,
        };

      case 'low_content_density':
        return {
          topic: 'Expand content depth on thin pages',
          reason: `${issues.length} page${issues.length === 1 ? '' : 's'} had insufficient content for analysis. Workshop should discuss content strategy for these pages.`,
          priority,
        };

      default:
        return null;
    }
  }

  /**
   * Builds a topic string for inconsistent branding issues.
   */
  private buildInconsistentBrandingTopic(issues: readonly DataQualityIssue[]): string {
    // Try to extract source names from descriptions
    const firstIssue = issues[0];
    if (firstIssue.description.includes('between')) {
      return `Clarify brand identity -- ${firstIssue.description.toLowerCase()}`;
    }
    return 'Clarify brand tone and visual identity -- inconsistency detected across channels';
  }

  /**
   * Builds a topic string for missing category issues.
   */
  private buildMissingCategoryTopic(issues: readonly DataQualityIssue[]): string {
    const categories = issues
      .map((i) => {
        const match = i.description.match(/No (\w+)/i);
        return match ? match[1] : null;
      })
      .filter((c): c is string => c !== null);

    if (categories.length > 0) {
      return `Provide ${categories.join(', ')} examples -- not included in URL set`;
    }
    return 'Provide examples for missing digital channels';
  }

  /**
   * Returns the highest severity from a list of issues.
   */
  private getHighestSeverity(issues: readonly DataQualityIssue[]): IssueSeverity {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    let highest: IssueSeverity = 'low';

    for (const issue of issues) {
      if (order[issue.severity] < order[highest]) {
        highest = issue.severity;
      }
    }

    return highest;
  }

  /**
   * Returns default focus areas when no issues are detected.
   * Ensures minimum of 3 areas for a productive workshop.
   */
  private getDefaultFocusAreas(): WorkshopFocusArea[] {
    return [
      {
        topic: 'Define target audience personas and messaging priorities',
        reason:
          'Standard workshop topic to ensure brand strategy aligns with business objectives.',
        priority: 'medium',
      },
      {
        topic: 'Review competitive positioning and differentiation',
        reason: 'Standard workshop topic to identify market gaps and unique value propositions.',
        priority: 'medium',
      },
      {
        topic: 'Align visual identity with brand personality',
        reason:
          'Standard workshop topic to ensure visual elements reinforce brand messaging.',
        priority: 'low',
      },
    ];
  }
}

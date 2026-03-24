/**
 * Improvement Suggestions draft generator (BSS-7.4 AC-4).
 *
 * Generates draft improvement suggestions for the client's website homepage,
 * landing pages, and up to 2 social channels — sourced from the audit report.
 *
 * @module onboarding/drafts/improvement-drafter
 */

import type { AuditReport, AuditAIService, AuditLogger } from '../audit/audit-types';
import type {
  ImprovementSuggestionsDraft,
  ChannelImprovements,
  ImprovementSuggestion,
} from './draft-types';
import { DRAFT_PREAMBLE } from './draft-types';

// ---------------------------------------------------------------------------
// Channel Detection
// ---------------------------------------------------------------------------

/** Social platform URL patterns. */
const SOCIAL_PATTERNS: ReadonlyArray<{ pattern: RegExp; name: string }> = [
  { pattern: /instagram\.com/i, name: 'Instagram' },
  { pattern: /facebook\.com/i, name: 'Facebook' },
  { pattern: /linkedin\.com/i, name: 'LinkedIn' },
  { pattern: /twitter\.com|x\.com/i, name: 'X/Twitter' },
  { pattern: /tiktok\.com/i, name: 'TikTok' },
  { pattern: /youtube\.com/i, name: 'YouTube' },
];

interface DetectedChannel {
  readonly name: string;
  readonly type: 'website' | 'landing_page' | 'social';
  readonly urls: string[];
}

/**
 * Detect channels from audit page analyses.
 * Returns homepage, landing pages, and up to 2 social channels.
 */
function detectChannels(report: AuditReport): DetectedChannel[] {
  const channels: DetectedChannel[] = [];
  const accessiblePages = report.pageAnalyses.filter((p) => p.accessible);

  // Detect website homepage (first non-social, non-landing-page URL)
  const homepageUrls = accessiblePages
    .filter((p) => {
      const isSocial = SOCIAL_PATTERNS.some((sp) => sp.pattern.test(p.url));
      return !isSocial;
    })
    .map((p) => p.url);

  if (homepageUrls.length > 0) {
    channels.push({
      name: 'Website Homepage',
      type: 'website',
      urls: [homepageUrls[0]],
    });
  }

  // Detect landing pages (non-root website pages)
  const landingPageUrls = homepageUrls.slice(1);
  if (landingPageUrls.length > 0) {
    channels.push({
      name: 'Landing Pages',
      type: 'landing_page',
      urls: landingPageUrls.slice(0, 3),
    });
  }

  // Detect social channels (up to 2)
  const socialChannels: DetectedChannel[] = [];
  for (const page of accessiblePages) {
    if (socialChannels.length >= 2) break;

    for (const sp of SOCIAL_PATTERNS) {
      if (sp.pattern.test(page.url)) {
        const existing = socialChannels.find((c) => c.name === sp.name);
        if (!existing) {
          socialChannels.push({
            name: sp.name,
            type: 'social',
            urls: [page.url],
          });
        }
        break;
      }
    }
  }

  channels.push(...socialChannels);

  return channels;
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior digital marketing consultant. Based on the audit data provided, generate specific, actionable improvement suggestions for each channel.
Label ALL output as "AI Draft - Requires Human Validation".
Respond with ONLY valid JSON, no markdown fences, no additional text.`;

function buildPrompt(report: AuditReport, channels: DetectedChannel[]): string {
  const improvements = report.improvementOpportunities;
  const tone = report.toneOfVoice;
  const messaging = report.messagingConsistency;
  const visual = report.visualConsistency;

  const channelDescriptions = channels
    .map((ch) => `- ${ch.name} (${ch.type}): ${ch.urls.join(', ')}`)
    .join('\n');

  const existingImprovements = improvements
    .map((i) => `- [${i.category}] ${i.title}: ${i.description}`)
    .join('\n');

  return `Generate improvement suggestions for each channel listed below.

CHANNELS TO IMPROVE:
${channelDescriptions}

EXISTING AUDIT FINDINGS:
${existingImprovements || 'No specific improvements identified yet'}

BRAND CONTEXT:
- Tone: ${tone.formalCasualLabel} (${tone.confidence} confidence)
- Messaging Consistency: ${messaging.consistencyScore}/5
- Visual Consistency: ${visual.consistencyScore}/5

Return a JSON object with this exact structure:
{
  "channels": [
    {
      "channel": "<channel name>",
      "channel_type": "website"|"landing_page"|"social",
      "suggestions": [
        {
          "suggestion": "<specific, actionable suggestion>",
          "rationale": "<why this matters, referencing audit data>",
          "priority": "high"|"medium"|"low"
        }
      ]
    }
  ]
}

For each channel, provide 2-3 specific, actionable suggestions.
Prioritize suggestions that address the most impactful improvements first.`;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseImprovementsResponse(
  text: string,
  expectedChannels: DetectedChannel[],
): ChannelImprovements[] {
  const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  const rawChannels = Array.isArray(parsed['channels']) ? parsed['channels'] : [];
  const validTypes = ['website', 'landing_page', 'social'] as const;
  const validPriorities = ['high', 'medium', 'low'] as const;

  const result: ChannelImprovements[] = (rawChannels as Array<Record<string, unknown>>)
    .filter((ch) => typeof ch['channel'] === 'string')
    .map((ch) => {
      const rawSuggestions = Array.isArray(ch['suggestions']) ? ch['suggestions'] : [];

      const suggestions: ImprovementSuggestion[] = (rawSuggestions as Array<Record<string, unknown>>)
        .filter(
          (s) =>
            typeof s['suggestion'] === 'string' &&
            typeof s['rationale'] === 'string',
        )
        .slice(0, 3) // Cap at 3 per channel
        .map((s) => ({
          suggestion: s['suggestion'] as string,
          rationale: s['rationale'] as string,
          priority: (validPriorities as readonly string[]).includes(s['priority'] as string)
            ? (s['priority'] as ImprovementSuggestion['priority'])
            : 'medium',
        }));

      const rawType = ch['channel_type'] as string | undefined;
      const channel_type = (validTypes as readonly string[]).includes(rawType ?? '')
        ? (rawType as ChannelImprovements['channel_type'])
        : 'website';

      return {
        channel: ch['channel'] as string,
        channel_type,
        suggestions,
      };
    });

  // If AI returned fewer channels than expected, add empty ones
  for (const expected of expectedChannels) {
    if (!result.find((r) => r.channel === expected.name)) {
      result.push({
        channel: expected.name,
        channel_type: expected.type,
        suggestions: [],
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate Improvement Suggestions draft from the audit report (AC-4).
 *
 * @param report - The audit report from BSS-7.3
 * @param aiService - AI text generation service
 * @param clientId - Client identifier
 * @param logger - Optional logger
 * @returns ImprovementSuggestionsDraft
 */
export async function generateImprovementSuggestionsDraft(
  report: AuditReport,
  aiService: AuditAIService,
  clientId: string,
  logger?: AuditLogger,
): Promise<ImprovementSuggestionsDraft> {
  logger?.info('Generating Improvement Suggestions draft from audit report');

  const channels = detectChannels(report);

  if (channels.length === 0) {
    logger?.warn('No channels detected from audit report — generating empty suggestions draft');
    return {
      _ai_draft: true,
      _requires_validation: true,
      _label: 'AI Draft - Requires Human Validation',
      _preamble: DRAFT_PREAMBLE,
      validation_status: 'pending',
      generated_at: new Date().toISOString(),
      client_id: clientId,
      source_audit_version: report.generatedAt,
      draft_type: 'improvement-suggestions',
      channels: [],
    };
  }

  const prompt = buildPrompt(report, channels);

  const response = await aiService.generateText(prompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 2000,
    temperature: 0.4,
    clientId,
  });

  const parsedChannels = parseImprovementsResponse(response.text, channels);

  const draft: ImprovementSuggestionsDraft = {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: DRAFT_PREAMBLE,
    validation_status: 'pending',
    generated_at: new Date().toISOString(),
    client_id: clientId,
    source_audit_version: report.generatedAt,
    draft_type: 'improvement-suggestions',
    channels: parsedChannels,
  };

  const totalSuggestions = parsedChannels.reduce((sum, ch) => sum + ch.suggestions.length, 0);
  logger?.info(
    `Improvement Suggestions draft generated: ${parsedChannels.length} channels, ${totalSuggestions} total suggestions`,
  );

  return draft;
}

// Export for testing
export { detectChannels };

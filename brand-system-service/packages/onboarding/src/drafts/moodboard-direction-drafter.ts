/**
 * Moodboard Direction draft generator (BSS-7.4 AC-3).
 *
 * Generates a draft Moodboard Direction from the audit report's visual
 * consistency analysis — color palette, typography, imagery style.
 *
 * @module onboarding/drafts/moodboard-direction-drafter
 */

import type { AuditReport, AuditAIService, AuditLogger } from '../audit/audit-types';
import type {
  MoodboardDirectionDraft,
  VisualDirectionTag,
  ColorSeed,
  TypographyDirection,
} from './draft-types';
import { DRAFT_PREAMBLE } from './draft-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior visual brand strategist. Based on the audit data provided, generate a Moodboard Direction draft.
Label ALL output as "AI Draft - Requires Human Validation".
Respond with ONLY valid JSON, no markdown fences, no additional text.`;

function buildPrompt(report: AuditReport): string {
  const visual = report.visualConsistency;
  const tone = report.toneOfVoice;

  const topColors = visual.colorPalette
    .slice(0, 10)
    .map((c) => `${c.hexValue} (seen ${c.occurrenceCount}x)`)
    .join(', ');

  const fonts = visual.typographyConsistency.fontsDetected.join(', ') || 'None detected';
  const imageryStyle = visual.imageryStyle;

  return `Generate a Moodboard Direction draft from the following audit data.

VISUAL CONSISTENCY ANALYSIS:
- Consistency Score: ${visual.consistencyScore}/5
- Color Palette: ${topColors}
- Typography: ${fonts} (Consistent: ${visual.typographyConsistency.isConsistent})
- Typography Notes: ${visual.typographyConsistency.notes}
- Imagery Style: ${imageryStyle.dominantStyle}, ${imageryStyle.tonality} tones
- Imagery Notes: ${imageryStyle.notes}
- Confidence: ${visual.confidence}
- Reasoning: ${visual.reasoning}

BRAND TONE CONTEXT:
- Tone: ${tone.formalCasualLabel}
- Emotional Register: ${tone.emotionalRegister.join(', ')}

Return a JSON object with this exact structure:
{
  "visual_direction_tags": [
    { "tag": "<e.g., Clean & Professional>", "description": "<why this tag>", "derived_from": "<audit data source>" }
  ],
  "color_seeds": [
    { "hex": "<#RRGGBB>", "name": "<descriptive name>", "role": "<primary|secondary|accent|neutral>" }
  ],
  "typography_direction": [
    { "category": "heading"|"body"|"accent", "suggestion": "<font or style suggestion>", "rationale": "<why>" }
  ]
}

Include:
- Exactly 3 visual direction tags derived from the visual consistency analysis
- Top 5 color seeds from the dominant colors
- 3 typography direction entries (heading, body, accent)`;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseMoodboardResponse(text: string): {
  visual_direction_tags: VisualDirectionTag[];
  color_seeds: ColorSeed[];
  typography_direction: TypographyDirection[];
} {
  const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  const rawTags = Array.isArray(parsed['visual_direction_tags'])
    ? parsed['visual_direction_tags']
    : [];
  const rawColors = Array.isArray(parsed['color_seeds']) ? parsed['color_seeds'] : [];
  const rawTypo = Array.isArray(parsed['typography_direction'])
    ? parsed['typography_direction']
    : [];

  const visual_direction_tags: VisualDirectionTag[] = (rawTags as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['tag'] === 'string' &&
        typeof e['description'] === 'string',
    )
    .slice(0, 3)
    .map((e) => ({
      tag: e['tag'] as string,
      description: e['description'] as string,
      derived_from: typeof e['derived_from'] === 'string' ? (e['derived_from'] as string) : 'visual consistency analysis',
    }));

  const validRoles = ['primary', 'secondary', 'accent', 'neutral'] as const;
  const color_seeds: ColorSeed[] = (rawColors as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['hex'] === 'string' &&
        typeof e['name'] === 'string',
    )
    .slice(0, 5)
    .map((e) => ({
      hex: e['hex'] as string,
      name: e['name'] as string,
      role: (validRoles as readonly string[]).includes(e['role'] as string)
        ? (e['role'] as ColorSeed['role'])
        : 'neutral',
    }));

  const validCategories = ['heading', 'body', 'accent'] as const;
  const typography_direction: TypographyDirection[] = (rawTypo as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['suggestion'] === 'string' &&
        typeof e['rationale'] === 'string',
    )
    .slice(0, 3)
    .map((e) => ({
      category: (validCategories as readonly string[]).includes(e['category'] as string)
        ? (e['category'] as TypographyDirection['category'])
        : 'body',
      suggestion: e['suggestion'] as string,
      rationale: e['rationale'] as string,
    }));

  return { visual_direction_tags, color_seeds, typography_direction };
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a Moodboard Direction draft from the audit report (AC-3).
 *
 * @param report - The audit report from BSS-7.3
 * @param aiService - AI text generation service
 * @param clientId - Client identifier
 * @param logger - Optional logger
 * @returns MoodboardDirectionDraft
 */
export async function generateMoodboardDirectionDraft(
  report: AuditReport,
  aiService: AuditAIService,
  clientId: string,
  logger?: AuditLogger,
): Promise<MoodboardDirectionDraft> {
  logger?.info('Generating Moodboard Direction draft from audit report');

  const prompt = buildPrompt(report);

  const response = await aiService.generateText(prompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 1500,
    temperature: 0.4,
    clientId,
  });

  const parsed = parseMoodboardResponse(response.text);

  const draft: MoodboardDirectionDraft = {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: DRAFT_PREAMBLE,
    validation_status: 'pending',
    generated_at: new Date().toISOString(),
    client_id: clientId,
    source_audit_version: report.generatedAt,
    draft_type: 'moodboard-direction',
    visual_direction_tags: parsed.visual_direction_tags,
    color_seeds: parsed.color_seeds,
    typography_direction: parsed.typography_direction,
  };

  logger?.info(
    `Moodboard Direction draft generated: ${parsed.visual_direction_tags.length} tags, ${parsed.color_seeds.length} colors, ${parsed.typography_direction.length} typography entries`,
  );

  return draft;
}

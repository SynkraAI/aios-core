/**
 * Brand Voice Guide draft generator (BSS-7.4 AC-1).
 *
 * Generates a draft Brand Voice Guide from the audit report's tone analysis,
 * vocabulary data, and messaging consistency findings.
 *
 * @module onboarding/drafts/brand-voice-drafter
 */

import type { AuditReport, AuditAIService, AuditLogger } from '../audit/audit-types';
import type { BrandVoiceDraft, ToneSpectrumEntry, VocabularyExample, CommunicationGuideline } from './draft-types';
import { DRAFT_PREAMBLE } from './draft-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior brand strategist. Based on the audit data provided, generate a Brand Voice Guide draft.
Label ALL output as "AI Draft - Requires Human Validation".
Respond with ONLY valid JSON, no markdown fences, no additional text.`;

function buildPrompt(report: AuditReport): string {
  const tone = report.toneOfVoice;
  const messaging = report.messagingConsistency;
  const pages = report.pageAnalyses.filter((p) => p.accessible);

  // Collect vocabulary from page content (headings, first 200 chars of text)
  const contentSamples = pages
    .slice(0, 5)
    .map((p) => {
      const headingText = p.headings.map((h) => h.text).join(', ');
      const snippet = p.textContent.slice(0, 200);
      return `URL: ${p.url}\nHeadings: ${headingText}\nContent: ${snippet}`;
    })
    .join('\n---\n');

  return `Generate a Brand Voice Guide draft from the following audit data.

TONE ANALYSIS:
- Formal/Casual Score: ${tone.formalCasualScore}/5 (${tone.formalCasualLabel})
- Emotional Register: ${tone.emotionalRegister.join(', ')}
- Vocabulary Complexity: ${tone.vocabularyComplexity}
- Confidence: ${tone.confidence}
- Reasoning: ${tone.reasoning}

MESSAGING CONSISTENCY:
- Consistency Score: ${messaging.consistencyScore}/5
- Recurring Value Propositions: ${messaging.recurringValuePropositions.join('; ')}
- Contradictions: ${messaging.contradictions.length} found
- Confidence: ${messaging.confidence}

CONTENT SAMPLES:
${contentSamples}

Return a JSON object with this exact structure:
{
  "tone_spectrum": [
    { "dimension": "<dimension name>", "position": <1-5>, "label": "<label>", "description": "<description>" }
  ],
  "vocabulary_examples": [
    { "word": "<word or phrase>", "context": "<where/how it's used>", "frequency": "frequent"|"occasional"|"rare" }
  ],
  "communication_guidelines": [
    { "type": "do"|"dont", "guideline": "<guideline>", "rationale": "<why>" }
  ]
}

Include:
- At least 4 tone spectrum dimensions (e.g., Formal-Casual, Technical-Simple, Emotional-Rational, Playful-Serious)
- At least 6 vocabulary examples from the client's actual content
- At least 8 communication guidelines (mix of do's and don'ts)`;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseBrandVoiceResponse(text: string): {
  tone_spectrum: ToneSpectrumEntry[];
  vocabulary_examples: VocabularyExample[];
  communication_guidelines: CommunicationGuideline[];
} {
  const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  const rawSpectrum = Array.isArray(parsed['tone_spectrum']) ? parsed['tone_spectrum'] : [];
  const rawVocab = Array.isArray(parsed['vocabulary_examples']) ? parsed['vocabulary_examples'] : [];
  const rawGuidelines = Array.isArray(parsed['communication_guidelines']) ? parsed['communication_guidelines'] : [];

  const tone_spectrum: ToneSpectrumEntry[] = (rawSpectrum as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['dimension'] === 'string' &&
        typeof e['position'] === 'number' &&
        typeof e['label'] === 'string' &&
        typeof e['description'] === 'string',
    )
    .map((e) => ({
      dimension: e['dimension'] as string,
      position: Math.min(5, Math.max(1, e['position'] as number)),
      label: e['label'] as string,
      description: e['description'] as string,
    }));

  const validFrequencies = ['frequent', 'occasional', 'rare'] as const;
  const vocabulary_examples: VocabularyExample[] = (rawVocab as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['word'] === 'string' &&
        typeof e['context'] === 'string',
    )
    .map((e) => ({
      word: e['word'] as string,
      context: e['context'] as string,
      frequency: (validFrequencies as readonly string[]).includes(e['frequency'] as string)
        ? (e['frequency'] as VocabularyExample['frequency'])
        : 'occasional',
    }));

  const communication_guidelines: CommunicationGuideline[] = (rawGuidelines as Array<Record<string, unknown>>)
    .filter(
      (e) =>
        typeof e['guideline'] === 'string' &&
        typeof e['rationale'] === 'string',
    )
    .map((e) => ({
      type: e['type'] === 'dont' ? ('dont' as const) : ('do' as const),
      guideline: e['guideline'] as string,
      rationale: e['rationale'] as string,
    }));

  return { tone_spectrum, vocabulary_examples, communication_guidelines };
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a Brand Voice Guide draft from the audit report (AC-1).
 *
 * @param report - The audit report from BSS-7.3
 * @param aiService - AI text generation service
 * @param clientId - Client identifier
 * @param logger - Optional logger
 * @returns BrandVoiceDraft (without low_confidence_warning — pipeline adds that)
 */
export async function generateBrandVoiceDraft(
  report: AuditReport,
  aiService: AuditAIService,
  clientId: string,
  logger?: AuditLogger,
): Promise<BrandVoiceDraft> {
  logger?.info('Generating Brand Voice Guide draft from audit report');

  const prompt = buildPrompt(report);

  const response = await aiService.generateText(prompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 2000,
    temperature: 0.4,
    clientId,
  });

  const parsed = parseBrandVoiceResponse(response.text);

  const draft: BrandVoiceDraft = {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: DRAFT_PREAMBLE,
    validation_status: 'pending',
    generated_at: new Date().toISOString(),
    client_id: clientId,
    source_audit_version: report.generatedAt,
    draft_type: 'brand-voice',
    tone_spectrum: parsed.tone_spectrum,
    vocabulary_examples: parsed.vocabulary_examples,
    communication_guidelines: parsed.communication_guidelines,
  };

  logger?.info(`Brand Voice draft generated: ${parsed.tone_spectrum.length} spectrum entries, ${parsed.vocabulary_examples.length} vocab examples, ${parsed.communication_guidelines.length} guidelines`);

  return draft;
}

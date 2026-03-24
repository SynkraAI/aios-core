/**
 * Messaging Framework draft generator (BSS-7.4 AC-2).
 *
 * Generates a draft Messaging Framework from the audit report's messaging
 * consistency analysis, value propositions, and recurring themes.
 *
 * @module onboarding/drafts/messaging-drafter
 */

import type { AuditReport, AuditAIService, AuditLogger } from '../audit/audit-types';
import type { MessagingFrameworkDraft, MessagingPillar } from './draft-types';
import { DRAFT_PREAMBLE } from './draft-types';

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a senior brand strategist specializing in messaging architecture. Based on the audit data provided, generate a Messaging Framework draft.
Label ALL output as "AI Draft - Requires Human Validation".
Respond with ONLY valid JSON, no markdown fences, no additional text.`;

function buildPrompt(report: AuditReport): string {
  const messaging = report.messagingConsistency;
  const tone = report.toneOfVoice;
  const pages = report.pageAnalyses.filter((p) => p.accessible);

  const headingSamples = pages
    .slice(0, 5)
    .flatMap((p) => p.headings.map((h) => h.text))
    .slice(0, 15)
    .join('; ');

  const contentSnippets = pages
    .slice(0, 3)
    .map((p) => `${p.url}: ${p.textContent.slice(0, 150)}`)
    .join('\n');

  return `Generate a Messaging Framework draft from the following audit data.

MESSAGING CONSISTENCY ANALYSIS:
- Consistency Score: ${messaging.consistencyScore}/5
- Recurring Value Propositions: ${messaging.recurringValuePropositions.join('; ') || 'None identified'}
- Contradictions: ${messaging.contradictions.length > 0 ? messaging.contradictions.map((c) => c.description).join('; ') : 'None'}
- Confidence: ${messaging.confidence}
- Reasoning: ${messaging.reasoning}

TONE CONTEXT:
- Tone: ${tone.formalCasualLabel}
- Emotional Register: ${tone.emotionalRegister.join(', ')}

KEY HEADINGS FROM CLIENT CONTENT:
${headingSamples}

CONTENT SNIPPETS:
${contentSnippets}

Return a JSON object with this exact structure:
{
  "value_proposition": "<primary value proposition hypothesis based on audit findings>",
  "supporting_pillars": [
    {
      "title": "<pillar title>",
      "description": "<what this pillar conveys>",
      "supporting_evidence": "<evidence from audit data>"
    }
  ],
  "elevator_pitch": "<one paragraph elevator pitch draft>"
}

Include exactly 3 supporting pillars derived from recurring themes in the audit.`;
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseMessagingResponse(text: string): {
  value_proposition: string;
  supporting_pillars: MessagingPillar[];
  elevator_pitch: string;
} {
  const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  const value_proposition =
    typeof parsed['value_proposition'] === 'string' ? parsed['value_proposition'] : '';

  const elevator_pitch =
    typeof parsed['elevator_pitch'] === 'string' ? parsed['elevator_pitch'] : '';

  const rawPillars = Array.isArray(parsed['supporting_pillars'])
    ? parsed['supporting_pillars']
    : [];

  const supporting_pillars: MessagingPillar[] = (rawPillars as Array<Record<string, unknown>>)
    .filter(
      (p) =>
        typeof p['title'] === 'string' &&
        typeof p['description'] === 'string',
    )
    .slice(0, 3) // Cap at 3 pillars
    .map((p) => ({
      title: p['title'] as string,
      description: p['description'] as string,
      supporting_evidence:
        typeof p['supporting_evidence'] === 'string' ? (p['supporting_evidence'] as string) : '',
    }));

  return { value_proposition, supporting_pillars, elevator_pitch };
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a Messaging Framework draft from the audit report (AC-2).
 *
 * @param report - The audit report from BSS-7.3
 * @param aiService - AI text generation service
 * @param clientId - Client identifier
 * @param logger - Optional logger
 * @returns MessagingFrameworkDraft
 */
export async function generateMessagingFrameworkDraft(
  report: AuditReport,
  aiService: AuditAIService,
  clientId: string,
  logger?: AuditLogger,
): Promise<MessagingFrameworkDraft> {
  logger?.info('Generating Messaging Framework draft from audit report');

  const prompt = buildPrompt(report);

  const response = await aiService.generateText(prompt, {
    systemPrompt: SYSTEM_PROMPT,
    maxTokens: 1500,
    temperature: 0.4,
    clientId,
  });

  const parsed = parseMessagingResponse(response.text);

  const draft: MessagingFrameworkDraft = {
    _ai_draft: true,
    _requires_validation: true,
    _label: 'AI Draft - Requires Human Validation',
    _preamble: DRAFT_PREAMBLE,
    validation_status: 'pending',
    generated_at: new Date().toISOString(),
    client_id: clientId,
    source_audit_version: report.generatedAt,
    draft_type: 'messaging-framework',
    value_proposition: parsed.value_proposition,
    supporting_pillars: parsed.supporting_pillars,
    elevator_pitch: parsed.elevator_pitch,
  };

  logger?.info(`Messaging Framework draft generated: ${parsed.supporting_pillars.length} pillars`);

  return draft;
}
